import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { ProductForm, type ProductFormValues } from "../../product-form";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  const initial: ProductFormValues = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    subtitle: product.subtitle ?? "",
    categoryId: product.categoryId ?? "",
    origin: product.origin ?? "",
    packaging: product.packaging ?? "",
    basePrice: product.basePrice.toString(),
    msrpPrice: product.msrpPrice?.toString() ?? "",
    agentMinPrice: product.agentMinPrice.toString(),
    agentMaxPrice: product.agentMaxPrice.toString(),
    vatRate: product.vatRate.toString(),
    description: product.description ?? "",
    ingredients: product.ingredients ?? "",
    benefits: product.benefits ?? "",
    usageGuide: product.usageGuide ?? "",
    warnings: product.warnings ?? "",
    registrationNo: product.registrationNo ?? "",
    urlSlug: product.urlSlug ?? "",
    tags: product.tags.join(", "),
    status: product.status,
  };

  return (
    <div>
      <h1 className="mb-5 font-heading text-2xl text-brand-dark">✏ Chỉnh sửa: {product.name}</h1>
      <ProductForm mode="edit" categories={categories} initial={initial} />
    </div>
  );
}
