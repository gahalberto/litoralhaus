"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { ArrowRight, Check, Home, TrendingUp, Waves, Loader2, Plus, X } from "lucide-react";
import { qualifyLead } from "@/actions/qualifyLead";
import { analyzeCredit, type CreditAnalysisResult } from "@/lib/credit-analysis";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Goal = "Sair do aluguel" | "Investir" | "Veraneio";
type IncomeComposition = "Sozinho(a)" | "Com cônjuge" | "Com filho(s)" | "Outro";
type IncomeType =
  | "CLT"
  | "PJ"
  | "MEI"
  | "Informal"
  | "Autônomo"
  | "Motorista/entregador de app"
  | "Não trabalho"
  | "Outro";

const INCOME_TYPES: IncomeType[] = [
  "CLT",
  "PJ",
  "MEI",
  "Informal",
  "Autônomo",
  "Motorista/entregador de app",
  "Não trabalho",
  "Outro",
];

interface IncomeEntry {
  id: number;
  type: IncomeType | "";
  value: string;
}

function isIncomeEntryValid(entry: IncomeEntry): boolean {
  if (!entry.type) return false;
  if (entry.type === "Não trabalho") return true;
  return currencyToNumber(entry.value) > 0;
}

interface Answers {
  name: string;
  whatsapp: string;
  goal: Goal | "";
  incomes: IncomeEntry[];
  incomeComposition: IncomeComposition | "";
  firstProperty: boolean | null;
  coApplicantFirstProperty: boolean | null;
  birthYear: string;
  downPayment: string;
}

const INITIAL_ANSWERS: Answers = {
  name: "",
  whatsapp: "",
  goal: "",
  incomes: [{ id: 0, type: "", value: "" }],
  incomeComposition: "",
  firstProperty: null,
  coApplicantFirstProperty: null,
  birthYear: "",
  downPayment: "",
};

function incomeLabel(index: number): string {
  if (index === 0) return "Sua renda";
  return `Renda ${index + 1} (cônjuge, filho...)`;
}

const GOALS: { value: Goal; icon: typeof Home }[] = [
  { value: "Sair do aluguel", icon: Home },
  { value: "Investir", icon: TrendingUp },
  { value: "Veraneio", icon: Waves },
];

const COMPOSITIONS: IncomeComposition[] = [
  "Sozinho(a)",
  "Com cônjuge",
  "Com filho(s)",
  "Outro",
];

// steps: 0 = welcome, 1..8 = perguntas
const TOTAL_QUESTION_STEPS = 8;

function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const numeric = Number(digits) / 100;
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function currencyToNumber(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  return digits ? Number(digits) / 100 : 0;
}

export default function QualificadorPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<CreditAnalysisResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextIncomeId = useRef(1);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const canAdvance = useCallback((): boolean => {
    switch (step) {
      case 1:
        return answers.name.trim().length >= 2;
      case 2:
        return answers.whatsapp.replace(/\D/g, "").length >= 10;
      case 3:
        return answers.goal !== "";
      case 4:
        return (
          answers.incomes.every(isIncomeEntryValid) &&
          answers.incomes.some((i) => currencyToNumber(i.value) > 0)
        );
      case 5:
        return answers.incomeComposition !== "";
      case 6:
        return (
          answers.firstProperty !== null &&
          (answers.incomeComposition === "Sozinho(a)" ||
            answers.coApplicantFirstProperty !== null)
        );
      case 7:
        return answers.birthYear.length === 4;
      case 8:
        return answers.downPayment !== "";
      default:
        return true;
    }
  }, [step, answers]);

  const goNext = useCallback(async () => {
    if (!canAdvance()) return;
    setError("");
    if (step === TOTAL_QUESTION_STEPS) {
      setSubmitting(true);
      const result = await qualifyLead({
        name: answers.name.trim(),
        whatsapp: answers.whatsapp.replace(/\D/g, ""),
        goal: answers.goal,
        income: answers.incomes.reduce((sum, i) => sum + currencyToNumber(i.value), 0),
        incomeTypes: answers.incomes.map((i) => i.type).filter(Boolean),
        incomeComposition: answers.incomeComposition,
        firstProperty: answers.firstProperty as boolean,
        coApplicantFirstProperty: answers.coApplicantFirstProperty,
        birthYear: Number(answers.birthYear),
        downPayment: currencyToNumber(answers.downPayment),
      });
      setSubmitting(false);
      if (result.success) {
        const totalIncome = answers.incomes.reduce(
          (sum, i) => sum + currencyToNumber(i.value),
          0
        );
        setAnalysis(
          analyzeCredit({
            name: answers.name.trim(),
            birthYear: Number(answers.birthYear),
            income: totalIncome,
            workRegime: answers.incomes[0]?.type ?? "",
            firstProperty: answers.firstProperty as boolean,
            downPayment: currencyToNumber(answers.downPayment),
          })
        );
        setSubmitted(true);
      } else {
        setError(result.error);
      }
      return;
    }
    setStep((s) => s + 1);
  }, [step, answers, canAdvance]);

  const goBack = useCallback(() => {
    if (step === 0) return;
    setStep((s) => s - 1);
  }, [step]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goNext();
    }
  };

  const progress = Math.min(100, (step / TOTAL_QUESTION_STEPS) * 100);

  if (submitted && analysis) {
    return (
      <CreditDevolutiva
        firstName={answers.name.trim().split(" ")[0]}
        analysis={analysis}
      />
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-[#09090b]"
      onKeyDown={handleKeyDown}
    >
      <div className="h-1 w-full bg-zinc-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          {step === 0 && (
            <div
              key="welcome"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-start"
            >
              <p className="mb-3 text-sm font-medium tracking-wide text-emerald-500 uppercase">
                Litoral Haus
              </p>
              <h1 className="text-3xl font-medium leading-tight text-white sm:text-4xl">
                Olá! Sou o Alberto da Litoral Haus. Quero te ajudar a encontrar
                o imóvel ideal para você.
              </h1>
              <p className="mt-4 text-lg text-zinc-400">
                São só algumas perguntas rápidas. Vamos começar?
              </p>
              <button
                onClick={goNext}
                autoFocus
                className="mt-8 flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-medium text-black transition hover:bg-emerald-400"
              >
                Vamos lá
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 1 && (
            <Question
              key="name"
              label="Como eu devo te chamar?"
              onNext={goNext}
              disabled={!canAdvance()}
            >
              <input
                ref={inputRef}
                type="text"
                value={answers.name}
                onChange={(e) => setAnswers((a) => ({ ...a, name: e.target.value }))}
                placeholder="Seu nome"
                className={inputClass}
              />
            </Question>
          )}

          {step === 2 && (
            <Question
              key="whatsapp"
              label="Qual o seu melhor número de WhatsApp?"
              onNext={goNext}
              disabled={!canAdvance()}
            >
              <input
                ref={inputRef}
                type="tel"
                value={answers.whatsapp}
                onChange={(e) =>
                  setAnswers((a) => ({
                    ...a,
                    whatsapp: e.target.value.replace(/[^\d\s()+-]/g, ""),
                  }))
                }
                placeholder="(13) 99999-9999"
                className={inputClass}
              />
            </Question>
          )}

          {step === 3 && (
            <Question key="goal" label="Qual é o seu objetivo principal agora?">
              <div className="flex flex-col gap-3">
                {GOALS.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setAnswers((a) => ({ ...a, goal: value }));
                      setStep((s) => s + 1);
                    }}
                    className={optionClass(answers.goal === value)}
                  >
                    <Icon className="h-5 w-5" />
                    {value}
                  </button>
                ))}
              </div>
            </Question>
          )}

          {step === 4 && (
            <Question
              key="income"
              label="Qual é a renda mensal bruta familiar aproximada?"
              hint="Some quantas rendas forem entrar no financiamento — a sua, do cônjuge, de um filho..."
              onNext={goNext}
              disabled={!canAdvance()}
            >
              <div className="flex flex-col gap-4">
                {answers.incomes.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-zinc-800 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-zinc-500">
                        {incomeLabel(index)}
                      </label>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setAnswers((a) => ({
                              ...a,
                              incomes: a.incomes.filter((i) => i.id !== entry.id),
                            }))
                          }
                          aria-label="Remover renda"
                          className="text-zinc-500 transition hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {INCOME_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setAnswers((a) => ({
                              ...a,
                              incomes: a.incomes.map((i) =>
                                i.id === entry.id
                                  ? {
                                      ...i,
                                      type,
                                      value: type === "Não trabalho" ? "" : i.value,
                                    }
                                  : i
                              ),
                            }))
                          }
                          className={chipClass(entry.type === type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {entry.type && entry.type !== "Não trabalho" && (
                      <input
                        ref={index === 0 ? inputRef : undefined}
                        type="text"
                        inputMode="numeric"
                        value={entry.value}
                        onChange={(e) => {
                          const formatted = formatCurrencyInput(e.target.value);
                          setAnswers((a) => ({
                            ...a,
                            incomes: a.incomes.map((i) =>
                              i.id === entry.id ? { ...i, value: formatted } : i
                            ),
                          }));
                        }}
                        placeholder="R$ 0,00"
                        className={`${inputClass} mt-4`}
                      />
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setAnswers((a) => ({
                      ...a,
                      incomes: [
                        ...a.incomes,
                        { id: nextIncomeId.current++, type: "", value: "" },
                      ],
                    }))
                  }
                  className="mt-1 flex w-fit items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-emerald-500 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar mais uma renda (cônjuge, filho...)
                </button>
              </div>
            </Question>
          )}

          {step === 5 && (
            <Question key="composition" label="Você vai compor essa renda com mais alguém?">
              <div className="flex flex-col gap-3">
                {COMPOSITIONS.map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setAnswers((a) => ({ ...a, incomeComposition: value }));
                      setStep((s) => s + 1);
                    }}
                    className={optionClass(answers.incomeComposition === value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </Question>
          )}

          {step === 6 && (
            <Question
              key="firstProperty"
              label="Este seria o seu primeiro imóvel?"
              hint="Importante: quem já tem outro imóvel no nome não pode participar do Minha Casa Minha Vida."
            >
              <div className="flex flex-col gap-6">
                <div>
                  <p className="mb-3 text-sm text-zinc-500">Você</p>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setAnswers((a) => ({ ...a, firstProperty: true }))
                      }
                      className={optionClass(answers.firstProperty === true)}
                    >
                      Sim, seria o meu primeiro imóvel
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAnswers((a) => ({ ...a, firstProperty: false }))
                      }
                      className={optionClass(answers.firstProperty === false)}
                    >
                      Não, já tenho outro imóvel no meu nome
                    </button>
                  </div>
                </div>

                {answers.incomeComposition !== "" &&
                  answers.incomeComposition !== "Sozinho(a)" && (
                    <div>
                      <p className="mb-3 text-sm text-zinc-500">
                        Pessoa que vai compor renda com você
                      </p>
                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setAnswers((a) => ({
                              ...a,
                              coApplicantFirstProperty: true,
                            }))
                          }
                          className={optionClass(
                            answers.coApplicantFirstProperty === true
                          )}
                        >
                          Sim, também seria o primeiro imóvel dela
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAnswers((a) => ({
                              ...a,
                              coApplicantFirstProperty: false,
                            }))
                          }
                          className={optionClass(
                            answers.coApplicantFirstProperty === false
                          )}
                        >
                          Não, ela já tem outro imóvel no nome dela
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </Question>
          )}

          {step === 7 && (
            <Question
              key="birthYear"
              label="Qual o ano de nascimento do comprador mais velho?"
              hint="Importante para o cálculo do financiamento (Caixa)."
              onNext={goNext}
              disabled={!canAdvance()}
            >
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={answers.birthYear}
                onChange={(e) =>
                  setAnswers((a) => ({
                    ...a,
                    birthYear: e.target.value.replace(/\D/g, "").slice(0, 4),
                  }))
                }
                placeholder="1985"
                className={inputClass}
              />
            </Question>
          )}

          {step === 8 && (
            <Question
              key="downPayment"
              label="Quanto você tem disponível para dar de entrada hoje?"
              onNext={goNext}
              disabled={!canAdvance()}
            >
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={answers.downPayment}
                onChange={(e) =>
                  setAnswers((a) => ({
                    ...a,
                    downPayment: formatCurrencyInput(e.target.value),
                  }))
                }
                placeholder="R$ 0,00"
                className={inputClass}
              />
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            </Question>
          )}

          {step > 0 && (
            <div className="mt-10 flex items-center gap-4">
              {step < TOTAL_QUESTION_STEPS + 1 && [1, 2, 4, 6, 7, 8].includes(step) && (
                <button
                  onClick={goNext}
                  disabled={!canAdvance() || submitting}
                  className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {step === TOTAL_QUESTION_STEPS ? "Enviar" : "OK"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
              <button
                onClick={goBack}
                className="text-sm text-zinc-500 transition hover:text-zinc-300"
              >
                Voltar
              </button>
              <span className="text-xs text-zinc-600">pressione Enter ↵</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full border-b border-zinc-700 bg-transparent pb-3 text-2xl text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none sm:text-3xl";

function chipClass(active: boolean) {
  return [
    "rounded-full border px-3 py-1.5 text-sm transition",
    active
      ? "border-emerald-500 bg-emerald-500/10 text-white"
      : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
  ].join(" ");
}

function optionClass(active: boolean) {
  return [
    "flex items-center gap-3 rounded-xl border px-5 py-4 text-left text-lg transition",
    active
      ? "border-emerald-500 bg-emerald-500/10 text-white"
      : "border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900",
  ].join(" ");
}

function Question({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  onNext?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-medium leading-snug text-white sm:text-3xl">
        {label}
      </h2>
      {hint && <p className="mt-2 text-sm text-zinc-500">{hint}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

const WHATSAPP_NUMBER = "5513955422935";

function DevolutivaSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-zinc-800 pt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-500">
        {title}
      </h2>
      <div className="mt-3 text-base leading-relaxed text-zinc-300">{children}</div>
    </section>
  );
}

function CreditDevolutiva({
  firstName,
  analysis,
}: {
  firstName: string;
  analysis: CreditAnalysisResult;
}) {
  const {
    program,
    faixa,
    estimatedPropertyCeiling,
    maxInstallment,
    maxTermYears,
    requiredDownPayment,
    downPaymentGap,
    registryDiscount,
    documents,
  } = analysis;

  const hasEnoughDownPayment = downPaymentGap <= 0;
  const whatsappMessage = encodeURIComponent(
    `Olá! Sou ${firstName} e acabei de fazer a simulação de financiamento no site da Litoral Haus. Quero entender melhor as minhas opções!`
  );

  return (
    <div className="flex min-h-screen justify-center bg-[#09090b] px-6 py-16">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="h-7 w-7 text-emerald-500" strokeWidth={2.5} />
        </div>

        <h1 className="text-2xl font-medium leading-snug text-white sm:text-3xl">
          {firstName}, sua Devolutiva de Crédito Personalizada está pronta!
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          Parabéns pela iniciativa de buscar a casa própria — analisei o seu
          perfil com carinho e já consigo te mostrar o caminho mais realista
          até as chaves.
        </p>

        <div className="mt-8 flex flex-col gap-6">
          <DevolutivaSection title="Seu diagnóstico de crédito">
            <p>
              Com base na sua renda familiar, você se encaixa em{" "}
              <strong className="text-white">
                {program === "MCMV"
                  ? `Minha Casa, Minha Vida — ${faixa}`
                  : "financiamento via bancos privados (SBPE)"}
              </strong>
              .
            </p>
            <p className="mt-2">
              Considerando uma parcela de até 30% da sua renda e um prazo
              estimado de até <strong className="text-white">{maxTermYears} anos</strong>,
              você consegue buscar imóveis de até{" "}
              <strong className="text-white">
                {formatBRL(estimatedPropertyCeiling)}
              </strong>
              , com parcelas em torno de{" "}
              <strong className="text-white">{formatBRL(maxInstallment)}</strong>
              /mês.
            </p>
          </DevolutivaSection>

          <DevolutivaSection title="Como funciona a sua entrada (a regra dos 20%)">
            <p>
              Os bancos costumam exigir pelo menos 20% do valor do imóvel como
              entrada — no seu caso, isso é aproximadamente{" "}
              <strong className="text-white">
                {formatBRL(requiredDownPayment)}
              </strong>
              .
            </p>
            <p className="mt-2">
              {hasEnoughDownPayment
                ? "Pelo valor que você já tem disponível, essa entrada já está coberta — ótimo sinal!"
                : `Considerando o valor que você já tem hoje, ainda falta juntar cerca de ${formatBRL(
                    downPaymentGap
                  )}. Isso pode vir do seu FGTS, de subsídio do governo (se você se enquadrar) ou parcelado direto com a construtora, no caso de imóvel na planta.`}
            </p>
            {registryDiscount && (
              <p className="mt-2">
                Por ser o seu primeiro imóvel, você ainda tem direito a um
                desconto de até 50% nas taxas de cartório de registro.
              </p>
            )}
          </DevolutivaSection>

          {documents.length > 0 && (
            <DevolutivaSection title="Documentos para o seu perfil">
              <ul className="flex flex-col gap-2">
                {documents.map((doc) => (
                  <li key={doc} className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </DevolutivaSection>
          )}

          <DevolutivaSection title="Seu próximo passo">
            <p>
              Esses números já te dão uma direção clara, mas o valor exato
              depende de uma simulação oficial junto ao banco. Vamos fazer
              essa simulação juntos, sem compromisso?
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-fit items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-black transition hover:bg-emerald-400"
            >
              Falar com um especialista no WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>
          </DevolutivaSection>
        </div>
      </div>
    </div>
  );
}
