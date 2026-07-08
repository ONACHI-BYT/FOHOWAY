import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { formatVND } from "@/app/lib/format";
import { productSlugWhere } from "@/app/lib/slug";
import { ProductTabs } from "@/app/components/product-tabs";

export const dynamic = "force-dynamic";

export default async function ProductDetail({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findFirst({
    where: { OR: productSlugWhere(params.slug), status: "active" },
    include: { category: true },
  });
  if (!product) notFound();

  // "Nơi bán" — các đại lý đang bán SP này (giá của từng đại lý)
  const sellers = await prisma.storeProduct.findMany({
    where: { productId: product.id, isActive: true, store: { isActive: true } },
    include: { store: true },
    orderBy: { sellingPrice: "asc" },
    take: 20,
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/san-pham" className="text-xs text-ink/50 hover:text-ink">
        ← Tất cả sản phẩm
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="grid aspect-square place-items-center rounded-xl bg-brand-light/60 text-[120px]">
          {product.category?.icon ?? "📦"}
        </div>
        <div>
          <span className="rounded-full bg-brand-light px-2.5 py-1 text-[10px] font-semibold text-brand">
            {product.category?.name}
          </span>
          <h1 className="mt-3 font-heading text-3xl text-brand-dark">{product.name}</h1>
          {product.subtitle && <p className="mt-1 text-sm text-ink/60">{product.subtitle}</p>}
          <div className="mt-3 text-2xl font-bold text-cta">
            {formatVND(product.basePrice.toString())}
            {product.msrpPrice && (
              <s className="ml-2 text-base font-normal text-ink/40">{formatVND(product.msrpPrice.toString())}</s>
            )}
          </div>
          <p className="mt-1 text-xs text-ink/50">Giá tham khảo · giá bán cuối theo từng đại lý.</p>

          <div className="mt-6">
            <ProductTabs
              data={{
                description: product.description,
                ingredients: product.ingredients,
                benefits: product.benefits,
                usageGuide: product.usageGuide,
              }}
            />
          </div>
        </div>
      </div>

      {/* Nơi bán */}
      <section className="mt-12">
        <h2 className="mb-4 font-heading text-2xl text-brand-dark">🏪 Nơi bán</h2>
        {sellers.length === 0 ? (
          <p className="text-ink/50">Chưa có đại lý nào đang bán sản phẩm này.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {sellers.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4">
                <div>
                  <b className="text-brand-dark">{s.store.storeName}</b>
                  <div className="text-xs text-ink/50">
                    fohoway.vn/s/{s.store.slug} · Tồn: {s.stockQuantity}
                  </div>
                  <div className="mt-1 font-semibold text-cta">{formatVND(s.sellingPrice.toString())}</div>
                </div>
                <Link
                  href={`/s/${s.store.slug}/sp/${product.urlSlug ?? product.id}`}
                  className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
                >
                  Mua ngay →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
