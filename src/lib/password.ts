// bcryptjs é Node-only — nunca importar no middleware (Edge Runtime)
import { hash, compare } from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, 12);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return compare(plain, hashed);
}
