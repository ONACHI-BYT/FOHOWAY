import Link from "next/link";
import { MainNav } from "@/app/components/main-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-brand-dark py-1.5 text-center text-[11px] text-white/70">
        ☎ Hotline: 0919 715 868 · ✉ hotro@fohoway.vn · Since 2007 · Moscow → 30+ quốc gia
      </div>
      <MainNav />
      <div className="min-h-[60vh]">{children}</div>
      <footer className="mt-8 bg-brand-dark py-12 text-white/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-7 px-6 text-sm md:grid-cols-4">
          <div>
            <div className="mb-3 font-heading text-lg text-white">FOHOWAY Việt Nam</div>
            <p>Số 5 ngõ 100 Dịch Vọng Hậu, Cầu Giấy, HN</p>
            <p>☎ 0919 715 868 · ✉ hotro@fohoway.vn</p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Tập đoàn</h4>
            <Link className="block py-0.5 hover:text-white" href="/tap-doan">Hồ sơ</Link>
            <Link className="block py-0.5 hover:text-white" href="/tap-doan">Viện R&D</Link>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Hỗ trợ</h4>
            <Link className="block py-0.5 hover:text-white" href="/doi-tac">Hướng dẫn Đại lý</Link>
            <Link className="block py-0.5 hover:text-white" href="/thu-vien">Thư viện</Link>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Kết nối</h4>
            <span className="block py-0.5">Facebook · YouTube · TikTok</span>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 px-6 pt-4 text-[11px]">
          © 2026 FOHOWAY Việt Nam · Điều khoản · Bảo mật
        </div>
      </footer>
    </>
  );
}
