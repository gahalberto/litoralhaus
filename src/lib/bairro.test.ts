import { describe, it, expect, vi, beforeEach } from "vitest";

const findManyMock = vi.fn();
const findUniqueMock = vi.fn();
const createMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    bairro: {
      findMany: (...args: unknown[]) => findManyMock(...args),
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

const { resolverOuCriarBairro } = await import("@/lib/bairro");

const CIDADE_ID = "cidade-guaruja";

describe("resolverOuCriarBairro", () => {
  beforeEach(() => {
    findManyMock.mockReset();
    findUniqueMock.mockReset();
    createMock.mockReset();
  });

  it("associa a um bairro já existente quando o nome bate exatamente", async () => {
    findManyMock.mockResolvedValue([{ id: "bairro-1", nome: "Astúrias" }]);

    const id = await resolverOuCriarBairro("Astúrias", CIDADE_ID);

    expect(id).toBe("bairro-1");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("cria um novo bairro rascunho quando não existe nenhum correspondente", async () => {
    findManyMock.mockResolvedValue([{ id: "bairro-1", nome: "Astúrias" }]);
    findUniqueMock.mockResolvedValue(null); // slug livre
    createMock.mockResolvedValue({ id: "bairro-novo" });

    const id = await resolverOuCriarBairro("Vila Áurea", CIDADE_ID);

    expect(id).toBe("bairro-novo");
    expect(createMock).toHaveBeenCalledWith({
      data: {
        cidadeId: CIDADE_ID,
        nome: "Vila Áurea",
        slug: "vila-aurea",
        ativo: false,
        criadoAutomaticamente: true,
      },
    });
  });

  it("reconhece o mesmo bairro com variação de acento e caixa", async () => {
    findManyMock.mockResolvedValue([{ id: "bairro-1", nome: "Astúrias" }]);

    const id = await resolverOuCriarBairro("asturias  ", CIDADE_ID);

    expect(id).toBe("bairro-1");
    expect(createMock).not.toHaveBeenCalled();
  });
});
