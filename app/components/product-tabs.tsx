"use client";

import { useState } from "react";

export interface ProductTabsData {
  description?: string | null;
  ingredients?: string | null;
  benefits?: string | null;
  usageGuide?: string | null;
}

const TABS: [keyof ProductTabsData, string][] = [
  ["description", "Mô tả"],
  ["ingredients", "Thành phần"],
  ["benefits", "Công dụng"],
  ["usageGuide", "Cách dùng"],
];

export function ProductTabs({ data }: { data: ProductTabsData }) {
  const available = TABS.filter(([k]) => data[k]);
  const [active, setActive] = useState<keyof ProductTabsData>(available[0]?.[0] ?? "description");

  if (available.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b-2 border-current/10">
        {available.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`-mb-0.5 border-b-2 px-3 py-2 text-xs font-semibold transition ${
              active === k ? "border-cta text-cta" : "border-transparent opacity-60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-[80px] whitespace-pre-line py-3 text-sm leading-relaxed opacity-90">
        {data[active]}
        {active === "benefits" && (
          <p className="mt-2 text-xs italic opacity-60">* Sản phẩm không phải là thuốc, không thay thế thuốc chữa bệnh.</p>
        )}
      </div>
    </div>
  );
}
