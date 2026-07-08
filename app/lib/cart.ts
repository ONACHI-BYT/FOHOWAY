import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

const COOKIE = "cart_sid";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày

// Đọc session id giỏ hàng (dùng được ở server component — chỉ đọc)
export function readCartSid(): string | undefined {
  return cookies().get(COOKIE)?.value;
}

// Tạo/đọc session id — CHỈ gọi trong Server Action / Route Handler (được set cookie)
export function ensureCartSid(): string {
  const jar = cookies();
  let sid = jar.get(COOKIE)?.value;
  if (!sid) {
    sid = crypto.randomUUID();
    jar.set(COOKIE, sid, { httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE });
  }
  return sid;
}

export interface CartLine {
  itemId: string;
  productId: string;
  name: string;
  emoji: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  available: boolean;
  stock: number;
}

export interface CartView {
  cartId: string | null;
  items: CartLine[];
  subtotal: number;
  count: number;
}

// Ghép cart items với giá + tồn hiện tại của cửa hàng (giá lấy realtime từ StoreProduct)
export async function getCartView(storeId: string): Promise<CartView> {
  const sid = readCartSid();
  const empty: CartView = { cartId: null, items: [], subtotal: 0, count: 0 };
  if (!sid) return empty;

  const cart = await prisma.cart.findUnique({
    where: { storeId_sessionId: { storeId, sessionId: sid } },
    include: { items: true },
  });
  if (!cart) return empty;
  if (cart.items.length === 0) return { ...empty, cartId: cart.id };

  const sps = await prisma.storeProduct.findMany({
    where: { storeId, productId: { in: cart.items.map((i) => i.productId) } },
    include: { product: { include: { category: true } } },
  });
  const map = new Map(sps.map((sp) => [sp.productId, sp]));

  const items: CartLine[] = cart.items.map((it) => {
    const sp = map.get(it.productId);
    if (!sp || !sp.isActive) {
      return { itemId: it.id, productId: it.productId, name: "(Ngừng bán)", emoji: "❓", qty: it.quantity, unitPrice: 0, lineTotal: 0, available: false, stock: 0 };
    }
    const unit = Number(sp.sellingPrice);
    return {
      itemId: it.id,
      productId: it.productId,
      name: sp.product.name,
      emoji: sp.product.category?.icon ?? "📦",
      qty: it.quantity,
      unitPrice: unit,
      lineTotal: unit * it.quantity,
      available: true,
      stock: sp.stockQuantity,
    };
  });

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return { cartId: cart.id, items, subtotal, count };
}

export async function getCartCount(storeId: string): Promise<number> {
  const sid = readCartSid();
  if (!sid) return 0;
  const cart = await prisma.cart.findUnique({
    where: { storeId_sessionId: { storeId, sessionId: sid } },
    include: { items: true },
  });
  return cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
}

export interface CheckoutQuote extends CartView {
  shipping: number;
  freeshipThreshold: number;
  txnFeePercent: number;
  platformFee: number; // thu của ĐẠI LÝ sau (không cộng vào tiền khách)
  total: number; // khách trả = subtotal + shipping
}

async function settingNumber(key: string, fallback: number): Promise<number> {
  const s = await prisma.platformSetting.findUnique({ where: { key } });
  return s ? Number(s.value) : fallback;
}

// Báo giá checkout: ship (freeship theo ngưỡng) + phí nền tảng theo gói của đại lý
export async function getCheckoutQuote(storeId: string): Promise<CheckoutQuote> {
  const view = await getCartView(storeId);
  const freeshipThreshold = await settingNumber("freeship_threshold", 500000);
  const shipping = view.subtotal > 0 && view.subtotal < freeshipThreshold ? 30000 : 0;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { subscription: { include: { plan: true } } },
  });
  const txnFeePercent = store?.subscription?.plan
    ? Number(store.subscription.plan.txnFeePercent)
    : await settingNumber("default_txn_fee_percent", 1.5);

  const platformFee = Math.round((view.subtotal * txnFeePercent) / 100);
  const total = view.subtotal + shipping;
  return { ...view, shipping, freeshipThreshold, txnFeePercent, platformFee, total };
}
