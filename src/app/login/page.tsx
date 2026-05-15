import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Acesso Restrito",
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="font-cormorant text-3xl font-light tracking-wider text-foreground">
            Litoral Haus
          </p>
          <p className="mt-2 font-inter text-xs uppercase tracking-widest text-muted-foreground">
            Painel Administrativo
          </p>
        </div>

        <LoginForm searchParams={searchParams} />

        <p className="mt-8 text-center font-inter text-xs text-muted-foreground/50">
          Acesso exclusivo para a equipe Litoral Haus.
        </p>
      </div>
    </div>
  );
}
