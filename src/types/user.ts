import { z } from "zod";

export const userFormSchema = z.object({
  name:     z.string().min(2, "Mínimo 2 caracteres"),
  email:    z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres").optional().or(z.literal("")),
  role:     z.enum(["ADMIN", "CORRETOR"]),
  active:   z.boolean(),
});

export type UserFormData = z.infer<typeof userFormSchema>;
