import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createFirstAdmin } from "@/actions/setup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuração Inicial — Litoral Haus",
  robots: { index: false, follow: false },
};

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Se já existe qualquer usuário, redireciona para login
  const count = await prisma.user.count();
  if (count > 0) redirect("/login");

  const { error } = await searchParams;

  const inputCls =
    "w-full rounded-md border border-input bg-background px-3 py-2.5 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring";

  const labelCls =
    "block font-inter text-xs uppercase tracking-widest text-muted-foreground mb-1.5";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="font-cormorant text-3xl font-light tracking-wider text-foreground">
            Litoral Haus
          </p>
          <p className="mt-2 font-inter text-xs uppercase tracking-widest text-muted-foreground">
            Configuração Inicial
          </p>
        </div>

        {/* Banner explicativo */}
        <div className="mb-8 rounded border border-amber-400/30 bg-amber-400/5 px-5 py-4">
          <p className="font-inter text-sm font-medium text-amber-700 dark:text-amber-300">
            Criando o primeiro administrador
          </p>
          <p className="mt-1 font-inter text-xs leading-relaxed text-muted-foreground">
            Esta página só está disponível porque o banco de dados ainda não
            possui usuários. Será desativada automaticamente após este cadastro.
          </p>
        </div>

        {/* Formulário */}
        <form action={createFirstAdmin} className="space-y-5">
          <div>
            <label htmlFor="name" className={labelCls}>Nome completo</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Gabriel Alberto"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelCls}>E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@litoralhaus.com.br"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelCls}>Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="confirm" className={labelCls}>Confirmar senha</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Repita a senha"
              className={inputCls}
            />
          </div>

          {error && (
            <p className="rounded border border-destructive/30 bg-destructive/5 px-4 py-3 font-inter text-xs text-destructive">
              Verifique os campos: senhas devem ser iguais e ter ao menos 8
              caracteres.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-none border border-amber-400 bg-amber-400 py-3 font-inter text-xs font-medium uppercase tracking-widest text-stone-950 transition-all hover:bg-transparent hover:text-amber-600 dark:hover:text-amber-400"
          >
            Criar administrador e entrar
          </button>
        </form>

        <p className="mt-8 text-center font-inter text-xs text-muted-foreground/50">
          Após criar o admin, esta página redireciona para{" "}
          <code className="text-muted-foreground">/login</code> para todos.
        </p>
      </div>
    </div>
  );
}
