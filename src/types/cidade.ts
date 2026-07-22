import { z } from "zod";

export const cidadeSchema = z.object({
  nome:            z.string().min(2, "Nome obrigatório"),
  slug:            z.string().min(2, "Slug obrigatório").regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  uf:              z.string().min(2, "UF obrigatória").max(2),
  textoIntro:      z.string().optional(),
  metaDescription: z.string().optional(),
  latitude:        z.string().optional(),
  longitude:       z.string().optional(),
  ativo:           z.boolean(),
});

export type CidadeFormData = z.infer<typeof cidadeSchema>;
