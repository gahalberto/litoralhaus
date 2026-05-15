"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { userFormSchema, type UserFormData } from "@/types/user";
import { Button }   from "@/components/ui/button";
import { Label }    from "@/components/ui/label";
import { Switch }   from "@/components/ui/switch";
import { cn }       from "@/lib/utils";

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50";

interface UserFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<{ success: boolean; error?: string }>;
}

export function UserForm({ mode, defaultValues, onSubmit }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role:   "CORRETOR",
      active: true,
      ...defaultValues,
    },
  });

  const active = watch("active");
  const role   = watch("role");

  function submit(data: UserFormData) {
    startTransition(async () => {
      const result = await onSubmit(data);
      if (!result.success) {
        setError("root", { message: result.error });
        return;
      }
      router.push("/admin/users");
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* Nome */}
      <div className="flex flex-col gap-1.5">
        <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">
          Nome completo *
        </Label>
        <input
          {...register("name")}
          placeholder="Ex: Carlos Silva"
          className={inputCls}
        />
        {errors.name && (
          <p className="font-inter text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* E-mail */}
      <div className="flex flex-col gap-1.5">
        <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">
          E-mail *
        </Label>
        <input
          {...register("email")}
          type="email"
          placeholder="corretor@litoralhaus.com.br"
          className={inputCls}
        />
        {errors.email && (
          <p className="font-inter text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Senha */}
      <div className="flex flex-col gap-1.5">
        <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">
          Senha {mode === "edit" && (
            <span className="normal-case text-muted-foreground/50"> (deixe em branco para não alterar)</span>
          )}
        </Label>
        <input
          {...register("password")}
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className={inputCls}
        />
        {errors.password && (
          <p className="font-inter text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Role */}
      <div className="flex flex-col gap-2">
        <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">
          Perfil de Acesso *
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {(["ADMIN", "CORRETOR"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setValue("role", r)}
              className={cn(
                "flex flex-col gap-1 rounded border px-4 py-3 text-left transition-all",
                role === r
                  ? "border-amber-400/60 bg-amber-400/5"
                  : "border-border hover:border-border/80"
              )}
            >
              <span className={cn(
                "font-inter text-sm font-medium",
                role === r ? "text-amber-700 dark:text-amber-300" : "text-foreground"
              )}>
                {r === "ADMIN" ? "Administrador" : "Corretor"}
              </span>
              <span className="font-inter text-xs text-muted-foreground">
                {r === "ADMIN"
                  ? "Acesso total — usuários, imóveis, leads"
                  : "Acesso a leads e imóveis"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ativo */}
      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
        <div>
          <p className="font-inter text-sm font-medium text-foreground">Usuário ativo</p>
          <p className="font-inter text-xs text-muted-foreground">
            Usuários inativos não conseguem fazer login
          </p>
        </div>
        <Switch checked={active} onCheckedChange={(v) => setValue("active", v)} />
      </label>

      {errors.root && (
        <p className="rounded border border-destructive/30 bg-destructive/5 px-4 py-3 font-inter text-xs text-destructive">
          {errors.root.message}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/users")}
          disabled={isPending}
          className="font-inter text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-40 rounded-none border border-amber-400 bg-amber-400 font-inter text-xs font-medium uppercase tracking-widest text-stone-950 hover:bg-transparent hover:text-amber-600 dark:hover:text-amber-400"
        >
          {isPending
            ? "Salvando..."
            : mode === "create" ? "Criar Usuário" : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
