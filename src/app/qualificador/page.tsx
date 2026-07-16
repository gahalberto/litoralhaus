"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { ArrowRight, Check, Home, TrendingUp, Waves, Loader2 } from "lucide-react";
import { qualifyLead } from "@/actions/qualifyLead";

type Goal = "Sair do aluguel" | "Investir" | "Veraneio";
type IncomeComposition = "Sozinho(a)" | "Com cônjuge" | "Com filho(s)" | "Outro";

interface Answers {
  name: string;
  whatsapp: string;
  goal: Goal | "";
  income: string;
  incomeComposition: IncomeComposition | "";
  birthYear: string;
  downPayment: string;
}

const INITIAL_ANSWERS: Answers = {
  name: "",
  whatsapp: "",
  goal: "",
  income: "",
  incomeComposition: "",
  birthYear: "",
  downPayment: "",
};

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

// steps: 0 = welcome, 1..7 = perguntas, 8 = enviando/sucesso
const TOTAL_QUESTION_STEPS = 7;

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
  const inputRef = useRef<HTMLInputElement>(null);

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
        return currencyToNumber(answers.income) > 0;
      case 5:
        return answers.incomeComposition !== "";
      case 6:
        return answers.birthYear.length === 4;
      case 7:
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
        income: currencyToNumber(answers.income),
        incomeComposition: answers.incomeComposition,
        birthYear: Number(answers.birthYear),
        downPayment: currencyToNumber(answers.downPayment),
      });
      setSubmitting(false);
      if (result.success) {
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

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="h-8 w-8 text-emerald-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-medium text-white sm:text-3xl">
            Tudo certo, {answers.name.trim().split(" ")[0]}!
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-400">
            Recebi suas informações e vou analisar o seu perfil com cuidado. Te
            chamo no WhatsApp em breve.
          </p>
        </div>
      </div>
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
                Olá! Sou o Gabriel da Litoral Haus. Quero te ajudar a encontrar
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
              label="Qual é a sua renda mensal bruta aproximada?"
              onNext={goNext}
              disabled={!canAdvance()}
            >
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={answers.income}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, income: formatCurrencyInput(e.target.value) }))
                }
                placeholder="R$ 0,00"
                className={inputClass}
              />
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

          {step === 7 && (
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
              {step < TOTAL_QUESTION_STEPS + 1 && [1, 2, 4, 6, 7].includes(step) && (
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
