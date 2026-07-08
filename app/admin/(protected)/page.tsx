import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { formatVND } from "@/app/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, agentCount, storeCount, activeProducts] = await Promise.all([
    prisma.product.count(),
    prisma.agentProfile.count(),
    prisma.store.count({ where: { isActive: true } }),
    prisma.product.count({ where: { status: "active" } }),
  ]);

  const kpis = [
    ["Sản phẩm", productCount, ""],
    ["Đang bán", activeProducts, ""],
    ["Đại lý", agentCount, ""],
    ["Cửa hàng mở", storeCount, ""],
  ] as const;

  return (
    <div>
      <h1 className="font-heading text-2xl text-brand-dark">Dashboard</h1>
      <p className="mb-5 text-sm text-ink/50">Toàn cảnh nền tảng FOHOWAY Việt Nam</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map(([label, val]) => (
          <div key={label} className="rounded-xl border border-black/10 bg-white p-4">
            <small className="text-[10px] uppercase tracking-wide text-ink/50">{label}</small>
            <b className="mt-1 block font-heading text-3xl text-brand-dark">{val}</b>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-black/10 bg-white p-5">
        <h3 className="font-heading text-lg text-brand-dark">Bắt đầu nhanh</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/admin/products" className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white">
            Quản lý sản phẩm →
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-full border border-brand px-4 py-2 text-xs font-semibold text-brand"
          >
            + Thêm sản phẩm
          </Link>
        </div>
        <p className="mt-3 text-xs text-ink/50">
          Giá tham chiếu ví dụ: khung đại lý áp dụng khi họ chọn bán. VD Đông trùng {formatVND(870000)}–
          {formatVND(1050000)}.
        </p>
      </div>
    </div>
  );
}
