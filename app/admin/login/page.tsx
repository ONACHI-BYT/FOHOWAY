import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth";
import { login } from "@/app/lib/auth-actions";

export const dynamic = "force-dynamic";

export default function AdminLogin({ searchParams }: { searchParams: { error?: string } }) {
  const s = getSession();
  if (s && s.role !== "agent") redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center bg-brand-dark px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border-2 border-gold bg-brand font-heading text-xl font-bold text-gold">
            和
          </span>
          <h1 className="mt-3 font-heading text-2xl text-brand-dark">Admin Console</h1>
          <p className="text-xs text-ink/50">FOHOWAY Việt Nam</p>
        </div>

        {searchParams.error && (
          <div className="mb-4 rounded-lg border border-cta/40 bg-red-50 px-3 py-2 text-sm text-cta">
            {searchParams.error === "role" ? "Tài khoản không có quyền quản trị." : "Email hoặc mật khẩu không đúng."}
          </div>
        )}

        <form action={login} className="space-y-3">
          <input type="hidden" name="scope" value="admin" />
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-dark">Email</label>
            <input name="email" type="email" required defaultValue="admin@fohoway.vn" className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-dark">Mật khẩu</label>
            <input name="password" type="password" required className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm" />
          </div>
          <button className="w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white">Đăng nhập</button>
        </form>
        <p className="mt-4 text-center text-[11px] text-ink/40">Demo: admin@fohoway.vn / admin123</p>
      </div>
    </main>
  );
}
