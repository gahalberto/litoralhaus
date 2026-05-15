import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// pg-connection-string v3 vai quebrar sslmode=prefer|require|verify-ca.
// Normaliza aqui para verify-full (comportamento atual) e suprime o warning.
function buildConnectionString(): string {
  const raw = process.env.DATABASE_URL!;
  try {
    const url = new URL(raw);
    const mode = url.searchParams.get("sslmode");
    if (mode === "prefer" || mode === "require" || mode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
    }
    return url.toString();
  } catch {
    // URL com formato não-padrão (e.g. postgres://…) — devolve sem alteração
    return raw;
  }
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: buildConnectionString() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
