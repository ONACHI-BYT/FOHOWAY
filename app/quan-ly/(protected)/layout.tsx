import Link from "next/link";
import { requireAgentStore } from "@/app/lib/auth";
import { logout } from "@/app/lib/auth-actions";

const MENU: [string, string, string][] = [
  ["📊", "Dashboard", "/quan-ly"],
  ["📦", "Đơn hàng", "/quan-ly/don-hang"],
];

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const { store, agent } = await requireAgentStore();

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] max-lg:grid-cols-1">
      <aside className="sticky top-0 flex h-screen flex-col overflow-auto bg-brand-dark p-4 text-white/70 max-lg:static max-lg:h-auto">
        <div className="mb-4 border-b border-white/10 pb-4">
          <b className="block font-heading tracking-wide text-white">{store.storeName}</b>
          <small className="text-[10px] text-gold">Đại lý {agent.agentCode} · {agent.tier}</small>
          <Link href={`/s/${store.slug}`} className="mt-1 block text-[11px] text-white/40 hover:text-white">
            fohoway.vn/s/{store.slug} ↗
          </Link>
        </div>
        {MENU.map(([icon, label, href]) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition hover:bg-white/10 hover:text-white"
          >
            <span className="w-4 text-center">{icon}</span> {label}
          </Link>
        ))}
        <div className="mt-auto border-t border-white/10 pt-3">
          <form action={logout}>
            <input type="hidden" name="to" value="/quan-ly/dang-nhap" />
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
