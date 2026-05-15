"use client";

import { use, useActionState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = use(searchParams);

  const [state, action, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      if (params.redirect) formData.set("redirect", params.redirect);
      return login(_prev, formData);
    },
    null
  );

  const inputCls =
    "w-full border-b border-border bg-transparent py-3 font-inter text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-colors focus:border-amber-500 dark:focus:border-amber-400";

  return (
    <form action={action} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-inter text-xs uppercase tracking-widest text-muted-foreground"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@litoralhaus.com.br"
          className={inputCls}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block font-inter text-xs uppercase tracking-widest text-muted-foreground"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputCls}
        />
      </div>

      {state?.error && (
        <p className="font-inter text-xs text-destructive">{state.error}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full rounded-none border border-amber-400 bg-amber-400 py-6 font-inter text-xs font-medium uppercase tracking-widest text-stone-950 hover:bg-transparent hover:text-amber-600 dark:hover:text-amber-400"
      >
        {isPending ? "Verificando..." : "Entrar"}
      </Button>
    </form>
  );
}
