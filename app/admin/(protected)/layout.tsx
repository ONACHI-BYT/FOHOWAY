import Link from "next/link";
import { requireAdmin, getSession } from "@/app/lib/auth";
import { logout } from "@/app/lib/auth-actions";
import { prisma } from "@/app/lib/prisma";

const MENU = [
  { group: "Tổng quan", items: [["📊", "Dashboard", "/admin"]] },
  {
    group: "Nội dung",
    items: [
      ["📦", "Sản phẩm & danh mục", "/admin/products"],
      ["🤝", "Đại lý & cửa hàng", "/admin/agents"],
    ],
  },
  { group: "Nền tảng", items: [["💰", "Gói phí & doanh thu", "/admin/pricing"]] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  requireAdmin();
  const session = getSession();
  const me = session ? await prisma.user.findUnique({ where: { id: session.uid } }) : null;

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] max-lg:grid-cols-1">
      <aside className="sticky top-0 flex h-screen flex-col overflow-auto bg-brand-dark p-4 text-white/70 max-lg:static max-lg:h-auto">
        <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-4">
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-gold bg-brand font-heading font-bold text-gold">
            和
          </span>
          <div className="leading-tight">
            <b className="block font-heading tracking-wide text-white">FOHOWAY</b>
            <small className="text-[9px] tracking-[0.25em] text-gold">ADMIN CONSOLE</small>
          </div>
        </div>
        {MENU.map((sec) => (
          <div key={sec.group}>
            <div className="px-2 pb-1.5 pt-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
              {sec.group}
            </div>
            {sec.items.map(([icon, label, href]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition hover:bg-white/10 hover:text-white"
              >
                <span className="w-4 text-center">{icon}</span> {label}
              </Link>
            ))}
          </div>
        ))}
        <div className="mt-auto border-t border-white/10 pt-3">
          <div className="px-2 pb-2 text-[11px] text-white/50">{me?.fullName ?? "Admin"}</div>
          <form action={logout}>
            <input type="hidden" name="to" value="/admin/login" />
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition hover:bg-white/10 hover:text-white">
              <span className="w-4 text-center">🚪</span> Đăng xuất
            </button>
          </form>
        </div>
      </aside>
      <main className="bg-canvas px-7 py-6 pb-16 max-lg:px-4">{children}</main>
    </div>
  );
}
