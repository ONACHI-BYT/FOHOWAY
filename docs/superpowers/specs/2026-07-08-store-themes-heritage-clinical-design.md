# Thiết kế: 2 theme cửa hàng đại lý — Heritage & Clinical

Ngày: 2026-07-08
Trạng thái: chờ user duyệt

## Mục tiêu

Thay toàn bộ theme cửa hàng cũ (`nordic`/`jade`/`nature`) bằng **2 theme cao cấp, hiện đại** dựa trên nghiên cứu brand wellness 2026. CTV (đại lý) tự chọn theme cho cửa hàng của họ và **lưu vào DB** (hiện mới preview, chưa lưu). Mỗi theme quyết định đồng bộ: màu, **font tiêu đề/thân**, radius, kiểu nút, kiểu badge — đổi theme là đổi trọn "chất" trang.

Không đụng business logic, giá, đơn hàng. Chỉ lớp trình bày + 1 field theme + 1 action lưu.

## 2 theme

### `heritage` (Phương án A — Á Đông cao cấp) — mặc định mới
- Tham chiếu: Jade Dragon Herbs, Herbs of the Orient. Cảm giác: di sản thảo mộc Đông y, sang, đáng tin.
- Nền kem `#F7F4EC`, surface trắng; chủ đạo ngọc bích `#0D6B4F` / đậm `#094A37`; nhấn vàng đồng `#B8860B`.
- **Tiêu đề: Playfair Display** (weight 700–800 cho cứng cáp). **Thân: Be Vietnam Pro.**
- Radius vừa (10px), nút bo pill, badge viền mảnh ngọc bích.

### `clinical` (Phương án B — Wellness khoa học tối giản)
- Tham chiếu: Cymbiotika. Cảm giác: khoa học, minh bạch thành phần, nhiều khoảng trắng.
- Nền trắng `#FFFFFF`, surface `#F6F8F6`; mực xanh đậm `#16241D`; nhấn sage/emerald `#1D9E75`.
- **Tiêu đề: Be Vietnam Pro** (weight 600–700). **Thân: Be Vietnam Pro.**
- Radius nhỏ (8px), nút bo nhẹ, badge nền phẳng.

## Kiến trúc

### 1. Font (next/font)
- `app/layout.tsx` (hoặc nơi khai báo font hiện tại): thêm `Playfair_Display` từ `next/font/google` (subset `latin` + `vietnamese`, weight 500/600/700/800), phơi ra biến `--font-display`. Giữ Be Vietnam Pro (`--font-body`) và có thể bỏ Cormorant nếu không còn chỗ dùng.
- Kiểm tra Playfair Display có subset `vietnamese` trên Google Fonts; nếu next/font báo thiếu subset, fallback dùng `@fontsource` hoặc chấp nhận `latin-ext` (đủ phần lớn dấu) — xác minh render dấu ằ/ộ/ự/ưỡ trước khi chốt.

### 2. Enum & schema (Prisma)
- Đổi enum `StoreTheme`: `nordic|jade|nature` → `heritage|clinical`.
- `Store.theme` default: `nordic` → `heritage`.
- Migration: tạo enum mới, map dữ liệu cũ (mọi store hiện có → `heritage`), đổi default, drop giá trị cũ. Cập nhật `seed.ts` (store demo `minh-anh` dùng `heritage`).

### 3. `app/lib/themes.ts`
- `STORE_THEMES` chỉ còn 2 key `heritage`/`clinical`.
- Mở rộng `vars` mỗi theme, thêm token: `--font-heading`, `--font-body` (trỏ tới `--font-display`/`--font-body` toàn cục), `--radius`, `--radius-btn`, `--btn-bg`, `--btn-fg`, `--badge-bg`, `--badge-fg`, `--badge-border`. Giữ các token màu cũ (`--bg`,`--surface`,`--ink`,`--brand`,`--gold`,`--cta`...).
- Các component cửa hàng (`app/s/[slug]/**`) dùng các biến này thay vì hardcode; rà soát chỗ đang hardcode màu/radius/font.

### 4. Lưu theme (CTV)
- Thêm server action `updateStoreTheme(storeId, theme)` (validate theme ∈ enum) ghi vào DB.
- Theme switcher: từ preview-only → gọi action lưu. Đặt trong khu CTV quản lý (không để khách đổi theme trên trang công khai).
- **Nợ kỹ thuật đã biết:** chưa có auth. Action phải kèm chú thích TODO gate quyền (chỉ chủ store) — bắt buộc trước production, nhưng ngoài scope thay đổi này.

## Kiểm thử
- Migration chạy PASS; store cũ → `heritage`; seed PASS.
- `/s/minh-anh` render đúng 2 theme (đổi qua switcher, reload vẫn giữ theme đã lưu).
- Playfair Display hiển thị đủ dấu tiếng Việt trên tiêu đề.
- So sánh visual 2 theme khớp demo đã duyệt.

## Ngoài scope
Trang chủ site chính, admin, landing builder, auth thật, RLS. Chỉ lo theme cửa hàng đại lý.
