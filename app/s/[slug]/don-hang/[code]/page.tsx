import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { formatVND } from "@/app/lib/format";

export const dynamic = "force-dynamic";

const STEPS: { key: string; label: string }[] = [
  { key: "pending", label: "Đặt hàng" },
  { key: "confirmed", label: "Xác nhận" },
  { key: "shipping", label: "Vận chuyển" },
  { key: "delivered", label: "Giao hàng" },
];

const PAY_LABEL: Record<string, string> = {
  cod: "COD", bank_transfer: "Chuyển khoản", momo: "MoMo", zalopay: "ZaloPay", vnpay: "VNPay",
};

export default async function OrderDetail({ params }: { params: { slug: string; code: string } }) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  const order = await prisma.order.findFirst({
    where: { orderCode: params.code, storeId: store.id },
    include: { items: true, timeline: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();

  const cancelled = order.orderStatus === "cancelled" || order.orderStatus === "returned";
  const currentIdx = STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div style={{ background: "var(--surface2)", borderRadius: "var(--radius)" }} className="mb-6 p-5 text-center">
        <div className="text-4xl">{cancelled ? "❌" : "🎉"}</div>
        <h1 className="mt-2 font-heading text-2xl">
          {cancelled ? "Đơn đã hủy" : "Đặt hàng thành công!"}
        </h1>
        <p className="text-sm opacity-70">
          Mã đơn <b>#{order.orderCode}</b> · {PAY_LABEL[order.paymentMethod]} · {formatVND(order.totalAmount.toString())}
        </p>
      </div>

      {/* Timeline */}
      {!cancelled && (
        <div style={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: "var(--radius)" }} className="mb-6 border p-5">
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-widest">Trạng thái</div>
          <div className="flex justify-between">
            {STEPS.map((s, i) => {
              const done = i <= currentIdx;
              return (
                <div key={s.key} className="flex flex-1 flex-col items-center text-center">
                  <div
                    className="grid h-8 w-8 place-items-center rounded-full text-xs"
                    style={{ background: done ? "var(--brand)" : "var(--surface2)", color: done ? "#fff" : "var(--ink3)" }}
                  >
                    {i + 1}
                  </div>
                  <span className="mt-1.5 text-[11px]" style={{ color: done ? "var(--ink)" : "var(--ink3)" }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div style={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: "var(--radius)" }} className="border p-5">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest">Sản phẩm</div>
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between border-b py-2 text-sm" style={{ borderColor: "var(--border)" }}>
            <span>{it.productName} ×{it.quantity}</span>
            <b>{formatVND(it.totalPrice.toString())}</b>
          </div>
        ))}
        <div className="mt-3 space-y-1 text-sm opacity-80">
          <div className="flex justify-between"><span>Tạm tính</span><span>{formatVND(order.subtotal.toString())}</span></div>
          <div className="flex justify-between"><span>Vận chuyển</span><span>{Number(order.shippingFee) === 0 ? "Miễn phí" : formatVND(order.shippingFee.toString())}</span></div>
          <div className="flex justify-between border-t pt-2 text-base font-bold" style={{ borderColor: "var(--border)" }}>
            <span>Tổng</span><span>{formatVND(order.totalAmount.toString())}</span>
          </div>
        </div>
        <div className="mt-4 text-xs opacity-60">
          Giao tới: {order.customerName} · {order.customerPhone}<br />
          {order.customerAddress}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href={`/s/${store.slug}`} className="rounded-full border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: "var(--border)" }}>
          Tiếp tục mua sắm
        </Link>
        <Link href={`/s/${store.slug}/don-hang?phone=${order.customerPhone}`} style={{ background: "var(--brand)" }} className="rounded-full px-5 py-2.5 text-sm font-semibold text-white">
          Đơn hàng của tôi
        </Link>
      </div>
    </main>
  );
}
