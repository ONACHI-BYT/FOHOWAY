import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { parseProductBody, validateProduct } from "@/app/lib/product-input";

// GET /api/admin/products/:id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { category: true } });
  if (!product) return NextResponse.json({ errors: ["Không tìm thấy sản phẩm"] }, { status: 404 });
  return NextResponse.json(product);
}

// PUT /api/admin/products/:id → cập nhật
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const d = parseProductBody(body);
  const errors = validateProduct(d);
  if (errors.length) return NextResponse.json({ errors }, { status: 400 });

  try {
    const updated = await prisma.product.update({ where: { id: params.id }, data: d as any });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ errors: ["Không tìm thấy sản phẩm"] }, { status: 404 });
    const msg = e?.code === "P2002" ? "SKU hoặc slug đã tồn tại" : "Lỗi cập nhật";
    return NextResponse.json({ errors: [msg] }, { status: 400 });
  }
}

// DELETE /api/admin/products/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ errors: ["Không tìm thấy sản phẩm"] }, { status: 404 });
    // P2003: còn ràng buộc (đang được đại lý bán / có trong đơn)
    return NextResponse.json(
      { errors: ["Không xóa được — sản phẩm đang được đại lý bán hoặc có trong đơn hàng. Hãy đặt trạng thái Ngừng KD."] },
      { status: 409 }
    );
  }
}
