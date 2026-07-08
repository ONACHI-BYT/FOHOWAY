import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { formatVND } from "@/app/lib/format";
import { productSlugWhere } from "@/app/lib/slug";
import { ProductTabs } from "@/app/components/product-tabs";
import { addToCart } from "../../actions";

export const dynamic = "force-dynamic";

export default async function StoreProductDetail({
  params,
}: {
  params: { slug: string; productSlug: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  const product = await prisma.product.findFirst({
    where: { OR: productSlugWhere(params.productSlug) },
    include: { category: true },
  });
  if (!product) notFound();

  const sp = await prisma.storeProduct.findUnique({
    where: { storeId_productId: { storeId: store.id, productId: product.id } },
  });
  if (!sp || !sp.isActive) notFound();

  const soldOut = sp.stockQuantity <= 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href={`/s/${store.slug}`} className="text-xs opacity-60 hover:opacity-100">
        ← Về cửa hàng
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div
          style={{ background: "var(--surface2)", borderRadius: "var(--radius)" }}
          className="grid aspect-square place-items-center text-[120px]"
        >
          {product.category?.icon ?? "📦"}
        </div>
        <div>
          <span style={{ background: "var(--brand)", color: "#fff" }} className="rounded-full px-2.5 py-1 text-[10px] font-semibold">
            {product.category?.name}
          </span>
          <h1 className="mt-3 font-heading text-3xl">{product.name}</h1>
          {product.subtitle && <p className="mt-1 text-sm opacity-60">{product.subtitle}</p>}
          <div className="mt-1 text-sm" style={{ color: "var(--gold)" }}>
            ★★★★★ <span className="opacity-60">4.9 · 132 đánh giá</span>
          </div>
          <div className="mt-3 text-2xl font-bold" style={{ color: "var(--brand)" }}>
            {formatVND(sp.sellingPrice.toString())}
            {product.msrpPrice && (
              <s className="ml-2 text-base font-normal opacity-40">{formatVND(product.msrpPrice.toString())}</s>
            )}
          </div>
          <div className="mt-1 text-xs uppercase" style={{ color: soldOut ? "var(--cta)" : "var(--ink3)" }}>
            {soldOut ? "Hết hàng" : `Còn ${sp.stockQuantity} sản phẩm`}
          </div>

          <form action={addToCart} className="mt-5 flex items-center gap-3">
            <input type="hidden" name="slug" value={store.slug} />
            <input type="hidden" name="productId" value={product.id} />
            <input
              type="number"
              name="qty"
              defaultValue={1}
              min={1}
              max={soldOut ? 1 : sp.stockQuantity}
              className="w-20 rounded-lg border px-3 py-2.5 text-center"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            />
            <button
              type="submit"
              disabled={soldOut}
              style={{ background: "var(--cta)", borderRadius: "var(--radius)" }}
              className="flex-1 py-3 text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-40"
            >
              🛒 Thêm vào giỏ
            </button>
          </form>

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
    </main>
  );
}
