import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Hash mật khẩu bằng scrypt (chuẩn Node, không cần bcrypt). Format: scrypt$salt$hash
const scryptAsync = promisify(scrypt);

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(pw, salt, 64)) as Buffer;
  return `scrypt$${salt}$${buf.toString("hex")}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const buf = (await scryptAsync(pw, salt, 64)) as Buffer;
  const hashBuf = Buffer.from(hash, "hex");
  return hashBuf.length === buf.length && timingSafeEqual(hashBuf, buf);
}
