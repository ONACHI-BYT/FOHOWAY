import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { formatVND } from "@/app/lib/format";
import { getCheckoutQuote } from "@/app/lib/cart";
import { placeOrder } from "../actions";

export const dynamic = "force-dynamic";

const PAY = [
  ["cod", "💵 Thanh toán khi nhận hàng (COD)"],
  ["bank_transfer", "🏦 Chuyển khoản (VietQR)"],
  ["momo", "💗 Ví MoMo"],
  ["zalopay", "💙 ZaloPay"],
];

const INPUT = "w-full rounded-lg border px-3 py-2.5 text-sm";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  const q = await getCheckoutQuote(store.id);
  if (q.items.length === 0) redirect(`/s/${store.slug}/gio-hang`);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-heading text-3xl">Thanh toán</h1>

      {searchParams.error === "missing" && (
        <div className="mb-4 rounded-lg border border-cta/40 bg-red-50 px-4 py-3 text-sm text-cta">
          ⚠ Vui lòng nhập đủ Họ tên, Số điện thoại và Địa chỉ.
        </div>
      )}

      <form action={placeOrder} className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
        <input type="hidden" name="slug" value={store.slug} />

        {/* Thông tin giao hàng */}
        <div style={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: "var(--radius)" }} className="border p-6">
          <h2 className="mb-4 font-heading text-xl">Thông tin giao hàng</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold">Họ tên *</label>
              <input name="fullName" required className={INPUT} style={{ borderColor: "var(--border)", background: "var(--surface)" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Số điện thoại *</label>
                <input name="phone" required className={INPUT} style={{ borderColor: "var(--border)", background: "var(--surface)" }} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Email</label>
                <input name="email" type="email" className={INPUT} style={{ borderColor: "var(--border)", background: "var(--surface)" }} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Địa chỉ giao hàng *</label>
              <input name="address" required className={INPUT} style={{ borderColor: "var(--border)", background: "var(--surface)" }} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Ghi chú</label>
              <textarea name="note" rows={2} className={INPUT} style={{ borderColor: "var(--border)", background: "var(--surface)" }} />
            </div>
          </div>

          <h2 className="mb-3 mt-6 font-heading text-xl">Phương thức thanh toán</h2>
          <div className="space-y-2">
            {PAY.map(([val, label], i) => (
              <label
                key={val}
                className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm"
                style={{ borderColor: "var(--border)" }}
              >
                <input type="radio" name="paymentMethod" value={val} defaultChecked={i === 0} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Tóm tắt đơn */}
        <div>
          <div style={{ background: "var(--surface2)", borderRadius: "var(--radius)" }} className="p-5">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest">Đơn hàng ({q.count} SP)</div>
            {q.items.map((it) => (
              <div key={it.itemId} className="flex justify-between py-1 text-sm opacity-80">
                <span>
                  {it.emoji} {it.name} ×{it.qty}
                </span>
                <span>{formatVND(it.lineTotal)}</span>
              </div>
            ))}
            <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between py-1 text-sm opacity-80">
                <span>Tạm tính</span>
                <span>{formatVND(q.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-sm opacity-80">
                <span>Vận chuyển</span>
                <span style={q.shipping === 0 ? { color: "var(--brand)" } : undefined}>
                  {q.shipping === 0 ? "Miễn phí" : formatVND(q.shipping)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold" style={{ borderColor: "var(--border)" }}>
                <span>Tổng</span>
                <span>{formatVND(q.total)}</span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            style={{ background: "var(--cta)", borderRadius: "var(--radius)" }}
            className="mt-4 w-full py-3.5 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Đặt hàng
          </button>
          <p className="mt-3 text-center text-[11px] opacity-50">
            Đại lý {store.storeName} tự thu tiền & giao hàng. Sản phẩm không phải là thuốc.
          </p>
        </div>
      </form>
    </main>
  );
}
