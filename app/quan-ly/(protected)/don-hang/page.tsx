import { prisma } from "@/app/lib/prisma";
import { requireAgentStore } from "@/app/lib/auth";
import { formatVND } from "@/app/lib/format";
import { updateOrderStatus } from "../../actions";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: "Chờ xử lý", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700" },
  shipping: { label: "Đang giao", cls: "bg-blue-100 text-blue-700" },
  delivered: { label: "Hoàn thành", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700" },
  returned: { label: "Trả hàng", cls: "bg-red-100 text-red-700" },
};

// Nút hành động cho từng trạng thái
const ACTIONS: Partial<Record<OrderStatus, { to: OrderStatus; label: string; danger?: boolean }[]>> = {
  pending: [
    { to: "confirmed", label: "Xác nhận" },
    { to: "cancelled", label: "Hủy", danger: true },
  ],
  confirmed: [
    { to: "shipping", label: "Giao hàng" },
    { to: "cancelled", label: "Hủy", danger: true },
  ],
  shipping: [{ to: "delivered", label: "Đã giao" }],
};

const PAY_LABEL: Record<string, string> = {
  cod: "COD", bank_transfer: "CK", momo: "MoMo", zalopay: "ZaloPay", vnpay: "VNPay",
};

export default async function AgentOrders() {
  const { store } = await requireAgentStore();
  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl text-brand-dark">Quản lý đơn hàng</h1>
      <p className="mb-5 text-sm text-ink/50">Xác nhận · giao hàng · hoàn thành · hủy</p>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-[10px] uppercase tracking-wide text-ink/50">
              <th className="p-3">Mã</th>
              <th className="p-3">Khách</th>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">Tổng</th>
              <th className="p-3">TT</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Xử lý</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const st = STATUS[o.orderStatus];
              const actions = ACTIONS[o.orderStatus] ?? [];
              return (
                <tr key={o.id} className="border-b border-black/5 align-top hover:bg-brand-light/30">
                  <td className="p-3">
                    <b className="text-brand-dark">#{o.orderCode}</b>
                    <div className="text-[10px] text-ink/40">
                      {o.createdAt.toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="p-3">
                    {o.customerName}
                    <div className="text-[11px] text-ink/50">{o.customerPhone}</div>
                  </td>
                  <td className="p-3 text-xs text-ink/60">
                    {o.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                  </td>
                  <td className="p-3 font-semibold">{formatVND(o.totalAmount.toString())}</td>
                  <td className="p-3 text-xs">
                    {PAY_LABEL[o.paymentMethod]}
                    <div className={o.paymentStatus === "paid" ? "text-emerald-600" : "text-ink/40"}>
                      {o.paymentStatus === "paid" ? "Đã thu" : "Chưa thu"}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {actions.length === 0 && <span className="text-xs text-ink/30">—</span>}
                      {actions.map((a) => (
                        <form key={a.to} action={updateOrderStatus}>
                          <input type="hidden" name="orderId" value={o.id} />
                          <input type="hidden" name="to" value={a.to} />
                          <button
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              a.danger ? "border border-cta text-cta" : "bg-brand text-white"
                            }`}
                          >
                            {a.label}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-ink/50">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
