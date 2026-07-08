"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireAgentStore } from "@/app/lib/auth";
import type { OrderStatus } from "@prisma/client";

// Chuyển trạng thái hợp lệ
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered"],
  delivered: [],
  cancelled: [],
  returned: [],
};

const NOTE: Record<OrderStatus, string> = {
  pending: "Đơn hàng được tạo",
  confirmed: "Đại lý đã xác nhận đơn",
  shipping: "Đã bàn giao vận chuyển",
  delivered: "Giao hàng thành công",
  cancelled: "Đơn đã bị hủy",
  returned: "Khách trả hàng",
};

export async function updateOrderStatus(formData: FormData) {
  const { store } = await requireAgentStore();
  const orderId = String(formData.get("orderId"));
  const to = String(formData.get("to")) as OrderStatus;

  const order = await prisma.order.findFirst({
    where: { id: orderId, storeId: store.id },
    include: { items: true },
  });
  if (!order) return;
  if (!NEXT[order.orderStatus]?.includes(to)) return; // chặn chuyển sai luồng

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        orderStatus: to,
        // COD giao thành công → coi như đã thu tiền
        ...(to === "delivered" && order.paymentMethod === "cod" ? { paymentStatus: "paid" } : {}),
        ...(to === "cancelled" ? { cancelledReason: "Đại lý hủy" } : {}),
      },
    });

    await tx.orderTimeline.create({ data: { orderId: order.id, status: to, note: NOTE[to] } });

    // Hủy đơn → hoàn tồn kho cho đại lý
    if (to === "cancelled") {
      for (const it of order.items) {
        if (!it.productId) continue;
        await tx.storeProduct.updateMany({
          where: { storeId: store.id, productId: it.productId },
          data: { stockQuantity: { increment: it.quantity } },
        });
      }
    }
  });

  revalidatePath("/quan-ly/don-hang");
  revalidatePath("/quan-ly");
}
