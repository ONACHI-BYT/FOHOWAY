"use client";

import { useState } from "react";
import { STORE_THEMES } from "@/app/lib/themes";
import type { StoreTheme } from "@prisma/client";

const ORDER: StoreTheme[] = ["nordic", "jade", "nature"];
const SWATCH: Record<StoreTheme, string> = {
  nordic: "linear-gradient(135deg,#F4F3EF,#fff)",
  jade: "linear-gradient(135deg,#0B2E24,#1A5540)",
  nature: "linear-gradient(135deg,#E8DCC8,#C4A86B)",
};

// Preview theme phía client (không lưu DB) — đổi CSS vars trên wrapper #store-root
export function StoreThemeSwitcher({ initial }: { initial: StoreTheme }) {
  const [active, setActive] = useState<StoreTheme>(initial);

  function apply(t: StoreTheme) {
    const root = document.getElementById("store-root");
    if (!root) return;
    for (const [k, v] of Object.entries(STORE_THEMES[t].vars)) root.style.setProperty(k, v);
    setActive(t);
  }

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex gap-1.5 rounded-full bg-black/90 p-2 shadow-xl backdrop-blur">
      {ORDER.map((t) => (
        <button
          key={t}
          title={STORE_THEMES[t].label}
          onClick={() => apply(t)}
          style={{ background: SWATCH[t] }}
          className={`h-8 w-8 rounded-full border-2 transition ${
            active === t ? "border-white" : "border-white/20"
          }`}
        />
      ))}
    </div>
  );
}
