import type { Metadata } from "next";
import Link from "next/link";
import { UserForm } from "@/components/admin/UserForm";
import { createUser } from "@/actions/users";

export const metadata: Metadata = { title: "Novo Usuário" };

export default function NewUserPage() {
  return (
    <div className="mx-auto max-w-lg px-8 py-8">
      <nav className="mb-8 flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/users" className="hover:text-foreground">Usuários</Link>
        <span>/</span>
        <span className="text-foreground">Novo</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-cormorant text-2xl font-light text-foreground">
          Novo Usuário
        </h1>
        <p className="mt-1 font-inter text-xs text-muted-foreground">
          Defina o perfil de acesso com cuidado — Admins têm acesso total ao sistema.
        </p>
      </div>

      <UserForm mode="create" onSubmit={createUser} />
    </div>
  );
}
