import { prisma } from "@/app/lib/prisma";
import { ProductFilterGrid, type FilterableProduct } from "@/app/components/product-filter-grid";

export const dynamic = "force-dynamic";

export default async function SanPhamPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "active" },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const data: FilterableProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    categoryName: p.category?.name,
    categorySlug: p.category?.slug ?? "other",
    basePrice: p.basePrice.toString(),
    msrpPrice: p.msrpPrice?.toString() ?? null,
    emoji: p.category?.icon,
    href: `/san-pham/${p.urlSlug ?? p.id}`,
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cta">Kho sản phẩm</span>
      <h1 className="mt-2 font-heading text-3xl text-brand-dark">Sản phẩm FOHOWAY</h1>
      <p className="mb-8 mt-1 text-ink/60">
        Nút <b className="text-cta">Nơi bán</b> dẫn đến cửa hàng đại lý gần bạn.
      </p>
      <ProductFilterGrid products={data} categories={categories} />
    </main>
  );
}
