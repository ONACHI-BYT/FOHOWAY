# FOHOWAY Platform

Nền tảng thương hiệu + mạng lưới **đại lý** FOHOWAY Việt Nam (mô hình reseller, **không đa cấp**).

- **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · PostgreSQL 16 · Prisma 6
- **Kiến trúc:** Main site (`/`) · Cửa hàng đại lý multi-tenant (`/s/{slug}`) · Admin (`/admin`)

## Quickstart

```bash
npm install
npm run db:up            # Postgres qua Docker (port 5433)
npm run prisma:migrate   # tạo schema + trigger khung giá
npm run db:seed          # dữ liệu mẫu (6 SP, gói cước, 1 đại lý demo)
npm run dev              # http://localhost:3000
```

Yêu cầu: Node 20+, Docker Desktop.

## Mô hình đã chốt (xem `docs/` + memory)

| Khía cạnh | Quyết định |
|---|---|
| Đại lý | Reseller, ăn chênh lệch giá trong khung sàn–trần Admin. Không đa cấp. |
| Doanh thu | Gói Free/PRO + phí GD %/gói + add-ons (đều đổi được qua Admin) |
| Kho | Đại lý tự giữ tồn riêng (`store_products`, `store_variant_stocks`) + tự ship |
| Dòng tiền | Đại lý = hộ KD độc lập, tự thu tiền, tự khai thuế. Nền tảng thu phí qua `platform_invoices` |
| Scope P1 | VI-only + có kênh Spa |

## Cấu trúc

```
app/            — Next.js App Router (UI + API)
app/lib/        — prisma client, helpers
prisma/         — schema.prisma, migrations, seed.ts
prototype/      — 3 file HTML mockup gốc (spec UI/UX)
docs/           — FOHOWAY-PLATFORM-TECHNICAL-GUIDE.md
```

## Business rule được enforce ở DB

- **Khung giá:** trigger `trg_store_product_price_band` từ chối `sellingPrice` ngoài `[agentMinPrice, agentMaxPrice]`.
- **Snapshot phí:** `orders.appliedTxnFeePercent` giữ % phí lúc đặt đơn → Admin đổi phí không làm sai đơn cũ.
