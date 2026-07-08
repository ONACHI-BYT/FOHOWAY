import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { requireAgentStore } from "@/app/lib/auth";
import { formatVND } from "@/app/lib/format";

export const dynamic = "force-dynamic";

export default async function AgentDashboard() {
  const { store } = await requireAgentStore();

  const [total, pending, shipping, delivered, agg, feeAgg, customers] = await Promise.all([
    prisma.order.count({ where: { storeId: store.id } }),
    prisma.order.count({ where: { storeId: store.id, orderStatus: "pending" } }),
    prisma.order.count({ where: { storeId: store.id, orderStatus: "shipping" } }),
    prisma.order.count({ where: { storeId: store.id, orderStatus: "delivered" } }),
    prisma.order.aggregate({ where: { storeId: store.id, orderStatus: "delivered" }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { storeId: store.id, orderStatus: { not: "cancelled" } }, _sum: { platformFee: true } }),
    prisma.customer.count({ where: { storeId: store.id } }),
  ]);

  const revenue = Number(agg._sum.totalAmount ?? 0);
  const feeOwed = Number(feeAgg._sum.platformFee ?? 0);

  const kpis: [string, string][] = [
    ["Doanh thu (đã giao)", formatVND(revenue)],
    ["Tổng đơn", String(total)],
    ["Khách hàng", String(customers)],
    ["Phí nền tảng phải trả", formatVND(feeOwed)],
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl text-brand-dark">Dashboard</h1>
      <p className="mb-5 text-sm text-ink/50">Tổng quan cửa hàng {store.storeName}</p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map(([label, val]) => (
          <div key={label} className="rounded-xl border border-black/10 bg-white p-4">
            <small className="text-[10px] uppercase tracking-wide text-ink/50">{label}</small>
            <b className="mt-1 block font-heading text-2xl text-brand-dark">{val}</b>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Chờ xử lý", pending, "text-amber-600"],
          ["Đang giao", shipping, "text-blue-600"],
          ["Hoàn thành", delivered, "text-emerald-600"],
        ].map(([label, val, cls]) => (
          <div key={label as string} className="rounded-xl border border-black/10 bg-white p-4">
            <small className="text-[10px] uppercase tracking-wide text-ink/50">{label}</small>
            <b className={`mt-1 block font-heading text-3xl ${cls}`}>{val}</b>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-black/10 bg-white p-5">
        <p className="text-sm text-ink/60">
          {pending > 0 ? (
            <>
              Có <b className="text-cta">{pending}</b> đơn chờ xử lý.{" "}
              <Link href="/quan-ly/don-hang" className="font-semibold text-brand underline">
                Xử lý ngay →
              </Link>
            </>
          ) : (
            "Không có đơn chờ xử lý. 🎉"
          )}
        </p>
        <p className="mt-2 text-xs text-ink/40">
          Phí nền tảng {formatVND(feeOwed)} sẽ được đối soát & xuất hóa đơn theo kỳ.
        </p>
      </div>
    </div>
  );
}
