import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { STORE_THEMES } from "@/app/lib/themes";
import { StoreThemeSwitcher } from "@/app/components/store-theme-switcher";
import { getCartCount } from "@/app/lib/cart";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store || !store.isActive) notFound();

  const cartCount = await getCartCount(store.id);
  const base = `/s/${store.slug}`;
  const NAV: [string, string][] = [
    ["Trang chủ", base],
    ["Giỏ hàng", `${base}/gio-hang`],
    ["Đơn hàng", `${base}/don-hang`],
  ];

  const themeVars = STORE_THEMES[store.theme].vars as React.CSSProperties;

  return (
    <div id="store-root" style={themeVars}>
      <div style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
        {/* Announcement */}
        <div
          style={{ background: "var(--brand-dark)" }}
          className="py-2.5 text-center text-[11px] leading-relaxed text-white/85"
        >
          Cửa hàng thuộc hệ thống <b style={{ color: "var(--gold)" }}>FOHOWAY Việt Nam</b> — Sản phẩm 100% chính
          hãng, tem QR truy xuất · Miễn phí vận chuyển đơn từ 500.000₫
        </div>

        {/* Nav */}
        <nav
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          className="sticky top-0 z-40 border-b"
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
            <div className="flex flex-none items-center gap-3">
              <span
                style={{ background: "var(--brand)", borderRadius: "var(--radius)" }}
                className="grid h-9 w-9 place-items-center font-heading text-lg font-bold text-white"
              >
                和
              </span>
              <span className="font-heading text-lg font-bold" style={{ color: "var(--ink)" }}>
                {store.storeName}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1 overflow-x-auto text-xs font-semibold uppercase tracking-wide">
              {NAV.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  style={{ color: "var(--ink3)" }}
                  className="whitespace-nowrap px-3 py-2 hover:opacity-70"
                >
                  {label}
                  {label === "Giỏ hàng" && cartCount > 0 && (
                    <span
                      style={{ background: "var(--brand)" }}
                      className="ml-1.5 inline-grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] text-white"
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {children}

        <footer style={{ background: "var(--cta)" }} className="mt-12 py-7 text-white/70">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-6 text-[11px]">
            <span>© 2026 {store.storeName} · FOHOWAY Việt Nam</span>
            <span>☎ {store.phone ?? "—"}</span>
          </div>
        </footer>
      </div>
      <StoreThemeSwitcher initial={store.theme} />
    </div>
  );
}
