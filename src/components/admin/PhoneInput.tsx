"use client";

import { forwardRef, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

const inputCls =
  "flex-1 min-w-0 bg-transparent py-2 pr-3 font-inter text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none";

function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2)  return digits;
  if (digits.length <= 6)  return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, inputClassName, className, ...props }, ref) => {
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      onChange(applyMask(e.target.value));
    }

    return (
      <div
        className={cn(
          "flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/30",
          className
        )}
      >
        <span className="flex h-full shrink-0 items-center border-r border-zinc-200 dark:border-zinc-800 px-3 font-inter text-sm font-medium text-zinc-400 dark:text-zinc-500 select-none">
          +55
        </span>
        <input
          {...props}
          ref={ref}
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder="(13) 99999-8888"
          className={cn(inputCls, inputClassName)}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

/** Converte qualquer formato de telefone para URL do WhatsApp com DDI 55 */
export function phoneToWhatsApp(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const base = `https://wa.me/${withCountry}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
