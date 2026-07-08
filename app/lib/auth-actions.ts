"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { verifyPassword } from "@/app/lib/password";
import { setSession, clearSession } from "@/app/lib/auth";

const ADMIN_LOGIN = "/admin/login";
const AGENT_LOGIN = "/quan-ly/dang-nhap";

// Đăng nhập chung — điều hướng theo vai trò. "scope" = admin | agent (để về đúng trang login khi lỗi).
export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const scope = String(formData.get("scope") ?? "agent");
  const loginPath = scope === "admin" ? ADMIN_LOGIN : AGENT_LOGIN;

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && user.isActive && (await verifyPassword(password, user.passwordHash));
  if (!user || !ok) redirect(`${loginPath}?error=1`);

  // Chặn nhầm cổng: agent không vào admin và ngược lại
  if (scope === "admin" && user.role === "agent") redirect(`${ADMIN_LOGIN}?error=role`);
  if (scope === "agent" && user.role !== "agent") redirect(`${AGENT_LOGIN}?error=role`);

  setSession(user.id, user.role);
  redirect(user.role === "agent" ? "/quan-ly" : "/admin");
}

export async function logout(formData: FormData) {
  clearSession();
  redirect(String(formData.get("to") ?? "/"));
}
