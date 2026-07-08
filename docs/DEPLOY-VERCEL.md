# Deploy FOHOWAY lên Vercel + Neon (bản TEST)

Kiến trúc: **Vercel** (chạy Next.js) + **Neon** (PostgreSQL, Singapore) + domain **app.fohoway.pro**.
Bản test dùng gói **free** của cả hai — không cần thẻ quốc tế.

---

## 1. Tạo database trên Neon

1. Vào https://neon.tech → đăng ký (Google/GitHub) → **Create project**.
2. **Region: Singapore (ap-southeast-1)** · Postgres 16.
3. Vào **Dashboard → Connection Details**, copy **2 chuỗi**:
   - **Pooled** (host có chữ `-pooler`) → dùng cho `DATABASE_URL`
   - **Direct** (không có `-pooler`) → dùng cho `DIRECT_URL`
   - Cả hai có đuôi `?sslmode=require`.

## 2. Tạo schema + dữ liệu mẫu trên Neon (chạy 1 lần, từ máy local)

Dùng chuỗi **Direct** cho cả hai biến (tránh lỗi pooler khi migrate/seed):

```bash
cd /Users/ledangtuan/Documents/BYT-FOHOWAY

DATABASE_URL="<DIRECT_URL>" DIRECT_URL="<DIRECT_URL>" npx prisma migrate deploy
DATABASE_URL="<DIRECT_URL>" DIRECT_URL="<DIRECT_URL>" npm run db:seed
```

→ Tạo 21+ bảng, trigger khung giá, 6 SP, 2 tài khoản (admin@fohoway.vn/admin123, minhanh@fohoway.vn/agent123).

## 3. Deploy code lên Vercel (qua CLI — không cần GitHub)

```bash
npm i -g vercel
vercel login           # nhập email, xác nhận qua hộp thư
cd /Users/ledangtuan/Documents/BYT-FOHOWAY
vercel                 # lần đầu: tạo project (Framework tự nhận Next.js) → deploy preview
```

Đặt biến môi trường (Production) — chạy từng lệnh, dán giá trị khi được hỏi:

```bash
vercel env add DATABASE_URL production      # dán chuỗi POOLED của Neon
vercel env add DIRECT_URL production        # dán chuỗi DIRECT của Neon
vercel env add AUTH_SECRET production        # dán chuỗi sinh ở dưới
vercel env add ANTHROPIC_API_KEY production  # (tùy chọn — bỏ trống nếu chưa có)
```

Sinh `AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Deploy production:
```bash
vercel --prod
```

→ Vercel trả về URL dạng `https://fohoway-platform-xxx.vercel.app` — mở thử ngay được.

## 4. Gắn domain (khuyên dùng subdomain để không đụng site cũ)

1. Vercel project → **Settings → Domains → Add** → nhập **`app.fohoway.pro`**.
2. Vercel hiện bản ghi DNS cần thêm (thường **CNAME** `app` → `cname.vercel-dns.com`).
3. Vào nơi quản lý DNS của `fohoway.pro` (Mắt Bão) → thêm bản ghi đó → chờ vài phút.
4. Xong: app chạy tại **https://app.fohoway.pro** (SSL tự động).

> Giữ nguyên `fohoway.group` / `fohoway.pro` trên hosting Windows cho landing page. App chỉ dùng subdomain `app.`.

---

## Kiểm tra sau deploy
- `https://app.fohoway.pro` → trang chủ
- `/san-pham` → 6 sản phẩm
- `/s/minh-anh` → cửa hàng đại lý (mua thử)
- `/admin/login` → admin123 · `/quan-ly/dang-nhap` → agent123

## Cập nhật về sau
- Sửa code → `vercel --prod` để deploy lại.
- Đổi schema → thêm migration local → `DATABASE_URL="<DIRECT>" DIRECT_URL="<DIRECT>" npx prisma migrate deploy`.

## Lưu ý
- Vercel **Hobby** miễn phí cho test; khi chạy thật (thương mại) nên nâng **Pro** ($20/th).
- Neon free tier tự "ngủ" khi không dùng → request đầu tiên sau khi ngủ hơi chậm (~1s). Bình thường.
