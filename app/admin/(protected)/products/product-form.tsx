"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

export interface ProductFormValues {
  id?: string;
  sku?: string;
  name?: string;
  subtitle?: string;
  categoryId?: string;
  origin?: string;
  packaging?: string;
  basePrice?: string;
  msrpPrice?: string;
  agentMinPrice?: string;
  agentMaxPrice?: string;
  vatRate?: string;
  description?: string;
  ingredients?: string;
  benefits?: string;
  usageGuide?: string;
  warnings?: string;
  registrationNo?: string;
  urlSlug?: string;
  tags?: string;
  status?: string;
}

const LABEL = "block text-[11px] font-semibold text-brand-dark mb-1";
const INPUT = "w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-2 focus:outline-brand";

export function ProductForm({
  categories,
  initial,
  mode,
}: {
  categories: Category[];
  initial: ProductFormValues;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValues>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [scan, setScan] = useState<{ hasBanned: boolean; found: string[] } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof ProductFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((s) => ({ ...s, [k]: e.target.value }));

  async function checkBenefits() {
    const res = await fetch("/api/ai/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: v.benefits ?? "" }),
    });
    setScan(await res.json());
  }

  async function submit() {
    setBusy(true);
    setErrors([]);
    const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${initial.id}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({ errors: ["Lỗi không xác định"] }));
      setErrors(data.errors ?? ["Lỗi lưu sản phẩm"]);
    }
  }

  return (
    <div className="rounded-xl border-2 border-gold bg-white p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cột trái */}
        <div>
          <SectionTitle>Thông tin cơ bản</SectionTitle>
          <Field label="Tên sản phẩm *"><input className={INPUT} value={v.name ?? ""} onChange={set("name")} /></Field>
          <Field label="Tên phụ / Mô tả ngắn"><input className={INPUT} value={v.subtitle ?? ""} onChange={set("subtitle")} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mã SKU *"><input className={INPUT} value={v.sku ?? ""} onChange={set("sku")} placeholder="FHW-XXX-00" /></Field>
            <Field label="Danh mục *">
              <select className={INPUT} value={v.categoryId ?? ""} onChange={set("categoryId")}>
                <option value="">— Chọn —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Xuất xứ"><input className={INPUT} value={v.origin ?? ""} onChange={set("origin")} /></Field>
            <Field label="Quy cách"><input className={INPUT} value={v.packaging ?? ""} onChange={set("packaging")} /></Field>
          </div>

          <SectionTitle className="mt-5">Giá & Thuế</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá bán (chưa thuế) *"><input className={INPUT} value={v.basePrice ?? ""} onChange={set("basePrice")} inputMode="numeric" /></Field>
            <Field label="Giá niêm yết (MSRP)"><input className={INPUT} value={v.msrpPrice ?? ""} onChange={set("msrpPrice")} inputMode="numeric" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá sàn đại lý *"><input className={INPUT} value={v.agentMinPrice ?? ""} onChange={set("agentMinPrice")} inputMode="numeric" /></Field>
            <Field label="Giá trần đại lý *"><input className={INPUT} value={v.agentMaxPrice ?? ""} onChange={set("agentMaxPrice")} inputMode="numeric" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Thuế VAT (%)"><input className={INPUT} value={v.vatRate ?? "8"} onChange={set("vatRate")} inputMode="numeric" /></Field>
            <Field label="Trạng thái">
              <select className={INPUT} value={v.status ?? "active"} onChange={set("status")}>
                <option value="active">Đang bán</option>
                <option value="hidden">Ẩn</option>
                <option value="out_of_stock">Hết hàng</option>
                <option value="discontinued">Ngừng KD</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Cột phải */}
        <div>
          <SectionTitle>Mô tả & Nội dung</SectionTitle>
          <Field label="Mô tả chi tiết"><textarea rows={3} className={INPUT} value={v.description ?? ""} onChange={set("description")} /></Field>
          <Field label="Thành phần"><textarea rows={2} className={INPUT} value={v.ingredients ?? ""} onChange={set("ingredients")} /></Field>
          <Field label="Công dụng — kiểm duyệt TPCN">
            <textarea rows={2} className={INPUT} value={v.benefits ?? ""} onChange={set("benefits")} />
            <button
              type="button"
              onClick={checkBenefits}
              className="mt-1.5 rounded-full border border-brand px-3 py-1 text-[11px] font-semibold text-brand"
            >
              🤖 Quét từ cấm
            </button>
            {scan && (
              <div className={`mt-1.5 text-xs ${scan.hasBanned ? "text-cta" : "text-emerald-600"}`}>
                {scan.hasBanned ? `⚠ Chứa từ cấm: ${scan.found.join(", ")}` : "✓ Không phát hiện từ cấm"}
              </div>
            )}
          </Field>
          <Field label="Cách sử dụng"><textarea rows={2} className={INPUT} value={v.usageGuide ?? ""} onChange={set("usageGuide")} /></Field>
          <Field label="Cảnh báo / Chống chỉ định"><input className={INPUT} value={v.warnings ?? ""} onChange={set("warnings")} /></Field>
          <Field label="Số ĐKSP"><input className={INPUT} value={v.registrationNo ?? ""} onChange={set("registrationNo")} /></Field>

          <SectionTitle className="mt-5">SEO</SectionTitle>
          <Field label="URL slug"><input className={INPUT} value={v.urlSlug ?? ""} onChange={set("urlSlug")} placeholder="ten-san-pham" /></Field>
          <Field label="Tags (phân cách bằng dấu phẩy)"><input className={INPUT} value={v.tags ?? ""} onChange={set("tags")} /></Field>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-gold-light px-4 py-3 text-xs text-amber-900">
        ⚠ Nội dung &quot;Công dụng&quot; được quét từ cấm TPCN khi lưu. Vi phạm sẽ bị từ chối. Sau khi lưu, SP đồng bộ
        tới kho để đại lý chọn bán (giá đại lý phải trong khung sàn–trần).
      </div>

      {errors.length > 0 && (
        <ul className="mt-4 rounded-lg border border-cta/40 bg-red-50 p-3 text-sm text-cta">
          {errors.map((e, i) => (
            <li key={i}>• {e}</li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={() => router.push("/admin/products")}
          className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold"
        >
          Hủy
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Đang lưu..." : mode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-3 border-b-2 border-gold pb-1.5 text-[11px] font-bold uppercase tracking-wide text-brand ${className}`}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}
