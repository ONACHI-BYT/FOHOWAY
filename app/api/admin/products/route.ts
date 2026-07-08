import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { parseProductBody, validateProduct } from "@/app/lib/product-input";

// GET /api/admin/products → danh sách
export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, _count: { select: { storeProducts: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(products);
}

// POST /api/admin/products → tạo
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const d = parseProductBody(body);
  const errors = validateProduct(d);
  if (errors.length) return NextResponse.json({ errors }, { status: 400 });

  try {
    const created = await prisma.product.create({ data: d as any });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    const msg = e?.code === "P2002" ? "SKU hoặc slug đã tồn tại" : "Lỗi tạo sản phẩm";
    return NextResponse.json({ errors: [msg] }, { status: 400 });
  }
}
