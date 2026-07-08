# Store Themes: Heritage & Clinical — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay toàn bộ theme cửa hàng đại lý bằng 2 theme cao cấp `heritage` (Playfair Display + ngọc bích/vàng đồng) và `clinical` (Be Vietnam Pro + trắng/sage), font hóa thành token, và cho CTV chọn theme lưu vào DB.

**Architecture:** Font nạp qua `next/font` phơi thành CSS vars toàn cục (additive, không đụng font trang chính). Mỗi theme là một tập CSS vars (màu + font + radius + token nút/badge) áp trên wrapper `#store-root`. Đổi enum `StoreTheme` + migration remap dữ liệu cũ. Theme switcher gọi server action ghi `Store.theme`.

**Tech Stack:** Next.js 14, TypeScript, Prisma 6.19 + Postgres, Tailwind, `tsx` (chạy script test).

---

## ⚠️ RÀNG BUỘC BẮT BUỘC (đọc trước mọi task)

- **CHỈ đổi giá trị style**: màu, font, radius, token trình bày. Thay hex/px hardcode bằng `var(--token)`.
- **KHÔNG đổi cấu trúc/nội dung hiển thị** của bất kỳ trang nào: không thêm/bớt/đổi thứ tự phần tử, không sửa text, không đổi layout markup, không đổi logic.
- Nếu một task đòi hỏi sửa markup để đạt style → DỪNG, báo lại, không tự ý.
- Trang chính (`app/(main)`), admin: KHÔNG đụng. Chỉ cửa hàng đại lý `app/s/[slug]/**` + hạ tầng font/theme dùng chung.
- **Responsive bắt buộc**: mọi thay đổi style phải hoạt động tốt trên mọi màn hình (mobile ~375px, tablet ~768px, desktop ≥1280px). Không được để token mới (font, radius, spacing) gây tràn ngang, chữ vỡ, chồng lấp. Nếu cần chỉnh theo breakpoint thì làm bằng **giá trị style responsive** (vd `clamp()` trong token, media query CSS) — KHÔNG đổi markup. Nếu markup gốc vốn đã không responsive → FLAG lại, không tự sửa cấu trúc.

## File Structure

- Modify `app/layout.tsx` — thêm Playfair Display làm `--font-serif-display` (giữ nguyên Be Vietnam Pro `--font-body` và Cormorant `--font-heading` của trang chính).
- Rewrite `app/lib/themes.ts` — hợp đồng token 2 theme.
- Create `scripts/test-themes.ts` — assert token completeness (test).
- Modify `prisma/schema.prisma` — enum `StoreTheme` + default.
- Create `prisma/migrations/<ts>_store_themes_heritage_clinical/migration.sql` — remap enum an toàn.
- Modify `prisma/seed.ts` — store demo dùng `heritage`.
- Create `app/s/[slug]/theme-actions.ts` — server action lưu theme.
- Create `scripts/test-theme-action.ts` — assert validate theme (test).
- Modify `app/components/store-theme-switcher.tsx` — 2 theme + gọi action lưu.
- Modify (style-only) các file trong `app/s/[slug]/**` đang hardcode màu/radius/font → dùng var.

---

## Task 1: Nạp font Playfair Display toàn cục (additive)

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Xem file hiện tại**

Run: `sed -n '1,30p' app/layout.tsx`
Mục tiêu: xác nhận có `bodyFont` (`--font-body`) + `headingFont` Cormorant (`--font-heading`), và class nào đang gắn lên `<html>`/`<body>`.

- [ ] **Step 2: Thêm Playfair Display, giữ nguyên 2 font cũ**

Thêm import + khai báo (KHÔNG xóa Cormorant — trang chính vẫn dùng):

```tsx
import { Be_Vietnam_Pro, Cormorant_Garamond, Playfair_Display } from "next/font/google";

const displayFont = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-serif-display",
  display: "swap",
});
```

Gắn thêm `displayFont.variable` vào className của `<html>` (hoặc `<body>`) cạnh các variable font hiện có. Ví dụ nếu đang là:
`className={`${bodyFont.variable} ${headingFont.variable}`}`
→ đổi thành:
`className={`${bodyFont.variable} ${headingFont.variable} ${displayFont.variable}`}`

- [ ] **Step 3: Verify build + subset tiếng Việt**

Run: `npm run build`
Expected: build PASS, không lỗi "Unknown subset". Nếu `next/font` báo Playfair Display thiếu subset `vietnamese`, đổi `subsets` thành `["latin", "latin-ext"]` và ghi chú lại (latin-ext phủ phần lớn dấu tiếng Việt); xác minh trực quan ở Task 7.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx && git commit -m "feat(store): load Playfair Display as --font-serif-display"
```

---

## Task 2: Hợp đồng token 2 theme trong themes.ts (TDD)

**Files:**
- Create: `scripts/test-themes.ts`
- Modify: `app/lib/themes.ts`

- [ ] **Step 1: Viết test token completeness (fail trước)**

Create `scripts/test-themes.ts`:

```ts
import assert from "node:assert";
import { STORE_THEMES } from "../app/lib/themes";

const REQUIRED = [
  "--bg", "--surface", "--surface2", "--ink", "--ink2", "--ink3", "--border",
  "--brand", "--brand-dark", "--gold", "--cta",
  "--radius", "--radius-btn",
  "--font-heading", "--font-body",
  "--btn-bg", "--btn-fg", "--badge-bg", "--badge-fg", "--badge-border",
];

const keys = Object.keys(STORE_THEMES);
assert.deepStrictEqual(keys.sort(), ["clinical", "heritage"], `themes phải đúng 2: ${keys}`);

for (const [name, theme] of Object.entries(STORE_THEMES)) {
  assert.ok(theme.label, `${name} thiếu label`);
  for (const k of REQUIRED) {
    assert.ok(k in theme.vars, `${name} thiếu token ${k}`);
    assert.ok(theme.vars[k] !== "", `${name}.${k} rỗng`);
  }
}
console.log("PASS test-themes: 2 theme, đủ token");
```

- [ ] **Step 2: Chạy để thấy FAIL**

Run: `npx tsx scripts/test-themes.ts`
Expected: FAIL (themes.ts còn 3 key cũ nordic/jade/nature, thiếu token font/btn/badge).

- [ ] **Step 3: Viết lại themes.ts**

Replace toàn bộ `app/lib/themes.ts`:

```ts
// 2 theme cửa hàng đại lý. Mỗi theme = tập CSS variables áp lên #store-root qua inline style.
import type { StoreTheme } from "@prisma/client";

export interface ThemeTokens {
  label: string;
  vars: Record<string, string>;
}

export const STORE_THEMES: Record<StoreTheme, ThemeTokens> = {
  heritage: {
    label: "Á Đông cao cấp",
    vars: {
      "--bg": "#F7F4EC",
      "--surface": "#FFFFFF",
      "--surface2": "#EDE7DA",
      "--ink": "#1F2A24",
      "--ink2": "#4A5751",
      "--ink3": "#8A968F",
      "--border": "#E0D8C8",
      "--brand": "#0D6B4F",
      "--brand-dark": "#094A37",
      "--gold": "#B8860B",
      "--cta": "#0D6B4F",
      "--radius": "10px",
      "--radius-btn": "24px",
      "--font-heading": "var(--font-serif-display), Georgia, serif",
      "--font-body": "var(--font-body), system-ui, sans-serif",
      "--btn-bg": "#0D6B4F",
      "--btn-fg": "#FDF6E3",
      "--badge-bg": "#FFFFFF",
      "--badge-fg": "#094A37",
      "--badge-border": "rgba(13,107,79,0.20)",
    },
  },
  clinical: {
    label: "Wellness khoa học",
    vars: {
      "--bg": "#FFFFFF",
      "--surface": "#F6F8F6",
      "--surface2": "#EEF1EE",
      "--ink": "#16241D",
      "--ink2": "#5B6B62",
      "--ink3": "#8A968F",
      "--border": "#E4E9E5",
      "--brand": "#1D9E75",
      "--brand-dark": "#0F6E56",
      "--gold": "#6E8B7A",
      "--cta": "#16241D",
      "--radius": "8px",
      "--radius-btn": "8px",
      "--font-heading": "var(--font-body), system-ui, sans-serif",
      "--font-body": "var(--font-body), system-ui, sans-serif",
      "--btn-bg": "#16241D",
      "--btn-fg": "#FFFFFF",
      "--badge-bg": "#F6F8F6",
      "--badge-fg": "#16241D",
      "--badge-border": "transparent",
    },
  },
};
```

- [ ] **Step 4: Chạy test để PASS**

Run: `npx tsx scripts/test-themes.ts`
Expected: `PASS test-themes: 2 theme, đủ token`

- [ ] **Step 5: Commit**

```bash
git add app/lib/themes.ts scripts/test-themes.ts && git commit -m "feat(store): 2 theme heritage/clinical with font + btn + badge tokens"
```

---

## Task 3: Đổi enum StoreTheme + migration remap + seed

**Files:**
- Modify: `prisma/schema.prisma:36-40`
- Create: `prisma/migrations/<ts>_store_themes_heritage_clinical/migration.sql`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Sửa enum + default trong schema**

Trong `prisma/schema.prisma` đổi:

```prisma
enum StoreTheme {
  heritage
  clinical
}
```

Và trên model `Store`, đổi field theme default:

```prisma
  theme       StoreTheme @default(heritage)
```

- [ ] **Step 2: Tạo migration rỗng (create-only)**

Run: `npx prisma migrate dev --create-only --name store_themes_heritage_clinical`
Expected: sinh thư mục migration mới với `migration.sql` (nội dung Prisma tự đoán có thể sai với enum có dữ liệu — sẽ thay ở bước sau).

- [ ] **Step 3: Thay nội dung migration.sql bằng SQL remap an toàn**

Ghi đè `migration.sql` vừa tạo bằng:

```sql
ALTER TYPE "StoreTheme" RENAME TO "StoreTheme_old";
CREATE TYPE "StoreTheme" AS ENUM ('heritage', 'clinical');
ALTER TABLE "Store" ALTER COLUMN "theme" DROP DEFAULT;
ALTER TABLE "Store" ALTER COLUMN "theme" TYPE "StoreTheme"
  USING (CASE "theme"::text WHEN 'clinical' THEN 'clinical' ELSE 'heritage' END)::"StoreTheme";
ALTER TABLE "Store" ALTER COLUMN "theme" SET DEFAULT 'heritage';
DROP TYPE "StoreTheme_old";
```

- [ ] **Step 4: Áp migration + regenerate client**

Run: `npm run db:up && npx prisma migrate dev && npx prisma generate`
Expected: migration áp PASS; `StoreTheme` trong `@prisma/client` giờ là `heritage | clinical`.

- [ ] **Step 5: Sửa seed dùng heritage**

Trong `prisma/seed.ts` tìm chỗ tạo store demo có `theme: "nordic"` (hoặc jade/nature) → đổi thành `theme: "heritage"`.

Run: `grep -n "nordic\|jade\|nature\|theme:" prisma/seed.ts`

- [ ] **Step 6: Chạy seed lại**

Run: `npm run db:seed`
Expected: seed PASS, store `minh-anh` theme = heritage.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations prisma/seed.ts && git commit -m "feat(db): StoreTheme enum -> heritage/clinical + remap migration"
```

---

## Task 4: Server action lưu theme (TDD phần validate)

**Files:**
- Create: `app/s/[slug]/theme-actions.ts`
- Create: `scripts/test-theme-action.ts`

- [ ] **Step 1: Viết test validate (fail trước)**

Create `scripts/test-theme-action.ts`:

```ts
import assert from "node:assert";
import { isValidTheme } from "../app/s/[slug]/theme-actions";

assert.strictEqual(isValidTheme("heritage"), true);
assert.strictEqual(isValidTheme("clinical"), true);
assert.strictEqual(isValidTheme("nordic"), false);
assert.strictEqual(isValidTheme(""), false);
assert.strictEqual(isValidTheme("HERITAGE"), false);
console.log("PASS test-theme-action: validate theme");
```

- [ ] **Step 2: Chạy để thấy FAIL**

Run: `npx tsx scripts/test-theme-action.ts`
Expected: FAIL ("Cannot find module ... theme-actions").

- [ ] **Step 3: Viết server action + helper**

Create `app/s/[slug]/theme-actions.ts`:

```ts
"use server";

import { prisma } from "@/app/lib/prisma";
import { STORE_THEMES } from "@/app/lib/themes";
import type { StoreTheme } from "@prisma/client";
import { revalidatePath } from "next/cache";

export function isValidTheme(t: string): t is StoreTheme {
  return Object.prototype.hasOwnProperty.call(STORE_THEMES, t);
}

// TODO(auth): gate — chỉ chủ store (agent sở hữu) được đổi. Bổ sung khi có session/auth.
export async function updateStoreTheme(storeId: string, theme: string, slug: string) {
  if (!isValidTheme(theme)) throw new Error(`Theme không hợp lệ: ${theme}`);
  await prisma.store.update({ where: { id: storeId }, data: { theme } });
  revalidatePath(`/s/${slug}`);
}
```

Kiểm tra đường import prisma: `grep -rn "export.*prisma" app/lib/prisma.ts` — nếu tên khác (vd default export) thì chỉnh import cho khớp.

- [ ] **Step 4: Chạy test để PASS**

Run: `npx tsx scripts/test-theme-action.ts`
Expected: `PASS test-theme-action: validate theme`

- [ ] **Step 5: Commit**

```bash
git add app/s/\[slug\]/theme-actions.ts scripts/test-theme-action.ts && git commit -m "feat(store): server action updateStoreTheme + theme validation"
```

---

## Task 5: Theme switcher — 2 theme + lưu DB

**Files:**
- Modify: `app/components/store-theme-switcher.tsx`
- Modify: `app/s/[slug]/layout.tsx` (chỉ truyền thêm prop storeId/slug cho switcher — không đổi cấu trúc trang)

- [ ] **Step 1: Xem chỗ render switcher trong layout**

Run: `sed -n '85,95p' app/s/[slug]/layout.tsx`
Xác nhận dòng `<StoreThemeSwitcher initial={store.theme} />`.

- [ ] **Step 2: Truyền thêm storeId + slug (chỉ thêm props, không đổi markup khác)**

Đổi đúng dòng đó thành:

```tsx
<StoreThemeSwitcher initial={store.theme} storeId={store.id} slug={store.slug} />
```

- [ ] **Step 3: Viết lại switcher: 2 theme + gọi action**

Replace `app/components/store-theme-switcher.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { STORE_THEMES } from "@/app/lib/themes";
import { updateStoreTheme } from "@/app/s/[slug]/theme-actions";
import type { StoreTheme } from "@prisma/client";

const ORDER: StoreTheme[] = ["heritage", "clinical"];
const SWATCH: Record<StoreTheme, string> = {
  heritage: "linear-gradient(135deg,#0D6B4F,#B8860B)",
  clinical: "linear-gradient(135deg,#FFFFFF,#1D9E75)",
};

// Đổi theme: preview tức thì trên #store-root + lưu DB qua server action.
export function StoreThemeSwitcher({
  initial,
  storeId,
  slug,
}: {
  initial: StoreTheme;
  storeId: string;
  slug: string;
}) {
  const [active, setActive] = useState<StoreTheme>(initial);
  const [pending, startTransition] = useTransition();

  function apply(t: StoreTheme) {
    const root = document.getElementById("store-root");
    if (root) {
      for (const [k, v] of Object.entries(STORE_THEMES[t].vars)) root.style.setProperty(k, v);
    }
    setActive(t);
    startTransition(() => updateStoreTheme(storeId, t, slug));
  }

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex gap-1.5 rounded-full bg-black/90 p-2 shadow-xl backdrop-blur">
      {ORDER.map((t) => (
        <button
          key={t}
          title={STORE_THEMES[t].label}
          onClick={() => apply(t)}
          disabled={pending}
          style={{ background: SWATCH[t] }}
          className={`h-8 w-8 rounded-full border-2 transition ${
            active === t ? "border-white" : "border-white/20"
          }`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Type-check + build**

Run: `npm run build`
Expected: build PASS, không lỗi type.

- [ ] **Step 5: Commit**

```bash
git add app/components/store-theme-switcher.tsx app/s/\[slug\]/layout.tsx && git commit -m "feat(store): theme switcher 2 themes, persist to DB"
```

---

## Task 6: Style-only — thay hardcode bằng token (KHÔNG đổi markup)

**Files:**
- Modify (chỉ giá trị style): các file `app/s/[slug]/**` có màu/radius/font hardcode.

- [ ] **Step 1: Tìm chỗ hardcode trong subtree cửa hàng**

Run: `grep -rniE "#[0-9a-f]{3,6}|rounded-|font-(heading|body|serif)|Cormorant" app/s/\[slug\] app/components/store-* 2>/dev/null`
Liệt kê các chỗ dùng màu hex trực tiếp / radius cứng / font cứng.

- [ ] **Step 2: Thay từng giá trị bằng var token (giữ nguyên phần tử)**

Với mỗi chỗ tìm được, CHỈ đổi giá trị:
- màu hex → `var(--brand)` / `var(--ink)` / `var(--gold)` ... đúng vai trò.
- radius cứng → `var(--radius)` hoặc `var(--radius-btn)` (nút).
- font tiêu đề → `var(--font-heading)`; thân → `var(--font-body)` (thường qua class Tailwind `font-heading`/`font-body` đã trỏ var — nếu đã dùng class thì để nguyên).

KHÔNG thêm/xóa thẻ, không đổi text, không đổi thứ tự. Nếu một chỗ hardcode nằm ngoài subtree cửa hàng → bỏ qua.

- [ ] **Step 3: Build + so khớp trước/sau**

Run: `npm run build`
Expected: build PASS. Cấu trúc DOM không đổi (chỉ giá trị CSS đổi).

- [ ] **Step 4: Commit**

```bash
git add -A app/s/\[slug\] app/components && git commit -m "style(store): use theme tokens instead of hardcoded values (no markup change)"
```

---

## Task 7: Kiểm thử trực quan 2 theme + dấu tiếng Việt

**Files:** (không sửa file — chỉ verify)

- [ ] **Step 1: Chạy app**

Run: `npm run db:up` rồi `npm run dev` (dùng preview_start nếu có).

- [ ] **Step 2: Mở cửa hàng demo**

Mở `http://localhost:3000/s/minh-anh`. Xác nhận render theme `heritage`.

- [ ] **Step 3: Kiểm tra font tiêu đề tiếng Việt (heritage)**

Dùng preview_inspect trên một tiêu đề: xác nhận `font-family` phân giải về Playfair Display và các dấu (ằ, ộ, ự, ưỡ, ườ) hiển thị đầy đủ, không bị hộp vuông / mất dấu. Nếu mất dấu → quay lại Task 1 Step 3 đổi subset và build lại.

- [ ] **Step 4: Đổi sang clinical + reload**

Bấm swatch `clinical` trong switcher → giao diện đổi trắng/sage/sans. Reload trang: xác nhận theme vẫn là `clinical` (đã lưu DB).

- [ ] **Step 5: Kiểm tra responsive đủ breakpoint (cả 2 theme)**

Với TỪNG theme (heritage + clinical), dùng preview_resize kiểm tra 3 mốc:
- mobile 375×812, tablet 768×1024, desktop 1280×800.

Ở mỗi mốc xác nhận: KHÔNG tràn ngang (không có thanh scroll ngang body), tiêu đề Playfair không bị cắt/tràn, nút/badge không vỡ, ảnh/lưới co giãn đúng. Dùng preview_eval `document.documentElement.scrollWidth <= window.innerWidth` → phải `true` ở cả 3 mốc.

Nếu một theme gây tràn (vd `--radius-btn` quá lớn, tiêu đề serif dài trên mobile): chỉnh **giá trị token** cho responsive (vd `--font-heading` dùng cỡ qua `clamp()` ở CSS store-root, hoặc giảm token) — KHÔNG đổi markup. Nếu tràn do bản thân markup gốc không responsive → FLAG, dừng.

- [ ] **Step 6: Chụp bằng chứng**

preview_screenshot cả 2 theme ở mobile + desktop để đối chiếu với demo đã duyệt.

- [ ] **Step 7: Chạy lại toàn bộ test logic**

Run: `npx tsx scripts/test-themes.ts && npx tsx scripts/test-theme-action.ts`
Expected: cả 2 in PASS.

---

## Ghi chú
- Repo chưa `git init`. Nếu muốn dùng các bước commit ở trên: chạy `git init` trước, hoặc bỏ qua phần commit và gom lại cuối.
- `next/font` Playfair Display: nếu thiếu subset `vietnamese`, dùng `latin-ext` (Task 1 Step 3) — bắt buộc verify trực quan ở Task 7 Step 3.
- Nợ kỹ thuật giữ nguyên: chưa auth-gate action đổi theme (đã ghi TODO trong `theme-actions.ts`).
