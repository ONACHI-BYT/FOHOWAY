"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/tap-doan", label: "Tập đoàn" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/thu-vien", label: "Thư viện" },
  { href: "/doi-tac", label: "Đối tác" },
];

export function MainNav() {
  const path = usePathname();
  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-6">
        <Link href="/" className="flex flex-none items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-gold bg-brand font-heading text-lg font-bold text-gold">
            和
          </span>
          <span className="leading-tight">
            <b className="block font-heading text-lg tracking-wide text-brand-dark">FOHOWAY</b>
            <small className="block text-[9px] font-semibold tracking-[0.28em] text-gold">VIỆT NAM</small>
          </span>
        </Link>
        <div className="ml-auto flex flex-wrap gap-1">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                  active ? "bg-brand text-white" : "text-ink hover:bg-brand-light"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/doi-tac"
          className="flex-none rounded-full bg-gold px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95"
        >
          Đăng ký Đại lý
        </Link>
      </div>
    </nav>
  );
}
