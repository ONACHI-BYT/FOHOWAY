"use client";

import { useState } from "react";
import { ProductCard, type ProductCardData } from "@/app/components/product-card";

export interface FilterableProduct extends ProductCardData {
  id: string;
  categorySlug: string;
}

export function ProductFilterGrid({
  products,
  categories,
}: {
  products: FilterableProduct[];
  categories: { slug: string; name: string; icon?: string | null }[];
}) {
  const [active, setActive] = useState("all");
  const shown = active === "all" ? products : products.filter((p) => p.categorySlug === active);

  const tabs = [{ slug: "all", name: "Tất cả", icon: "" }, ...categories];

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.slug}
            onClick={() => setActive(t.slug)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
              active === t.slug
                ? "border-brand bg-brand text-white"
                : "border-black/10 bg-white text-ink/70 hover:bg-brand-light"
            }`}
          >
            {t.icon} {t.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {shown.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
      {shown.length === 0 && <p className="py-10 text-center text-ink/50">Không có sản phẩm.</p>}
    </>
  );
}
