import type { Metadata } from "next";
import Link from "next/link";
import { CreateLeadForm } from "@/components/admin/CreateLeadForm";

export const metadata: Metadata = { title: "Novo Lead" };

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-8 space-y-8">
      <nav className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/leads?view=list" className="hover:text-foreground">Leads</Link>
        <span>/</span>
        <span className="text-foreground">Novo lead</span>
      </nav>

      <div>
        <h1 className="font-cormorant text-3xl font-light text-foreground">Novo Lead</h1>
        <p className="mt-1 font-inter text-xs text-muted-foreground">
          Cadastre manualmente um contato que chegou por WhatsApp, telefone ou indicação.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6">
        <CreateLeadForm />
      </section>
    </div>
  );
}
