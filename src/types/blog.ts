import { z } from "zod";
import { Region } from "@prisma/client";

export const postFormSchema = z.object({
  id:             z.string().optional(),
  title:          z.string().min(3, "Título obrigatório"),
  slug:           z.string().min(3, "Slug obrigatório").regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífens"),
  excerpt:        z.string().min(10, "Resumo obrigatório"),
  content:        z.string().min(10, "Conteúdo obrigatório"),
  coverImage:     z.string().optional(),
  published:      z.boolean(),
  publishedAt:    z.string().optional(),
  authorName:     z.string(),
  region:         z.nativeEnum(Region).optional().nullable(),
  city:           z.string().optional(),
  neighborhood:   z.string().optional(),
  tagsRaw:        z.string().optional(),
  seoTitle:       z.string().optional(),
  seoDescription: z.string().optional(),
});

export type PostFormData    = z.infer<typeof postFormSchema>;
export type PostActionResult = { success: true; id: string } | { success: false; error: string };
