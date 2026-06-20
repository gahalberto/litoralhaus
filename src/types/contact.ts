import { z } from "zod";

export const contactFormSchema = z.object({
  name:    z.string().min(2, "Nome obrigatório"),
  email:   z.string().email("E-mail inválido"),
  phone:   z.string().optional(),
  subject: z.string().min(3, "Assunto obrigatório"),
  message: z.string().min(10, "Mensagem muito curta"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
