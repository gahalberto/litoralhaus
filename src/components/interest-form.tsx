"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { submitInterest } from "@/actions/submit-interest";

const schema = z.object({
  name:     z.string().min(2, "Nome obrigatório"),
  whatsapp: z.string().min(10, "WhatsApp inválido").regex(/^\d+$/, "Somente números"),
  message:  z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "w-full rounded-none border-b border-border bg-transparent px-0 py-2.5 font-inter text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-amber-500";

export function InterestForm({ propertyId }: { propertyId: string }) {
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const result = await submitInterest({ ...data, propertyId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDone(true);
      toast.success("Contato registrado! Nossa equipe falará com você em breve.");
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke="#F6A600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-cormorant text-xl font-light text-foreground">Mensagem enviada.</p>
        <p className="font-inter text-xs text-muted-foreground">Entraremos em contato via WhatsApp.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1">
        <input {...register("name")} placeholder="Seu nome" className={inputCls} />
        {errors.name && <p className="font-inter text-[11px] text-red-400">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <div className="flex items-center">
          <span className="border-b border-border py-2.5 pr-2 font-inter text-sm text-muted-foreground">+55</span>
          <input {...register("whatsapp")} type="tel" inputMode="numeric" placeholder="11999999999" className={`${inputCls} flex-1`} />
        </div>
        {errors.whatsapp && <p className="font-inter text-[11px] text-red-400">{errors.whatsapp.message}</p>}
      </div>

      <div>
        <textarea
          {...register("message")}
          placeholder="Mensagem opcional (horário para visita, dúvidas…)"
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full border border-amber-500 bg-amber-500 py-3 font-inter text-xs font-medium uppercase tracking-widest text-white transition-all hover:bg-transparent hover:text-amber-600 dark:border-amber-400 dark:bg-amber-400 dark:text-stone-950 dark:hover:text-amber-400 disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Tenho interesse"}
      </button>
    </form>
  );
}
