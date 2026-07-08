import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { formatVND } from "@/app/lib/format";
import { addToCart } from "./actions";

export const dynamic = "force-dynamic";

export default async function StoreHome({ params }: { params: { slug: string } }) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    include: {
      storeProducts: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { product: { include: { category: true } } },
      },
    },
  });
  if (!store) notFound();

  return (
    <main>
      {/* Hero */}
      <div
        style={{ background: "linear-gradient(155deg,var(--brand-dark),var(--brand))" }}
        className="px-6 py-16 text-center text-white"
      >
        <div className="mx-auto max-w-2xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
            {store.storeName}
          </div>
          <h1 className="mt-3 font-heading text-4xl">Phát huy văn hóa dưỡng sinh</h1>
          <p className="mt-3 text-sm text-white/70">
            {store.slogan ?? "Sản phẩm chính hãng FOHOWAY — đông trùng, linh chi, thiết bị chăm sóc sức khỏe."}
          </p>
        </div>
      </div>

      {/* Advantages */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px bg-black/5 md:grid-cols-3">
        {[
          ["🚚", "Miễn phí vận chuyển", "Đơn từ 500.000₫"],
          ["🔄", "Đổi trả 7 ngày", "Hoàn tiền 3 ngày"],
          ["💬", "Tư vấn 24/7", "Zalo · Chat AI"],
        ].map(([i, t, s]) => (
          <div key={t} style={{ background: "var(--surface)" }} className="px-6 py-8 text-center">
            <div className="text-2xl">{i}</div>
            <div className="mt-2 text-[10px] font-semibold uppercase tracking-widest">{t}</div>
            <div className="text-xs" style={{ color: "var(--ink3)" }}>
              {s}
            </div>
          </div>
        ))}
      </div>

      {/* Products */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 font-heading text-3xl">Sản phẩm</h2>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {store.storeProducts.map((sp) => {
            const detailHref = `/s/${store.slug}/sp/${sp.product.urlSlug ?? sp.product.id}`;
            const soldOut = sp.stockQuantity <= 0;
            return (
              <div
                key={sp.id}
                style={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: "var(--radius)" }}
                className="overflow-hidden border transition hover:-translate-y-1.5"
              >
                <Link href={detailHref} className="block">
                  <div style={{ background: "var(--surface2)" }} className="grid aspect-square place-items-center text-6xl">
                    {sp.product.category?.icon ?? "📦"}
                  </div>
                </Link>
                <div className="p-5">
                  <span
                    style={{ background: "var(--brand-light,rgba(13,107,79,.1))", color: "var(--brand)" }}
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  >
                    {sp.product.category?.name}
                  </span>
                  <Link href={detailHref}>
                    <h3 className="mt-2 font-heading text-[15px] font-medium leading-tight hover:underline">
                      {sp.product.name}
                    </h3>
                  </Link>
                  <div className="mt-1 text-[11px]" style={{ color: "var(--gold)" }}>
                    ★★★★★
                  </div>
                  <div className="mt-1.5 font-semibold">{formatVND(sp.sellingPrice.toString())}</div>
                  <div className="mt-1 text-[10px] uppercase" style={{ color: soldOut ? "var(--cta)" : "var(--ink3)" }}>
                    {soldOut ? "Hết hàng" : `Tồn: ${sp.stockQuantity}`}
                  </div>
                  <form action={addToCart}>
                    <input type="hidden" name="slug" value={store.slug} />
                    <input type="hidden" name="productId" value={sp.productId} />
                    <input type="hidden" name="qty" value="1" />
                    <button
                      type="submit"
                      disabled={soldOut}
                      style={{ background: "var(--brand)", borderRadius: "var(--radius)" }}
                      className="mt-3 w-full py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-40"
                    >
                      🛒 Thêm giỏ
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
        {store.storeProducts.length === 0 && (
          <p className="py-10 text-center" style={{ color: "var(--ink3)" }}>
            Cửa hàng chưa chọn sản phẩm nào.
          </p>
        )}
      </section>
    </main>
  );
}
