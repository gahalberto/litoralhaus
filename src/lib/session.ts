// Leitura de sessão para Server Components (usa next/headers — Node runtime only)
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE, type SessionPayload } from "./auth";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");
  return session;
}
