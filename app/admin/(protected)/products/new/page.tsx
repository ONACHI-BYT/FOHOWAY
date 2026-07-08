import { prisma } from "@/app/lib/prisma";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const categories = await prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="mb-5 font-heading text-2xl text-brand-dark">📦 Thêm sản phẩm mới</h1>
      <ProductForm mode="create" categories={categories} initial={{ status: "active", vatRate: "8" }} />
    </div>
  );
}
