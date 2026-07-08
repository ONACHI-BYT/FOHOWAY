import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { formatVND } from "@/app/lib/format";
import { getCheckoutQuote } from "@/app/lib/cart";
import { updateQty, removeItem } from "../actions";

export const dynamic = "force-dynamic";

export default async function CartPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  const q = await getCheckoutQuote(store.id);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-heading text-3xl">Giỏ hàng</h1>

      {searchParams.error === "stock" && (
        <div className="mb-4 rounded-lg border border-cta/40 bg-red-50 px-4 py-3 text-sm text-cta">
          ⚠ Một số sản phẩm vượt quá tồn kho hiện có. Vui lòng giảm số lượng.
        </div>
      )}

      {q.items.length === 0 ? (
        <div className="rounded-xl border py-16 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="opacity-60">Giỏ hàng trống.</p>
          <Link
            href={`/s/${store.slug}`}
            style={{ background: "var(--brand)" }}
            className="mt-4 inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
          {/* Danh sách */}
          <div>
            {q.items.map((it) => {
              const over = it.available && it.qty > it.stock;
              return (
                <div
                  key={it.itemId}
                  className="flex items-center gap-4 border-b py-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    style={{ background: "var(--surface2)", borderRadius: "var(--radius)" }}
                    className="grid h-16 w-16 flex-none place-items-center text-3xl"
                  >
                    {it.emoji}
                  </div>
                  <div className="flex-1">
                    <b className="text-sm">{it.name}</b>
                    {!it.available && <div className="text-xs text-cta">Sản phẩm ngừng bán — hãy xóa</div>}
                    {over && <div className="text-xs text-cta">Chỉ còn {it.stock} trong kho</div>}
                    <div className="mt-2 flex items-center gap-2">
                      <form action={updateQty}>
                        <input type="hidden" name="slug" value={store.slug} />
                        <input type="hidden" name="itemId" value={it.itemId} />
                        <input type="hidden" name="delta" value="-1" />
                        <button className="h-8 w-8 rounded border" style={{ borderColor: "var(--border)" }}>
                          −
                        </button>
                      </form>
                      <span className="w-8 text-center font-semibold">{it.qty}</span>
                      <form action={updateQty}>
                        <input type="hidden" name="slug" value={store.slug} />
                        <input type="hidden" name="itemId" value={it.itemId} />
                        <input type="hidden" name="delta" value="1" />
                        <button className="h-8 w-8 rounded border" style={{ borderColor: "var(--border)" }}>
                          +
                        </button>
                      </form>
                      <span className="ml-auto font-bold">{formatVND(it.lineTotal)}</span>
                      <form action={removeItem}>
                        <input type="hidden" name="slug" value={store.slug} />
                        <input type="hidden" name="itemId" value={it.itemId} />
                        <button className="ml-2 text-lg opacity-40 hover:text-cta hover:opacity-100" title="Xóa">
                          ✕
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tóm tắt */}
          <div>
            <div style={{ background: "var(--surface2)", borderRadius: "var(--radius)" }} className="p-5">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest">Tóm tắt</div>
              <Row label="Tạm tính" value={formatVND(q.subtotal)} />
              <Row
                label="Vận chuyển"
                value={q.shipping === 0 ? "Miễn phí" : formatVND(q.shipping)}
                accent={q.shipping === 0}
              />
              <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold" style={{ borderColor: "var(--border)" }}>
                <span>Tổng</span>
                <span>{formatVND(q.total)}</span>
              </div>
            </div>
            <Link
              href={`/s/${store.slug}/thanh-toan`}
              style={{ background: "var(--brand)", borderRadius: "var(--radius)" }}
              className="mt-4 block py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-white"
            >
              Tiến hành thanh toán
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-sm opacity-80">
      <span>{label}</span>
      <span style={accent ? { color: "var(--brand)" } : undefined}>{value}</span>
    </div>
  );
}
