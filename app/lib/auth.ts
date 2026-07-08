import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import type { UserRole } from "@prisma/client";

const COOKIE = "fohoway_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 ngày

export interface Session {
  uid: string;
  role: UserRole;
  exp: number;
}

function secret(): string {
  return process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
}

function sign(payload: Session): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verify(token: string): Session | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = createHmac("sha256", secret()).update(data).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as Session;
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// SET/CLEAR — chỉ gọi trong Server Action / Route Handler
export function setSession(uid: string, role: UserRole): void {
  const exp = Date.now() + MAX_AGE * 1000;
  cookies().set(COOKIE, sign({ uid, role, exp }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSession(): void {
  cookies().delete(COOKIE);
}

// READ — dùng được ở server component
export function getSession(): Session | null {
  const c = cookies().get(COOKIE)?.value;
  return c ? verify(c) : null;
}

const ADMIN_ROLES: UserRole[] = ["super_admin", "admin", "content_editor", "finance", "support"];

// Guard admin — redirect về login nếu không đủ quyền
export function requireAdmin(): Session {
  const s = getSession();
  if (!s || !ADMIN_ROLES.includes(s.role)) redirect("/admin/login");
  return s;
}

// Guard đại lý — trả về agent + store của phiên đăng nhập
export async function requireAgentStore() {
  const s = getSession();
  if (!s || s.role !== "agent") redirect("/quan-ly/dang-nhap");
  const agent = await prisma.agentProfile.findUnique({
    where: { userId: s.uid },
    include: { store: true, user: true },
  });
  if (!agent || !agent.store) redirect("/quan-ly/dang-nhap");
  return { session: s, agent, store: agent.store };
}
