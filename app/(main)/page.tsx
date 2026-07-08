import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { ProductCard } from "@/app/components/product-card";

export const dynamic = "force-dynamic";

const PILLARS = [
  { zi: "食", h: "Dinh dưỡng dưỡng sinh", p: "Đông trùng hạ thảo, linh chi, nhân sâm — thảo dược quý theo nguyên lý quân–thần–tá–sứ." },
  { zi: "行", h: "Hành vi dưỡng sinh", p: "Thiết bị chăm sóc sức khỏe: kinh lạc, xung điện, hồng ngoại — spa tại nhà." },
  { zi: "心", h: "Tâm lý dưỡng sinh", p: "Cân bằng thân–tâm–trí, cộng đồng tích cực, văn hóa Hòa–Trị–Hữu–Đức." },
];

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { status: "active" },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
    take: 4,
  });

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-emerald-600 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              Since 2007 · Moscow → 30+ quốc gia
            </span>
            <h1 className="mt-3 font-heading text-4xl leading-tight md:text-5xl">
              Phát huy văn hóa <em className="text-gold not-italic">dưỡng sinh</em>, phục vụ sức khỏe nhân loại
            </h1>
            <p className="mt-4 max-w-lg font-light text-white/80">
              FOHOWAY kết hợp 5.000 năm tinh hoa Trung y với dinh dưỡng học phương Tây — hệ sản phẩm & nền tảng
              sự nghiệp sức khỏe toàn cầu.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/san-pham" className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white">
                Khám phá sản phẩm →
              </Link>
              <Link href="/doi-tac" className="rounded-full border border-white px-5 py-3 text-sm font-semibold">
                Trở thành Đại lý
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8">
              {[["19+", "NĂM"], ["30+", "QUỐC GIA"], ["120+", "SẢN PHẨM"], ["3", "HỌC THUYẾT"]].map(([n, l]) => (
                <div key={l}>
                  <b className="block font-heading text-2xl text-gold">{n}</b>
                  <span className="text-[11px] text-white/60">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="grid h-64 w-64 place-items-center rounded-3xl bg-cta text-center shadow-2xl">
              <div className="font-heading text-5xl font-bold text-white">
                和<br />FHW
                <div className="mt-1 text-[10px] tracking-[0.3em] text-white/80">HÒA · TRỊ · HỮU · ĐỨC</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 PILLARS */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cta">Nền tảng triết lý</span>
        <h2 className="mt-2 font-heading text-3xl text-brand-dark">Ba học thuyết dưỡng sinh</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PILLARS.map((c) => (
            <div key={c.zi} className="rounded-xl border border-black/10 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="font-heading text-4xl text-gold">{c.zi}</div>
              <h3 className="mt-3 font-heading text-lg text-brand-dark">{c.h}</h3>
              <p className="mt-1.5 text-sm text-ink/60">{c.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cta">Nổi bật</span>
        <h2 className="mt-2 font-heading text-3xl text-brand-dark">Sản phẩm tiêu biểu</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              p={{
                name: p.name,
                categoryName: p.category?.name,
                basePrice: p.basePrice.toString(),
                msrpPrice: p.msrpPrice?.toString() ?? null,
                emoji: p.category?.icon,
                href: `/san-pham/${p.urlSlug ?? p.id}`,
              }}
            />
          ))}
        </div>
        <div className="mt-7 text-center">
          <Link href="/san-pham" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>

      {/* CTA đại lý */}
      <section className="bg-brand text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Cơ hội sự nghiệp</span>
            <h2 className="mt-2 font-heading text-3xl">Cửa hàng online của riêng bạn — trong 5 phút</h2>
            <p className="mt-3 text-sm text-white/80">
              Đăng ký đại lý, tạo cửa hàng riêng, tùy biến giao diện, bật thanh toán & vận chuyển, tạo landing page.
            </p>
            <Link href="/doi-tac" className="mt-6 inline-block rounded-full bg-gold px-5 py-3 text-sm font-semibold">
              Đăng ký Đại lý miễn phí →
            </Link>
          </div>
          <div className="rounded-2xl border border-dashed border-gold bg-white/5 p-6 text-center">
            <div className="text-4xl">🏪</div>
            <b className="font-heading text-lg">Shop Dưỡng Sinh Minh Anh</b>
            <div className="mt-2 inline-block rounded-lg bg-black/25 px-3 py-1.5 font-mono text-xs text-emerald-200">
              fohoway.vn/s/minh-anh
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
