"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitContact } from "@/actions/contacts";
import { contactFormSchema, type ContactFormData } from "@/types/contact";

const inputCls =
  "w-full rounded-none border-b border-stone-700 bg-transparent px-0 py-3 font-inter text-sm text-stone-100 placeholder-stone-600 outline-none transition-colors duration-200 focus:border-amber-400 focus:placeholder-stone-500";
const labelCls = "block font-inter text-xs uppercase tracking-widest text-stone-500 mb-2";
const errorCls = "mt-1 font-inter text-xs text-red-400";

const SUBJECT_OPTIONS = [
  "Quero comprar um imóvel",
  "Quero alugar um imóvel",
  "Quero anunciar meu imóvel",
  "Dúvidas sobre um imóvel",
  "Parceria comercial",
  "Outro assunto",
];

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  function onSubmit(data: ContactFormData) {
    setServerError("");
    startTransition(async () => {
      const result = await submitContact(data);
      if (result.success) {
        setSent(true);
        reset();
      } else {
        setServerError(result.error);
      }
    });
  }

  if (sent) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-stone-800 bg-stone-900/30 px-8 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="font-cormorant text-2xl font-light text-stone-100">Mensagem enviada</p>
        <p className="mt-2 font-inter text-sm text-stone-400">
          Entraremos em contato em breve.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-8 font-inter text-xs uppercase tracking-widest text-amber-400/70 hover:text-amber-400 transition-colors"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Nome + Email */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nome *</label>
          <input {...register("name")} placeholder="Seu nome completo" className={inputCls} />
          {errors.name && <p className={errorCls}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelCls}>E-mail *</label>
          <input {...register("email")} type="email" placeholder="seu@email.com" className={inputCls} />
          {errors.email && <p className={errorCls}>{errors.email.message}</p>}
        </div>
      </div>

      {/* Telefone + Assunto */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Telefone / WhatsApp</label>
          <input {...register("phone")} type="tel" placeholder="(13) 99999-9999" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Assunto *</label>
          <select
            {...register("subject")}
            className={`${inputCls} cursor-pointer`}
            defaultValue=""
          >
            <option value="" disabled className="bg-stone-900 text-stone-500">Selecione um assunto</option>
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-stone-900 text-stone-100">{s}</option>
            ))}
          </select>
          {errors.subject && <p className={errorCls}>{errors.subject.message}</p>}
        </div>
      </div>

      {/* Mensagem */}
      <div>
        <label className={labelCls}>Mensagem *</label>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="Conte-nos como podemos ajudar..."
          className={`${inputCls} resize-none`}
        />
        {errors.message && <p className={errorCls}>{errors.message.message}</p>}
      </div>

      {serverError && (
        <p className="font-inter text-sm text-red-400">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full border border-amber-500/50 bg-amber-500/10 py-4 font-inter text-xs font-medium uppercase tracking-[0.2em] text-amber-400 transition-all duration-200 hover:border-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
      >
        {isPending ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
