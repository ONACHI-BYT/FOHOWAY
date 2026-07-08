# FOHOWAY Vietnam — Hướng dẫn Kiến trúc & Phát triển Platform

> **Tài liệu dành cho Claude Code** — Tóm tắt toàn bộ thiết kế, kiến trúc, database, và yêu cầu kỹ thuật để xây dựng production platform từ 3 file HTML prototype.

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Bối cảnh
- **FOHOWAY Group**: Tập đoàn sức khỏe quốc tế, thành lập tại Moscow 2007, hoạt động 30+ quốc gia
- **Triết lý**: Đông y — Ba học thuyết dưỡng sinh (Dinh dưỡng · Hành vi · Tâm lý)
- **Giá trị thương hiệu**: 和治友德 (Hòa – Trị – Hữu – Đức / Harmony – Governance – Friendship – Virtue)
- **Việt Nam**: Thị trường thứ 36, gia nhập tháng 6/2024
- **Mô hình kinh doanh**: Bán hàng qua mạng lưới CTV (Cộng tác viên / Affiliate)

### 1.2 Mục tiêu Platform
Xây dựng hệ sinh thái số gồm 3 phần:
1. **Main Website** — Brand hub, kiến thức, giới thiệu, đăng ký CTV
2. **CTV Sub-Store** — Mỗi CTV có 1 cửa hàng riêng (multi-tenant) với giao diện tùy biến
3. **Admin Console** — Quản trị toàn nền tảng (sản phẩm, CTV, đơn hàng, tuân thủ, AI)

### 1.3 Prototype Files (tham khảo)
```
fohoway-frontend-prototype.html  — 32KB — Main Website (5 trang SPA)
fohoway-store.html               — 92KB — CTV Store (6 tab KH + 16 module quản lý + 3 theme)
fohoway-admin-prototype.html     — 40KB — Admin Console (12 module)
```

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Tech Stack đề xuất
```
Frontend:    Next.js 14+ (App Router) + TypeScript + Tailwind CSS
Backend:     Next.js API Routes hoặc tách riêng NestJS
Database:    PostgreSQL 16 + Prisma ORM
Cache:       Redis (session, rate limit, realtime)
Storage:     AWS S3 / Cloudflare R2 (ảnh SP, media, avatar)
Search:      Meilisearch hoặc Typesense (full-text tiếng Việt)
Queue:       BullMQ (email, webhook, đối soát)
AI Chat:     Anthropic Claude API (claude-sonnet-4-6)
Payment:     VNPay / MoMo / ZaloPay API + escrow logic
Shipping:    GHN / GHTK / VPost / J&T API
Hosting:     Vercel (frontend) + Railway/Fly.io (backend) + Supabase/Neon (DB)
CDN:         Cloudflare
```

### 2.2 Multi-tenant Architecture
```
┌─────────────────────────────────────────────────┐
│                  FOHOWAY Platform                │
├──────────┬──────────────────┬───────────────────┤
│ Main Site│   CTV Stores     │   Admin Console   │
│ /        │   /s/{slug}      │   /admin          │
│ (public) │   (multi-tenant) │   (RBAC-gated)    │
├──────────┴──────────────────┴───────────────────┤
│              Shared API Layer                    │
│         /api/v1/* (REST + tRPC)                  │
├─────────────────────────────────────────────────┤
│     PostgreSQL (shared DB, tenant isolation)     │
│     Redis · S3 · AI · Payment · Shipping APIs    │
└─────────────────────────────────────────────────┘
```

### 2.3 URL Structure
```
fohoway.vn/                    → Main Website
fohoway.vn/s/minh-anh          → CTV Store (slug-based)
fohoway.vn/s/minh-anh/manage   → CTV Management (login-gated)
fohoway.vn/lp/minh-anh/dong-trung → CTV Landing Page
fohoway.vn/admin               → Platform Admin Console
```

---

## 3. FILE 1 — MAIN WEBSITE (`fohoway-frontend-prototype.html`)

### 3.1 Pages (SPA)
| Trang | Mô tả |
|-------|-------|
| **Trang chủ** | Hero banner, giới thiệu FOHOWAY, sản phẩm nổi bật, tin tức |
| **Về FOHOWAY** | Lịch sử, triết lý 和治友德, 3 học thuyết, nhà máy, chứng nhận |
| **Sản phẩm** | Catalog (KHÔNG có giỏ hàng), lọc theo danh mục, chi tiết SP |
| **Thư viện** | Bài viết, video, podcast, tài liệu dưỡng sinh |
| **Đối tác** | Giới thiệu mô hình CTV, quyền lợi, form đăng ký 3 bước |

### 3.2 CTV Registration Flow (3 bước)
```
Bước 1: Thông tin cá nhân (họ tên, CCCD, SĐT, email, địa chỉ)
Bước 2: Thông tin kinh doanh (MST nếu có, kinh nghiệm, kênh bán)
Bước 3: Xác minh (upload CCCD 2 mặt, selfie cầm CCCD) → eKYC
→ Submit → Admin duyệt → Cấp mã CTV + tạo sub-store
```

### 3.3 AI Chatbot Bubble
- Hiện trên góc phải dưới (cấu hình từ Admin)
- Trả lời câu hỏi về FOHOWAY, sản phẩm, chính sách
- Knowledge base: tài liệu FOHOWAY + FAQ
- Model: Claude Sonnet (cấu hình system prompt từ Admin)

---

## 4. FILE 2 — CTV SUB-STORE (`fohoway-store.html`)

### 4.1 Customer-facing (6 tab)
| Tab | Chức năng |
|-----|-----------|
| **Trang chủ** | Hero ảnh, advantages strip (3 cột), SP nổi bật, bài kiến thức |
| **Sản phẩm** | Grid 3 cột, filter theo danh mục, card (ảnh + tên + giá + đã bán) |
| **Giỏ hàng** | Danh sách SP, +/- số lượng, mã giảm giá, tóm tắt, checkout |
| **Đơn hàng** | Bảng đơn với filter trạng thái, tracking timeline, chi tiết |
| **Liên hệ** | Form gửi tin nhắn + thông tin CTV (SĐT, Zalo, email, địa chỉ) |
| **Đánh giá** | Viết đánh giá + hiển thị đánh giá từ khách |

### 4.2 Announcement Bar (2 dòng, căn giữa)
```
Dòng 1: Cửa hàng thuộc hệ thống FOHOWAY Việt Nam — SP 100% chính hãng, tem QR truy xuất
Dòng 2: CTV xác thực bởi FOHOWAY Việt Nam · Miễn phí vận chuyển đơn từ 500.000₫
```

### 4.3 Management Panel (login-gated, 16 modules)

#### Tổng quan
| Module | ID | Chức năng |
|--------|----|-----------|
| Dashboard | `v-dash` | KPI (doanh thu, đơn, khách mới, CVR), biểu đồ 7 ngày, đơn gần đây |

#### Vận hành
| Module | ID | Chức năng |
|--------|----|-----------|
| Đơn hàng | `v-orders` | KPI (chờ/giao/xong/hủy), bảng đơn, filter, mã vận chuyển, xuất Excel |
| Khách hàng & CRM | `v-customers` | KPI, bảng KH (tên, SĐT, đơn, tổng chi, SP yêu thích, nhắc mua lại) |

#### Tài chính
| Module | ID | Chức năng |
|--------|----|-----------|
| Thu nhập & Đối soát | `v-revenue` | Kỳ đối soát, doanh thu, phí nền tảng (5%), phí ship, thực nhận |
| Khai báo thuế | `v-tax` | MST, TNCN theo quý, chứng từ khấu trừ |

#### Marketing & Nội dung
| Module | ID | Chức năng |
|--------|----|-----------|
| Nội dung | `v-content` | Tick bài FOHOWAY (toggle), tạo bài/video riêng |
| Landing Pages | `v-landing` | Bảng LP đã tạo, **trình tạo LP** (4 mẫu + preview realtime) |
| Khuyến mãi | `v-promo` | Mã giảm giá (mã, giảm, hạn, đã dùng, trạng thái) |
| Đánh giá | `v-reviews` | Quản lý đánh giá từ khách |

#### Thiết lập
| Module | ID | Chức năng |
|--------|----|-----------|
| Tùy biến giao diện | `v-customize` | **4 sub-tab**: Bố cục (7 khối kéo thả), Font (3 font picker), Màu & Logo (3 scheme + upload), Tiện ích (4 widget từ chợ) |
| Thông tin shop | `v-info` | Tên, SĐT, email, địa chỉ, slug, slogan, giới thiệu CTV |
| Sản phẩm | `v-products-mgmt` | Chọn SP từ kho, đặt giá trong khung (min-max), toggle bật/tắt |
| Thanh toán | `v-payment` | COD / Chuyển khoản (VietQR) / MoMo / ZaloPay — toggle bật/tắt |
| Vận chuyển | `v-shipping` | GHN / GHTK / VPost / J&T — trạng thái kết nối |
| Chính sách | `v-policy` | Textarea: đổi trả, bảo hành, giao hàng |
| SEO & Thông báo | `v-seo` | Title tag, meta description, push notification settings |

### 4.4 Landing Page Templates (4 mẫu pre-approved)
```
🌿 Thảo Mộc    — Kể chuyện nguồn gốc, visual thiên nhiên
⚡ Flash Sale   — Đếm ngược, CTA lớn, khẩn cấp
🎓 Chuyên gia   — Video review, chứng nhận, Q&A
💬 Câu chuyện   — Trải nghiệm thực tế, before/after
```
**Quy trình**: CTV chọn mẫu → chọn SP → nhập tiêu đề/ưu đãi/CTA/Pixel → Xuất bản tức thì (KHÔNG cần admin duyệt mẫu). Hệ thống auto gắn mã CTV (tên, SĐT, mã). Nội dung y tế qua AI scan từ cấm TPCN.

### 4.5 Theme Switcher (3 giao diện)
```
⚪ Nordic Minimal  — #F4F3EF bg, border-radius:0, thin borders, Copenhagen style
💎 Jade Elegance   — #0B2E24 bg, xanh ngọc đậm, border-radius:12px, gold accent
🟤 Nature Organic  — #F5F0E6 bg, earthy tones, border-radius:16px, xanh lá #5A7D2B
```
Floating picker góc trái dưới. CSS variables thay đổi toàn bộ: bg, surface, ink, border, brand, nav, card-radius, btn-radius.

### 4.6 Pricing Logic
```
Admin đặt:  Giá bán (chưa thuế) + Giá niêm yết (MSRP) + Giá sàn CTV + Giá trần CTV
CTV đặt:   Giá bán (trong khung sàn-trần)
Hệ thống:  Từ chối nếu giá ngoài khung
```

### 4.7 Payment Flow
```
Khách mua → Thanh toán (COD/MoMo/VietQR/ZaloPay)
→ Tiền vào escrow nền tảng
→ Đối soát mỗi 2 tuần (1-15, 16-cuối tháng)
→ Trừ phí nền tảng (5%) + phí ship
→ Chuyển khoản thực nhận cho CTV
```

---

## 5. FILE 3 — ADMIN CONSOLE (`fohoway-admin-prototype.html`)

### 5.1 Modules (12)
| Module | ID | Chức năng |
|--------|----|-----------|
| Dashboard | `v-dash` | KPI tổng (doanh thu, đơn, CTV, khách), biểu đồ, top CTV |
| CMS | `v-cms` | Quản lý bài viết, video, podcast cho main site |
| Sản phẩm | `v-products` | **Form thêm/sửa SP đầy đủ** (xem chi tiết mục 5.2) |
| Thư viện Media | `v-library` | Upload/quản lý ảnh, video, tài liệu |
| CTV & Cửa hàng | `v-ctv` | Danh sách CTV, duyệt đăng ký, eKYC, quản lý store |
| Landing Page Templates | `v-lp` | Quản lý 4 mẫu LP pre-approved |
| Đơn hàng | `v-orders` | Tất cả đơn hàng toàn hệ thống |
| AI Chatbot Setup | `v-ai` | Cấu hình model, system prompt, knowledge base, deploy |
| Add-ons Marketplace | `v-addons` | Quản lý tiện ích (duyệt, phí, SDK) |
| Pricing & Revenue | `v-money` | Giá SP, phí nền tảng, đối soát, báo cáo tài chính |
| Database Schema | `v-db` | Xem cấu trúc DB (reference) |
| RBAC & Audit Log | `v-roles` | 5 roles, phân quyền, nhật ký hoạt động |

### 5.2 Admin Product Form — Các trường nhập liệu

#### Thông tin cơ bản
- Tên sản phẩm * — tên chính
- Tên phụ / Mô tả ngắn
- Mã SKU * — VD: FHW-PCK-60
- Barcode / EAN
- Danh mục * — TPCN / Thiết bị / Mỹ phẩm
- Thương hiệu — FOHOWAY / FOHERB (khóa)
- Xuất xứ — nơi sản xuất
- Quy cách đóng gói — VD: Hộp 60 viên × 350mg
- Khối lượng (gram)
- Kích thước (cm) — D × R × C

#### Giá & Kho
- Giá bán (chưa thuế) * — ₫
- Giá niêm yết (MSRP) — ₫
- Giá sàn CTV (min) * — ₫
- Giá trần CTV (max) * — ₫
- Tồn kho hiện tại
- Ngưỡng cảnh báo kho thấp
- Thuế VAT — 8% (TPCN) / 10% / Miễn thuế
- Trạng thái — Đang bán / Ẩn / Hết hàng / Ngừng KD

#### Mô tả & Nội dung
- Mô tả chi tiết * — WYSIWYG editor
- Thành phần — liệt kê hoạt chất
- Công dụng — **AI quét từ cấm TPCN** (chữa bệnh, trị dứt điểm, đặc trị...)
- Cách sử dụng — liều lượng, thời điểm
- Đối tượng sử dụng
- Cảnh báo / Chống chỉ định
- Số ĐKSP / Công bố

#### Hình ảnh & Video
- Ảnh sản phẩm * — tối đa 8, kéo thả sắp xếp, min 800×800px
- Video sản phẩm — link YouTube/TikTok

#### SEO
- Tiêu đề SEO (title tag)
- Mô tả SEO (meta description)
- URL slug
- Tags — phân cách dấu phẩy

### 5.3 AI Chatbot Configuration (Admin → deploy)
```yaml
Model:          claude-sonnet-4-6
System Prompt:  Tùy chỉnh (VD: "Bạn là trợ lý FOHOWAY, trả lời về SP và dưỡng sinh")
Knowledge Base: Upload PDF/docs (sản phẩm, chính sách, FAQ)
Deploy:         Toggle bật/tắt trên Main Site + CTV Stores
Temperature:    0.3 (factual) — 0.7 (conversational)
Max Tokens:     1024
```

### 5.4 RBAC — 5 Roles
```
Super Admin    — Toàn quyền, quản lý RBAC
Admin          — Quản lý SP, CTV, đơn hàng, nội dung
Content Editor — CMS, thư viện media, bài viết
Finance        — Đối soát, báo cáo tài chính, thuế
Support        — Xem đơn hàng, hỗ trợ KH, chat
```

---

## 6. DATABASE SCHEMA

### 6.1 ERD Overview
```
users ──┬── ctv_profiles ──── ctv_stores ──── store_customizations
        │                         │
        │                    store_products (giá CTV)
        │                         │
        └── orders ──────── order_items
              │                   │
              ├── payments        └── products (Admin)
              └── shipments            │
                                  product_images
                                  product_categories

landing_pages ── lp_templates
content_articles
media_library
ai_chatbot_configs
audit_logs
promo_codes
reviews
settlements (đối soát)
```

### 6.2 Core Tables

```sql
-- ═══ USERS & AUTH ═══
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  phone           VARCHAR(20) UNIQUE,
  password_hash   TEXT NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  role            VARCHAR(20) DEFAULT 'customer', -- customer, ctv, admin, editor, finance, support
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT true,
  email_verified  BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ CTV PROFILES ═══
CREATE TABLE ctv_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id),
  ctv_code        VARCHAR(20) UNIQUE NOT NULL, -- VD: CTV-0042
  tier            VARCHAR(20) DEFAULT 'standard', -- standard, silver, gold, diamond
  cccd_number     VARCHAR(20),
  cccd_front_url  TEXT,
  cccd_back_url   TEXT,
  selfie_url      TEXT,
  ekyc_status     VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
  ekyc_verified_at TIMESTAMPTZ,
  tax_id          VARCHAR(20), -- MST
  bank_name       VARCHAR(100),
  bank_account    VARCHAR(30),
  bank_holder     VARCHAR(255),
  referrer_id     UUID REFERENCES ctv_profiles(id), -- CTV giới thiệu
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ CTV STORES ═══
CREATE TABLE ctv_stores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ctv_id          UUID UNIQUE REFERENCES ctv_profiles(id),
  store_name      VARCHAR(255) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL, -- URL: /s/{slug}
  slogan          TEXT,
  description     TEXT,
  phone           VARCHAR(20),
  email           VARCHAR(255),
  address         TEXT,
  logo_url        TEXT,
  cover_url       TEXT,
  favicon_url     TEXT,
  theme           VARCHAR(30) DEFAULT 'nordic', -- nordic, jade, nature
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ STORE CUSTOMIZATION ═══
CREATE TABLE store_customizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID REFERENCES ctv_stores(id),
  font_body       VARCHAR(100) DEFAULT 'Be Vietnam Pro',
  font_heading    VARCHAR(100) DEFAULT 'Cormorant Garamond',
  color_scheme    VARCHAR(30) DEFAULT 'jade_gold', -- jade_gold, ocean, nature, modern
  color_primary   VARCHAR(10),
  homepage_blocks JSONB DEFAULT '[]', -- [{type, order, enabled, config}]
  display_options JSONB DEFAULT '{}', -- {show_sold, show_stars, show_badge, chat_ai, popup_lead}
  custom_css      TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ PRODUCTS (Admin-managed) ═══
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             VARCHAR(50) UNIQUE NOT NULL,
  barcode         VARCHAR(50),
  name            VARCHAR(500) NOT NULL,
  subtitle        TEXT,
  category_id     UUID REFERENCES product_categories(id),
  brand           VARCHAR(100) DEFAULT 'FOHOWAY',
  origin          VARCHAR(255),
  packaging       VARCHAR(255), -- quy cách
  weight_grams    INTEGER,
  dimensions      VARCHAR(100), -- D × R × C
  -- Pricing
  base_price      DECIMAL(15,2) NOT NULL, -- Giá bán (chưa thuế)
  msrp_price      DECIMAL(15,2), -- Giá niêm yết
  ctv_min_price   DECIMAL(15,2) NOT NULL, -- Giá sàn CTV
  ctv_max_price   DECIMAL(15,2) NOT NULL, -- Giá trần CTV
  vat_rate        DECIMAL(5,2) DEFAULT 8.00,
  -- Inventory
  stock_quantity  INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 20,
  -- Content
  description     TEXT, -- WYSIWYG HTML
  ingredients     TEXT,
  benefits        TEXT, -- AI-scanned for banned TPCN words
  usage_guide     TEXT,
  target_audience TEXT,
  warnings        TEXT,
  registration_no VARCHAR(100), -- Số ĐKSP
  -- SEO
  seo_title       VARCHAR(255),
  seo_description TEXT,
  url_slug        VARCHAR(255) UNIQUE,
  tags            TEXT[], -- array of tags
  -- Status
  status          VARCHAR(20) DEFAULT 'active', -- active, hidden, out_of_stock, discontinued
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE product_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL, -- TPCN, Thiết bị, Mỹ phẩm
  slug            VARCHAR(100) UNIQUE,
  icon            VARCHAR(10), -- emoji
  sort_order      INTEGER DEFAULT 0
);

CREATE TABLE product_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL,
  alt_text        VARCHAR(255),
  sort_order      INTEGER DEFAULT 0, -- ảnh đầu = đại diện
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ STORE PRODUCTS (CTV pricing) ═══
CREATE TABLE store_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID REFERENCES ctv_stores(id),
  product_id      UUID REFERENCES products(id),
  selling_price   DECIMAL(15,2) NOT NULL, -- Giá CTV bán (trong khung)
  is_active       BOOLEAN DEFAULT true,
  sort_order      INTEGER DEFAULT 0,
  UNIQUE(store_id, product_id),
  -- CONSTRAINT: selling_price BETWEEN product.ctv_min_price AND product.ctv_max_price
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ ORDERS ═══
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code      VARCHAR(20) UNIQUE NOT NULL, -- #MA-1042
  store_id        UUID REFERENCES ctv_stores(id),
  customer_name   VARCHAR(255) NOT NULL,
  customer_phone  VARCHAR(20) NOT NULL,
  customer_email  VARCHAR(255),
  customer_address TEXT NOT NULL,
  subtotal        DECIMAL(15,2) NOT NULL,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  shipping_fee    DECIMAL(15,2) DEFAULT 0,
  total_amount    DECIMAL(15,2) NOT NULL,
  promo_code_id   UUID REFERENCES promo_codes(id),
  payment_method  VARCHAR(20) NOT NULL, -- cod, bank_transfer, momo, zalopay, vnpay
  payment_status  VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
  order_status    VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, shipping, delivered, cancelled, returned
  shipping_carrier VARCHAR(20), -- ghn, ghtk, vpost, jt
  tracking_number VARCHAR(100),
  notes           TEXT,
  cancelled_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id),
  product_name    VARCHAR(500), -- snapshot
  quantity        INTEGER NOT NULL,
  unit_price      DECIMAL(15,2) NOT NULL,
  total_price     DECIMAL(15,2) NOT NULL
);

CREATE TABLE order_timeline (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id),
  status          VARCHAR(30) NOT NULL,
  note            TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ PAYMENTS & SETTLEMENTS ═══
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id),
  method          VARCHAR(20) NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  transaction_id  VARCHAR(255), -- mã GD từ gateway
  status          VARCHAR(20) DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE settlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID REFERENCES ctv_stores(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  total_revenue   DECIMAL(15,2),
  platform_fee    DECIMAL(15,2), -- 5%
  shipping_cost   DECIMAL(15,2),
  net_amount      DECIMAL(15,2), -- thực nhận
  status          VARCHAR(20) DEFAULT 'pending', -- pending, calculated, paid
  paid_at         TIMESTAMPTZ,
  bank_ref        VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ LANDING PAGES ═══
CREATE TABLE lp_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL, -- Thảo Mộc, Flash Sale, Chuyên gia, Câu chuyện
  slug            VARCHAR(50) UNIQUE,
  icon            VARCHAR(10),
  html_template   TEXT,
  is_active       BOOLEAN DEFAULT true
);

CREATE TABLE landing_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID REFERENCES ctv_stores(id),
  template_id     UUID REFERENCES lp_templates(id),
  product_id      UUID REFERENCES products(id),
  slug            VARCHAR(255) NOT NULL, -- URL path
  title           VARCHAR(500),
  offer_text      TEXT,
  cta_text        VARCHAR(255),
  description     TEXT,
  fb_pixel        VARCHAR(50),
  tiktok_pixel    VARCHAR(50),
  views           INTEGER DEFAULT 0,
  conversions     INTEGER DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'active', -- active, paused, archived
  -- Auto-attached: CTV name, phone, code from store
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ CONTENT ═══
CREATE TABLE content_articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(500) NOT NULL,
  body            TEXT,
  type            VARCHAR(20) DEFAULT 'article', -- article, video, podcast
  source          VARCHAR(20) DEFAULT 'fohoway', -- fohoway, ctv
  author_id       UUID REFERENCES users(id),
  store_id        UUID REFERENCES ctv_stores(id), -- NULL = FOHOWAY global
  thumbnail_url   TEXT,
  video_url       TEXT,
  view_count      INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT true,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- CTV tick chọn bài FOHOWAY để hiện trên store
CREATE TABLE store_content_selections (
  store_id        UUID REFERENCES ctv_stores(id),
  article_id      UUID REFERENCES content_articles(id),
  is_visible      BOOLEAN DEFAULT true,
  PRIMARY KEY (store_id, article_id)
);

-- ═══ PROMO CODES ═══
CREATE TABLE promo_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID REFERENCES ctv_stores(id),
  code            VARCHAR(50) NOT NULL,
  discount_type   VARCHAR(10) DEFAULT 'percent', -- percent, fixed
  discount_value  DECIMAL(10,2) NOT NULL,
  min_order       DECIMAL(15,2) DEFAULT 0,
  max_uses        INTEGER,
  used_count      INTEGER DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ REVIEWS ═══
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID REFERENCES ctv_stores(id),
  product_id      UUID REFERENCES products(id),
  order_id        UUID REFERENCES orders(id),
  customer_name   VARCHAR(255),
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  content         TEXT,
  is_approved     BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ AI CHATBOT ═══
CREATE TABLE ai_chatbot_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) DEFAULT 'FOHOWAY Assistant',
  model           VARCHAR(50) DEFAULT 'claude-sonnet-4-6',
  system_prompt   TEXT,
  temperature     DECIMAL(3,2) DEFAULT 0.4,
  max_tokens      INTEGER DEFAULT 1024,
  knowledge_docs  JSONB DEFAULT '[]', -- [{filename, url, uploaded_at}]
  deploy_main_site BOOLEAN DEFAULT true,
  deploy_ctv_stores BOOLEAN DEFAULT true,
  is_active       BOOLEAN DEFAULT true,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_chat_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id       UUID REFERENCES ai_chatbot_configs(id),
  store_id        UUID REFERENCES ctv_stores(id), -- NULL = main site
  visitor_id      VARCHAR(100), -- anonymous tracking
  messages        JSONB DEFAULT '[]', -- [{role, content, timestamp}]
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ MEDIA LIBRARY ═══
CREATE TABLE media_library (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename        VARCHAR(500),
  url             TEXT NOT NULL,
  file_type       VARCHAR(20), -- image, video, document, audio
  file_size       INTEGER, -- bytes
  uploaded_by     UUID REFERENCES users(id),
  folder          VARCHAR(255) DEFAULT 'general',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ AUDIT LOG ═══
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  action          VARCHAR(100) NOT NULL, -- product.create, order.update, ctv.approve
  entity_type     VARCHAR(50),
  entity_id       UUID,
  details         JSONB,
  ip_address      VARCHAR(45),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ INDEXES ═══
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_store_products_store ON store_products(store_id);
CREATE INDEX idx_landing_pages_store ON landing_pages(store_id);
CREATE INDEX idx_reviews_store ON reviews(store_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_content_source ON content_articles(source);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_settlements_store ON settlements(store_id);
```

---

## 7. AI CHATBOT INTEGRATION

### 7.1 Architecture
```
User message → Frontend → /api/chat
  → Load config (system_prompt, knowledge_base)
  → Build messages array
  → Call Anthropic API (claude-sonnet-4-6)
  → Stream response back
  → Save session to ai_chat_sessions
```

### 7.2 API Integration Code
```typescript
// /api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: Request) {
  const { message, sessionId, storeId } = await req.json();
  
  // Load config
  const config = await db.aiChatbotConfig.findFirst({ where: { is_active: true } });
  
  // Load knowledge base context
  const knowledge = await loadKnowledgeBase(config.knowledge_docs);
  
  // Build system prompt
  const systemPrompt = `${config.system_prompt}\n\n--- Knowledge Base ---\n${knowledge}`;
  
  // Load session history
  const session = await db.aiChatSession.findUnique({ where: { id: sessionId } });
  const messages = [...(session?.messages || []), { role: 'user', content: message }];
  
  // Call Claude
  const response = await client.messages.create({
    model: config.model,
    max_tokens: config.max_tokens,
    system: systemPrompt,
    messages: messages,
  });
  
  // Save session
  await db.aiChatSession.upsert({
    where: { id: sessionId },
    update: { messages: [...messages, { role: 'assistant', content: response.content[0].text }] },
    create: { id: sessionId, config_id: config.id, store_id: storeId, messages: [...messages, { role: 'assistant', content: response.content[0].text }] }
  });
  
  return Response.json({ reply: response.content[0].text });
}
```

### 7.3 Banned Words Scanner (TPCN Compliance)
```typescript
const BANNED_WORDS_TPCN = [
  'chữa bệnh', 'trị bệnh', 'đặc trị', 'trị dứt điểm',
  'thay thế thuốc', 'điều trị', 'chữa khỏi', 'trị tận gốc',
  'thuốc', 'kháng sinh', 'tiêu diệt', 'ngăn ngừa bệnh',
  'phòng bệnh', 'kê đơn', 'bác sĩ khuyên dùng'
];

function scanBannedWords(text: string): { hasBanned: boolean; found: string[] } {
  const lower = text.toLowerCase();
  const found = BANNED_WORDS_TPCN.filter(w => lower.includes(w));
  return { hasBanned: found.length > 0, found };
}
```

---

## 8. DESIGN SYSTEM

### 8.1 Typography
```css
--font-body:    'Be Vietnam Pro', system-ui, sans-serif;  /* Vietnamese-optimized */
--font-heading: 'Cormorant Garamond', Georgia, serif;     /* Elegant serif */
```

### 8.2 Color Palette (FOHOWAY Brand)
```css
--brand:        #0D6B4F;  /* Jade green — primary */
--brand-dark:   #094A37;  /* Deep jade — header, sidebar */
--brand-light:  #E8F3ED;  /* Light jade — highlights */
--gold:         #B8860B;  /* Warm gold — accent */
--gold-light:   #FDF6E3;  /* Light gold — notes */
--cta:          #C5392A;  /* Red — call to action */
--bg:           #F4F3EF;  /* Warm neutral — background */
--surface:      #FFFFFF;  /* White — cards */
--ink:          #1A1A1A;  /* Near-black — text */
```

### 8.3 Design Reference
- **Phong cách**: Copenhagen Care (Shopify theme) — Nordic minimal, warm neutrals
- **Border-radius**: 0px (Nordic) / 12px (Jade) / 16px (Nature)
- **Nav**: Uppercase labels, 12-13px, letter-spacing .05em, sticky
- **Cards**: Subtle border, no heavy shadows
- **Buttons**: Uppercase, pill hoặc square tùy theme

---

## 9. KEY BUSINESS RULES

### 9.1 Decisions đã xác nhận
- [x] Main site KHÔNG có giỏ hàng — chỉ brand hub
- [x] Store là 1 file với login-gated management
- [x] Content từ main site hiện trên store qua tick-toggle
- [x] Landing pages dùng mẫu pre-approved — KHÔNG cần admin duyệt
- [x] CTV đặt giá trong khung admin quy định
- [x] "Giá nhà máy" KHÔNG hiển thị — chỉ "Giá bán (chưa thuế)"
- [x] Payment: escrow → đối soát 2 tuần → chuyển khoản CTV
- [x] AI Chatbot cấu hình từ Admin, deploy trên cả main site + CTV stores
- [x] Công dụng SP phải qua AI scan từ cấm TPCN

### 9.2 Câu hỏi chiến lược chưa quyết định
- [ ] FOHOWAY corp có cung cấp brand guidelines / cho phép localize?
- [ ] Podcast hosting: self-hosted vs Spotify/Apple RSS?
- [ ] Community add-on revenue share ratio (đề xuất 70/30)
- [ ] Phased rollout: Phase 1 (info/content) → Phase 2 (stores/payment)?

---

## 10. DEVELOPMENT PHASES

### Phase 1 — Foundation (4 tuần)
- Setup Next.js + PostgreSQL + Prisma
- Auth (email/phone + OTP) + RBAC
- Product CRUD (Admin)
- Main Website (5 trang)

### Phase 2 — CTV Stores (6 tuần)
- CTV registration + eKYC flow
- Multi-tenant store rendering
- Product display + pricing logic
- Cart + Checkout + Order management
- Theme switcher (3 themes)

### Phase 3 — Commerce (4 tuần)
- Payment integration (VNPay, MoMo, ZaloPay)
- Shipping API (GHN, GHTK)
- Settlement/đối soát engine
- Landing page builder

### Phase 4 — Intelligence (3 tuần)
- AI Chatbot integration (Claude API)
- TPCN compliance scanner
- CRM & analytics dashboard
- Email/push notifications

### Phase 5 — Scale (ongoing)
- Widget marketplace
- Advanced analytics
- Mobile app (React Native)
- SEO optimization

---

## 11. FILES ĐÍNH KÈM

```
/prototype/
  fohoway-frontend-prototype.html   — Main Website prototype
  fohoway-store.html                — CTV Store prototype (full)
  fohoway-admin-prototype.html      — Admin Console prototype

/docs/
  FOHOWAY-PLATFORM-TECHNICAL-GUIDE.md  — Tài liệu này
```

> **Ghi chú cho Claude Code**: Đọc 3 file HTML prototype để hiểu UI/UX flow chính xác. Mỗi onclick, mỗi field, mỗi module trong prototype đều là spec cho production. Database schema ở mục 6 là điểm khởi đầu — có thể mở rộng nhưng KHÔNG bỏ bớt trường.
