import type { Metadata } from "next";
import Link from "next/link";
import { getUsers } from "@/actions/users";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Usuários" };

const ROLE_CONFIG: Record<UserRole, { label: string; badge: string }> = {
  ADMIN:    { label: "Administrador", badge: "bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300" },
  CORRETOR: { label: "Corretor",      badge: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300" },
};

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-8 py-4">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-foreground">Usuários</h1>
          <p className="mt-0.5 font-inter text-xs text-muted-foreground">
            {users.length} {users.length === 1 ? "usuário" : "usuários"}
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-none border border-amber-400 bg-amber-400 px-5 py-2 font-inter text-xs font-medium uppercase tracking-widest text-stone-950 transition-colors hover:bg-transparent hover:text-amber-600 dark:hover:text-amber-400"
        >
          + Novo Usuário
        </Link>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {users.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="font-cormorant text-2xl font-light text-muted-foreground">
              Nenhum usuário cadastrado
            </p>
            <Link
              href="/admin/users/new"
              className="border border-border px-5 py-2.5 font-inter text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
            >
              + Criar primeiro usuário
            </Link>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Usuário", "Perfil", "Leads Atribuídos", "Status", "Criado em", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left font-inter text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const roleCfg = ROLE_CONFIG[u.role];
                return (
                  <tr key={u.id} className="group transition-colors hover:bg-muted/20">
                    {/* Usuário */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar com iniciais */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-inter text-xs font-medium text-foreground">
                          {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-inter text-sm font-medium text-foreground">{u.name}</p>
                          <p className="font-inter text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Perfil */}
                    <td className="px-6 py-4">
                      <span className={cn(
                        "rounded px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider",
                        roleCfg.badge
                      )}>
                        {roleCfg.label}
                      </span>
                    </td>

                    {/* Leads */}
                    <td className="px-6 py-4 font-inter text-sm tabular-nums text-muted-foreground">
                      {u._count.assignedLeads}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={cn(
                        "flex w-fit items-center gap-1.5 rounded px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider",
                        u.active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground"
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", u.active ? "bg-emerald-400" : "bg-muted-foreground/40")} />
                        {u.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="px-6 py-4 font-inter text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-inter text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                      >
                        Editar →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
