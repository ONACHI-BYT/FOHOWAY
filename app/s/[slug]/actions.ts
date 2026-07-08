"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { ensureCartSid, readCartSid, getCheckoutQuote } from "@/app/lib/cart";
import type { PaymentMethod } from "@prisma/client";

async function storeBySlug(slug: string) {
  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store || !store.isActive) throw new Error("Cửa hàng không tồn tại");
  return store;
}

// Thêm sản phẩm vào giỏ → chuyển tới trang giỏ
export async function addToCart(formData: FormData) {
  const slug = String(formData.get("slug"));
  const productId = String(formData.get("productId"));
  const qty = Math.max(1, Number(formData.get("qty") ?? 1));
  const store = await storeBySlug(slug);

  // Chỉ cho thêm SP mà cửa hàng đang bán
  const sp = await prisma.storeProduct.findUnique({
    where: { storeId_productId: { storeId: store.id, productId } },
  });
  if (!sp || !sp.isActive) throw new Error("Sản phẩm không khả dụng");

  const sid = ensureCartSid();
  const cart = await prisma.cart.upsert({
    where: { storeId_sessionId: { storeId: store.id, sessionId: sid } },
    update: {},
    create: { storeId: store.id, sessionId: sid },
    include: { items: true },
  });

  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + qty } });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity: qty } });
  }

  revalidatePath(`/s/${slug}`, "layout");
  redirect(`/s/${slug}/gio-hang`);
}

// Cập nhật số lượng (delta +1 / -1). Về 0 thì xóa dòng.
export async function updateQty(formData: FormData) {
  const slug = String(formData.get("slug"));
  const itemId = String(formData.get("itemId"));
  const delta = Number(formData.get("delta") ?? 0);

  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (item) {
    const next = item.quantity + delta;
    if (next <= 0) await prisma.cartItem.delete({ where: { id: itemId } });
    else await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: next } });
  }
  revalidatePath(`/s/${slug}/gio-hang`);
  revalidatePath(`/s/${slug}`, "layout");
}

export async function removeItem(formData: FormData) {
  const slug = String(formData.get("slug"));
  const itemId = String(formData.get("itemId"));
  await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => {});
  revalidatePath(`/s/${slug}/gio-hang`);
  revalidatePath(`/s/${slug}`, "layout");
}

// Đặt hàng: tạo Order + items + timeline, trừ tồn, cập nhật CRM, xóa giỏ.
export async function placeOrder(formData: FormData) {
  const slug = String(formData.get("slug"));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "cod") as PaymentMethod;
  const note = String(formData.get("note") ?? "").trim() || null;

  const store = await storeBySlug(slug);

  if (!fullName || !phone || !address) {
    redirect(`/s/${slug}/thanh-toan?error=missing`);
  }

  const quote = await getCheckoutQuote(store.id);
  if (quote.items.length === 0) redirect(`/s/${slug}/gio-hang`);

  // Kiểm tra tồn kho
  const unavailable = quote.items.filter((i) => !i.available || i.qty > i.stock);
  if (unavailable.length > 0) redirect(`/s/${slug}/gio-hang?error=stock`);

  const sid = readCartSid();
  const orderCode = "DL-" + Date.now().toString().slice(-7);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { storeId_phone: { storeId: store.id, phone } },
      update: {
        fullName,
        email,
        address,
        orderCount: { increment: 1 },
        totalSpent: { increment: quote.total },
        lastOrderAt: now,
      },
      create: { storeId: store.id, fullName, phone, email, address, orderCount: 1, totalSpent: quote.total, lastOrderAt: now },
    });

    const order = await tx.order.create({
      data: {
        orderCode,
        storeId: store.id,
        customerId: customer.id,
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        customerAddress: address,
        subtotal: quote.subtotal,
        discountAmount: 0,
        shippingFee: quote.shipping,
        totalAmount: quote.total,
        appliedTxnFeePercent: quote.txnFeePercent,
        platformFee: quote.platformFee,
        paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        notes: note,
        items: {
          create: quote.items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            quantity: i.qty,
            unitPrice: i.unitPrice,
            totalPrice: i.lineTotal,
          })),
        },
      },
    });

    await tx.orderTimeline.create({ data: { orderId: order.id, status: "pending", note: "Đơn hàng được tạo" } });

    for (const i of quote.items) {
      await tx.storeProduct.update({
        where: { storeId_productId: { storeId: store.id, productId: i.productId } },
        data: { stockQuantity: { decrement: i.qty } },
      });
    }

    if (quote.cartId) await tx.cartItem.deleteMany({ where: { cartId: quote.cartId } });
  });

  revalidatePath(`/s/${slug}`, "layout");
  redirect(`/s/${slug}/don-hang/${orderCode}`);
}
