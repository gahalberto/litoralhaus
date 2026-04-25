"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitLead } from "@/actions/submit-lead";
import { leadFormSchema, type LeadFormData } from "@/types/lead";

const budgetOptions = [
  { value: "UP_TO_500K", label: "Até R$ 500 mil" },
  { value: "RANGE_500K_1M", label: "R$ 500 mil – R$ 1 milhão" },
  { value: "RANGE_1M_2M", label: "R$ 1M – R$ 2 milhões" },
  { value: "RANGE_2M_5M", label: "R$ 2M – R$ 5 milhões" },
  { value: "ABOVE_5M", label: "Acima de R$ 5 milhões" },
] as const;

const regionOptions = [
  { value: "GUARUJA", label: "Guarujá" },
  { value: "SANTOS", label: "Santos" },
  { value: "BERTIOGA", label: "Bertioga" },
  { value: "SAO_VICENTE", label: "São Vicente" },
  { value: "PRAIA_GRANDE", label: "Praia Grande" },
  { value: "UBATUBA", label: "Ubatuba" },
  { value: "ILHABELA", label: "Ilhabela" },
  { value: "SAO_SEBASTIAO", label: "São Sebastião" },
] as const;

const inputCls =
  "w-full rounded-none border-b border-stone-700 bg-transparent px-0 py-3 font-inter text-sm text-stone-100 placeholder-stone-600 outline-none transition-colors duration-200 focus:border-amber-400 focus:placeholder-stone-500";

const labelCls = "block font-inter text-xs uppercase tracking-widest text-stone-500 mb-2";

const errorCls = "mt-1 font-inter text-xs text-red-400";

export function LeadCaptureForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
    setError,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  });

  function onSubmit(data: LeadFormData) {
    startTransition(async () => {
      const result = await submitLead(data);
      if (!result.success) {
        setError("root", { message: result.error });
      } else {
        reset();
      }
    });
  }

  return (
    <section
      id="captura"
      aria-labelledby="captura-heading"
      className="relative bg-stone-900 px-6 py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(180,140,80,0.07),transparent)]"
      />

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-14 text-center">
          <p className="mb-4 font-inter text-xs font-medium uppercase tracking-[0.3em] text-amber-400/80">
            Acesso antecipado
          </p>
          <h2
            id="captura-heading"
            className="font-cormorant text-4xl font-light text-stone-50 sm:text-5xl"
          >
            Seja o{" "}
            <em className="font-light not-italic text-amber-300">primeiro a saber</em>{" "}
            das oportunidades.
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-inter text-sm font-light leading-relaxed text-stone-400">
            Cadastre seu perfil de investidor. Quando o imóvel certo aparecer, você
            será notificado antes de qualquer divulgação pública.
          </p>
        </div>

        {isSubmitSuccessful ? (
          <div className="border border-amber-400/30 bg-amber-400/5 p-10 text-center">
            <p className="font-cormorant text-2xl font-light text-amber-300">
              Cadastro recebido com sucesso.
            </p>
            <p className="mt-3 font-inter text-sm text-stone-400">
              Nossa equipe entrará em contato em breve com oportunidades alinhadas ao
              seu perfil.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-8"
            aria-label="Formulário de captação de lead"
          >
            {/* Nome */}
            <div>
              <label htmlFor="name" className={labelCls}>Nome completo</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                className={inputCls}
                {...register("name")}
              />
              {errors.name && <p className={errorCls}>{errors.name.message}</p>}
            </div>

            {/* E-mail + WhatsApp */}
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelCls}>E-mail</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className={inputCls}
                  {...register("email")}
                />
                {errors.email && <p className={errorCls}>{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="phone" className={labelCls}>WhatsApp (somente números)</label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="11999999999"
                  className={inputCls}
                  {...register("phone")}
                />
                {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
              </div>
            </div>

            {/* Orçamento */}
            <div>
              <label htmlFor="budgetRange" className={labelCls}>Orçamento estimado</label>
              <select
                id="budgetRange"
                className={`${inputCls} cursor-pointer appearance-none`}
                {...register("budgetRange")}
                defaultValue=""
              >
                <option value="" disabled>Selecione uma faixa</option>
                {budgetOptions.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-stone-900 text-stone-100"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.budgetRange && (
                <p className={errorCls}>{errors.budgetRange.message}</p>
              )}
            </div>

            {/* Regiões */}
            <fieldset>
              <legend className={labelCls}>Regiões de interesse</legend>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {regionOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 border border-stone-700 px-3 py-2 font-inter text-xs text-stone-400 transition-colors duration-200 hover:border-amber-400/50 hover:text-stone-200 has-[:checked]:border-amber-400 has-[:checked]:text-amber-300"
                  >
                    <input
                      type="checkbox"
                      value={opt.value}
                      className="accent-amber-400"
                      {...register("regions")}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.regions && (
                <p className={errorCls}>{errors.regions.message}</p>
              )}
            </fieldset>

            {/* Mensagem */}
            <div>
              <label htmlFor="notes" className={labelCls}>
                Descreva o imóvel ideal{" "}
                <span className="normal-case text-stone-600">(opcional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Ex: apartamento frente mar, 3 suítes, churrasqueira..."
                className={`${inputCls} resize-none`}
                {...register("notes")}
              />
            </div>

            {errors.root && (
              <p className="border border-red-800 bg-red-950/30 px-4 py-3 font-inter text-xs text-red-400">
                {errors.root.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full border border-amber-400 bg-amber-400 px-8 py-4 font-inter text-sm font-medium uppercase tracking-widest text-stone-950 transition-all duration-300 hover:bg-transparent hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Enviando..." : "Quero acesso antecipado"}
            </button>

            <p className="text-center font-inter text-xs text-stone-600">
              Seus dados são tratados com total confidencialidade.{" "}
              <a href="/privacidade" className="underline underline-offset-2 hover:text-stone-400">
                Política de Privacidade
              </a>
              .
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
