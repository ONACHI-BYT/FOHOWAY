import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { formatVND } from "@/app/lib/format";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chờ xử lý", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700" },
  shipping: { label: "Đang giao", cls: "bg-blue-100 text-blue-700" },
  delivered: { label: "Hoàn thành", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700" },
  returned: { label: "Trả hàng", cls: "bg-red-100 text-red-700" },
};

export default async function OrderLookup({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { phone?: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  const phone = searchParams.phone?.trim();
  const orders = phone
    ? await prisma.order.findMany({
        where: { storeId: store.id, customerPhone: phone },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 font-heading text-3xl">Tra cứu đơn hàng</h1>
      <p className="mb-6 text-sm opacity-60">Nhập số điện thoại đã đặt hàng để xem đơn.</p>

      <form method="get" className="mb-8 flex gap-2">
        <input
          name="phone"
          defaultValue={phone ?? ""}
          placeholder="Số điện thoại"
          className="flex-1 rounded-lg border px-3 py-2.5 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        />
        <button style={{ background: "var(--brand)" }} className="rounded-lg px-5 text-sm font-semibold text-white">
          Tra cứu
        </button>
      </form>

      {phone && orders.length === 0 && <p className="opacity-60">Không tìm thấy đơn hàng cho SĐT này.</p>}

      <div className="space-y-3">
        {orders.map((o) => {
          const st = STATUS[o.orderStatus];
          return (
            <Link
              key={o.id}
              href={`/s/${store.slug}/don-hang/${o.orderCode}`}
              style={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: "var(--radius)" }}
              className="block border p-4 transition hover:shadow"
            >
              <div className="flex items-center justify-between">
                <b>#{o.orderCode}</b>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>{st.label}</span>
              </div>
              <div className="mt-1 text-sm opacity-70">
                {o.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
              </div>
              <div className="mt-1 text-sm font-semibold">{formatVND(o.totalAmount.toString())}</div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
