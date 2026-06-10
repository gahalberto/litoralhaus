"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { submitSellerLead } from "@/actions/submit-seller-lead";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  whatsapp: z
    .string()
    .min(10, "WhatsApp inválido — mínimo 10 dígitos")
    .regex(/^\d+$/, "Somente números, sem espaços ou traços"),
  city: z.enum(["GUARUJA", "SANTOS", "OUTRA"], {
    error: "Selecione a cidade do imóvel",
  }),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "w-full rounded-none border-b border-stone-700 bg-transparent px-0 py-2.5 font-inter text-sm text-stone-100 placeholder:text-stone-600 outline-none transition-colors focus:border-amber-400";

const selectCls = cn(
  inputCls,
  "cursor-pointer appearance-none text-stone-500 focus:text-stone-100 [&:not([value=''])]:text-stone-100"
);

interface SellerLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SellerLeadModal({ open, onOpenChange }: SellerLeadModalProps) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const result = await submitSellerLead(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setSubmitted(true);
      reset();
      setTimeout(() => {
        onOpenChange(false);
        setSubmitted(false);
      }, 2800);
      toast.success("Recebemos seu contato! Nossa equipe falará com você em breve.");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-stone-800 bg-stone-950 p-0 sm:max-w-lg">
        {/* Accent line */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-amber-400 to-transparent" />

        <div className="px-8 pb-10 pt-8">
          <DialogHeader className="mb-8 space-y-3">
            <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-amber-400/70">
              Captação Exclusiva
            </p>
            <DialogTitle className="font-cormorant text-3xl font-light leading-snug text-stone-50">
              Venda seu imóvel no litoral com inteligência.
            </DialogTitle>
            <DialogDescription className="font-inter text-sm font-light leading-relaxed text-stone-400">
              Avaliamos seu imóvel, conectamos com investidores qualificados e cuidamos de todo o processo. Sem esforço da sua parte.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="#F6A600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-cormorant text-xl font-light text-stone-100">
                Contato recebido.
              </p>
              <p className="font-inter text-xs text-stone-500">
                Nossa equipe entrará em contato via WhatsApp em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Nome */}
              <div className="space-y-1">
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Seu nome"
                  autoComplete="name"
                  className={inputCls}
                />
                {errors.name && (
                  <p className="font-inter text-[11px] text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <div className="flex items-center gap-0">
                  <span className="border-b border-stone-700 py-2.5 font-inter text-sm text-stone-500 pr-2">
                    +55
                  </span>
                  <input
                    {...register("whatsapp")}
                    type="tel"
                    inputMode="numeric"
                    placeholder="11999999999"
                    autoComplete="tel"
                    className={cn(inputCls, "flex-1")}
                  />
                </div>
                {errors.whatsapp && (
                  <p className="font-inter text-[11px] text-red-400">{errors.whatsapp.message}</p>
                )}
              </div>

              {/* Cidade */}
              <div className="space-y-1">
                <select
                  {...register("city")}
                  defaultValue=""
                  className={selectCls}
                >
                  <option value="" disabled className="bg-stone-950">
                    Cidade do imóvel
                  </option>
                  <option value="GUARUJA" className="bg-stone-950 text-stone-100">Guarujá</option>
                  <option value="SANTOS"  className="bg-stone-950 text-stone-100">Santos</option>
                  <option value="OUTRA"   className="bg-stone-950 text-stone-100">Outra cidade</option>
                </select>
                {errors.city && (
                  <p className="font-inter text-[11px] text-red-400">{errors.city.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full rounded-none border border-amber-400 bg-amber-400 py-3.5 font-inter text-xs font-medium uppercase tracking-widest text-stone-950 transition-all duration-300 hover:bg-transparent hover:text-amber-400 disabled:opacity-60"
              >
                {isPending ? "Enviando..." : "Quero anunciar meu imóvel"}
              </button>

              <p className="text-center font-inter text-[10px] text-stone-600">
                Sem spam. Entraremos em contato apenas via WhatsApp.
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
