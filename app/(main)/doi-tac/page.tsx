export const dynamic = "force-static";

const AGENT_BENEFITS = [
  "Đăng ký + eKYC (CCCD, SĐT)",
  "Cửa hàng riêng fohoway.vn/s/tên-bạn",
  "Tự setup giao diện, SEO, quảng cáo",
  "Tạo landing page từng sản phẩm",
  "Đại lý tự thu tiền, tự quản như hộ kinh doanh",
  "CRM khách hàng & báo cáo kinh doanh",
];

export default function DoiTacPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cta">Mạng lưới</span>
      <h1 className="mt-2 font-heading text-3xl text-brand-dark">Đối tác phát triển</h1>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {/* Kênh 1 — Spa */}
        <div className="rounded-2xl border border-black/10 bg-white p-7">
          <span className="rounded-full bg-brand-light px-2.5 py-1 text-[10px] font-bold text-brand">KÊNH 1</span>
          <h3 className="mt-3 font-heading text-xl text-brand-dark">🏥 Spa & Trung tâm CSSK</h3>
          <p className="mt-1 text-sm text-ink/60">Cơ sở vật lý ứng dụng thiết bị FOHOWAY.</p>
          <div className="mt-4 flex gap-2">
            <button className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white">Xem bản đồ</button>
            <button className="rounded-full border border-brand px-4 py-2 text-xs font-semibold text-brand">
              Đăng ký Spa
            </button>
          </div>
        </div>

        {/* Kênh 2 — Đại lý */}
        <div className="rounded-2xl border border-gold bg-white p-7">
          <span className="rounded-full bg-gold-light px-2.5 py-1 text-[10px] font-bold text-amber-800">KÊNH 2</span>
          <h3 className="mt-3 font-heading text-xl text-brand-dark">🤝 Đại lý kinh doanh</h3>
          <p className="mt-1 text-sm text-ink/60">Mỗi đại lý có cửa hàng online riêng trên nền tảng FOHOWAY.</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {AGENT_BENEFITS.map((b) => (
              <li key={b} className="relative pl-6">
                <span className="absolute left-0 font-bold text-cta">✓</span>
                {b}
              </li>
            ))}
          </ul>
          <button className="mt-5 rounded-full bg-cta px-5 py-3 text-sm font-semibold text-white">
            Đăng ký Đại lý ngay →
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-lg border-l-4 border-gold bg-gold-light px-4 py-3 text-sm text-amber-900">
        📐 Đăng ký 3 bước: Thông tin cá nhân → Thông tin kinh doanh → eKYC (CCCD + selfie). Admin duyệt → cấp mã đại
        lý + tạo cửa hàng.
      </div>
    </main>
  );
}
