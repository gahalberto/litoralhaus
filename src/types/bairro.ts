import { z } from "zod";

export const bairroSchema = z.object({
  cidadeId:            z.string().min(1, "Selecione a cidade"),
  nome:                z.string().min(2, "Nome obrigatório"),
  slug:                z.string().optional(),
  textoMorar:          z.string().optional(),
  aluguelMedio:        z.string().optional(),
  vendaMedia:          z.string().optional(),
  metaTitle:           z.string().optional(),
  metaDescription:     z.string().optional(),
  latitude:            z.string().optional(),
  longitude:           z.string().optional(),
  ativo:               z.boolean(),
  bairrosProximosIds:  z.array(z.string()).optional(),
});

export type BairroFormData = z.infer<typeof bairroSchema>;
