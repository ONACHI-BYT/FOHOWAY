import { scanBannedWords } from "@/app/lib/compliance";

// Chuẩn hóa payload sản phẩm từ form Admin
export function parseProductBody(b: any) {
  const num = (v: any) => (v === "" || v == null ? null : Number(String(v).replace(/[^\d.-]/g, "")));
  return {
    sku: String(b.sku ?? "").trim(),
    name: String(b.name ?? "").trim(),
    subtitle: b.subtitle || null,
    categoryId: b.categoryId || null,
    origin: b.origin || null,
    packaging: b.packaging || null,
    basePrice: num(b.basePrice),
    msrpPrice: num(b.msrpPrice),
    agentMinPrice: num(b.agentMinPrice),
    agentMaxPrice: num(b.agentMaxPrice),
    vatRate: num(b.vatRate) ?? 8,
    description: b.description || null,
    ingredients: b.ingredients || null,
    benefits: b.benefits || null,
    usageGuide: b.usageGuide || null,
    warnings: b.warnings || null,
    registrationNo: b.registrationNo || null,
    urlSlug: b.urlSlug || null,
    tags: Array.isArray(b.tags)
      ? b.tags
      : String(b.tags ?? "")
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
    status: b.status || "active",
  };
}

export function validateProduct(d: ReturnType<typeof parseProductBody>) {
  const errors: string[] = [];
  if (!d.sku) errors.push("Thiếu mã SKU");
  if (!d.name) errors.push("Thiếu tên sản phẩm");
  if (d.basePrice == null) errors.push("Thiếu giá bán");
  if (d.agentMinPrice == null || d.agentMaxPrice == null) errors.push("Thiếu khung giá đại lý");
  if (d.agentMinPrice != null && d.agentMaxPrice != null && d.agentMinPrice > d.agentMaxPrice)
    errors.push("Giá sàn không được lớn hơn giá trần");
  if (d.benefits) {
    const scan = scanBannedWords(d.benefits);
    if (scan.hasBanned) errors.push(`Công dụng chứa từ cấm TPCN: ${scan.found.join(", ")}`);
  }
  return errors;
}
