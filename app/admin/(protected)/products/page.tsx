import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { formatVND } from "@/app/lib/format";
import { DeleteProductButton } from "./delete-button";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  hidden: "bg-amber-100 text-amber-700",
  out_of_stock: "bg-red-100 text-red-700",
  discontinued: "bg-gray-200 text-gray-600",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Đang bán",
  hidden: "Ẩn",
  out_of_stock: "Hết hàng",
  discontinued: "Ngừng KD",
};

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    include: { category: true, _count: { select: { storeProducts: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-brand-dark">Sản phẩm & danh mục</h1>
          <p className="text-sm text-ink/50">Kho SP gốc · khung giá đại lý</p>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white">
          + Thêm SP mới
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-[10px] uppercase tracking-wide text-ink/50">
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Danh mục</th>
              <th className="p-3">Giá base</th>
              <th className="p-3">Khung đại lý</th>
              <th className="p-3">Đại lý bán</th>
              <th className="p-3">TT</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-black/5 hover:bg-brand-light/30">
                <td className="p-3">
                  <b className="text-brand-dark">{p.category?.icon} {p.name}</b>
                  {p.subtitle && <div className="text-xs text-ink/50">{p.subtitle}</div>}
                </td>
                <td className="p-3 text-xs text-ink/50">{p.sku}</td>
                <td className="p-3">{p.category?.name}</td>
                <td className="p-3">{formatVND(p.basePrice.toString())}</td>
                <td className="p-3 text-xs text-ink/60">
                  {formatVND(p.agentMinPrice.toString())} – {formatVND(p.agentMaxPrice.toString())}
                </td>
                <td className="p-3">{p._count.storeProducts}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_PILL[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="rounded-full border border-brand px-3 py-1 text-xs font-semibold text-brand"
                    >
                      Sửa
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-ink/50">
                  Chưa có sản phẩm. Nhấn &quot;+ Thêm SP mới&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
