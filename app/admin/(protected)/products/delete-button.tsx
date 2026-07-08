"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.errors?.[0] ?? "Lỗi xóa sản phẩm");
    }
  }

  return (
    <button
      onClick={onDelete}
      disabled={busy}
      className="rounded-full border border-cta px-3 py-1 text-xs font-semibold text-cta disabled:opacity-50"
    >
      {busy ? "..." : "Xóa"}
    </button>
  );
}
