import { z } from "zod";

export const ownerSchema = z.object({
  name:  z.string().min(2, "Nome obrigatório"),
  phone: z.string().min(8, "Telefone obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cpf:   z.string().optional(),
  notes: z.string().optional(),
});

export type OwnerFormData = z.infer<typeof ownerSchema>;
