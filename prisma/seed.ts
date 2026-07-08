import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../app/lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FOHOWAY...");

  // Xóa dữ liệu cũ (thứ tự con → cha) để seed lại idempotent
  await prisma.orderTimeline.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.review.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.landingPage.deleteMany();
  await prisma.platformInvoice.deleteMany();
  await prisma.storeVariantStock.deleteMany();
  await prisma.storeProduct.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.store.deleteMany();
  await prisma.agentProfile.deleteMany();
  await prisma.user.deleteMany({ where: { role: "agent" } });
  await prisma.user.deleteMany({ where: { role: { in: ["super_admin", "admin"] } } });
  await prisma.platformSetting.deleteMany();
  await prisma.aiChatbotConfig.deleteMany();
  await prisma.lpTemplate.deleteMany();
  await prisma.addon.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();

  // ─── Danh mục ───
  const [tpcn, thietbi, mypham] = await Promise.all([
    prisma.productCategory.create({ data: { name: "Thực phẩm chức năng", slug: "tpcn", icon: "🍄", sortOrder: 1 } }),
    prisma.productCategory.create({ data: { name: "Máy móc & Thiết bị", slug: "thiet-bi", icon: "✨", sortOrder: 2 } }),
    prisma.productCategory.create({ data: { name: "Mỹ phẩm tự nhiên", slug: "my-pham", icon: "🌼", sortOrder: 3 } }),
  ]);

  // ─── Sản phẩm (từ prototype) ───
  const p1 = await prisma.product.create({
    data: {
      sku: "FHW-PCK-60",
      name: "Đông trùng – Linh chi (Phúc Chính Khang)",
      subtitle: "Viên uống bồi bổ cơ thể, hỗ trợ tăng đề kháng",
      categoryId: tpcn.id,
      origin: "Viện R&D Thiên Tân, Trung Quốc",
      packaging: "Hộp 60 viên × 350mg",
      weightGrams: 150,
      basePrice: 910000,
      msrpPrice: 1050000,
      agentMinPrice: 870000,
      agentMaxPrice: 1050000,
      vatRate: 8,
      ingredients: "Đông trùng hạ thảo 250mg, Linh chi đỏ 200mg, phụ liệu vừa đủ 1 viên.",
      benefits: "Hỗ trợ tăng cường sức đề kháng, giảm mệt mỏi, bồi bổ cơ thể, cải thiện giấc ngủ.",
      usageGuide: "Ngày 2 lần, mỗi lần 2 viên, trước ăn 30 phút.",
      registrationNo: "12345/2024/ĐKSP",
      urlSlug: "dong-trung-linh-chi-phuc-chinh-khang",
      tags: ["đông trùng", "linh chi", "TPCN", "tăng đề kháng", "ngủ ngon"],
      images: { create: [{ imageUrl: "https://placehold.co/800x800?text=Dong+Trung", sortOrder: 0 }] },
      variants: { create: [{ name: "Hộp 60 viên", sortOrder: 0 }] },
    },
  });

  const p2 = await prisma.product.create({
    data: {
      sku: "FHW-TTT-01",
      name: "Máy chăm sóc da – Tiểu Thần Tiên",
      subtitle: "Đa năng · ION + EMS + siêu âm",
      categoryId: thietbi.id,
      basePrice: 7800000,
      msrpPrice: 8500000,
      agentMinPrice: 7800000, // "Cố định"
      agentMaxPrice: 7800000,
      vatRate: 10,
      benefits: "Đẩy dưỡng chất, nâng cơ, chăm sóc da tại nhà.",
      usageGuide: "10–15 phút/lần, 3–4 lần/tuần.",
      urlSlug: "may-tieu-than-tien",
      tags: ["thiết bị", "chăm sóc da", "EMS"],
      images: { create: [{ imageUrl: "https://placehold.co/800x800?text=Tieu+Than+Tien", sortOrder: 0 }] },
      variants: { create: [{ name: "Bộ đầy đủ", sortOrder: 0 }] },
    },
  });

  const p3 = await prisma.product.create({
    data: {
      sku: "FHW-GEL-V",
      name: "Gel Săn Chắc Tuyết Hoạt Tuyền (Vàng)",
      subtitle: "Săn chắc · 250ml",
      categoryId: mypham.id,
      basePrice: 364000,
      msrpPrice: 420000,
      agentMinPrice: 340000,
      agentMaxPrice: 420000,
      vatRate: 10,
      ingredients: "Nhân sâm, collagen.",
      benefits: "Săn chắc, cấp ẩm.",
      usageGuide: "Massage 5–10 phút.",
      urlSlug: "gel-san-chac-tuyet-hoat-tuyen-vang",
      tags: ["mỹ phẩm", "gel massage"],
      images: { create: [{ imageUrl: "https://placehold.co/800x800?text=Gel+Vang", sortOrder: 0 }] },
      variants: { create: [{ name: "Tuýp 250ml", sortOrder: 0 }] },
    },
  });

  const p4 = await prisma.product.create({
    data: {
      sku: "FHW-KIA-01",
      name: "Kính Ion Âm FOHERB",
      subtitle: "Lọc blue-light",
      categoryId: thietbi.id,
      basePrice: 1560000,
      msrpPrice: 1800000,
      agentMinPrice: 1480000,
      agentMaxPrice: 1800000,
      vatRate: 10,
      benefits: "Giảm mỏi mắt khi dùng màn hình.",
      urlSlug: "kinh-ion-am-foherb",
      tags: ["thiết bị", "kính"],
      images: { create: [{ imageUrl: "https://placehold.co/800x800?text=Kinh+Ion", sortOrder: 0 }] },
    },
  });

  const p5 = await prisma.product.create({
    data: {
      sku: "FHW-GEL-D",
      name: "Gel Dưỡng Ẩm Tuyết Hoạt Tuyền (Đỏ)",
      subtitle: "Làm dịu da nhạy cảm · 250ml",
      categoryId: mypham.id,
      basePrice: 364000,
      msrpPrice: 420000,
      agentMinPrice: 340000,
      agentMaxPrice: 420000,
      vatRate: 10,
      benefits: "Cấp ẩm, làm dịu da.",
      urlSlug: "gel-duong-am-tuyet-hoat-tuyen-do",
      tags: ["mỹ phẩm", "dưỡng ẩm"],
      images: { create: [{ imageUrl: "https://placehold.co/800x800?text=Gel+Do", sortOrder: 0 }] },
    },
  });

  const p6 = await prisma.product.create({
    data: {
      sku: "FHW-GANG-01",
      name: "Găng tay xung điện FOHOWAY",
      subtitle: "Phụ kiện massage bàn tay",
      categoryId: thietbi.id,
      basePrice: 440000,
      msrpPrice: 520000,
      agentMinPrice: 440000,
      agentMaxPrice: 520000,
      vatRate: 10,
      benefits: "Lưu thông khí huyết.",
      urlSlug: "gang-tay-xung-dien",
      tags: ["thiết bị", "massage"],
      images: { create: [{ imageUrl: "https://placehold.co/800x800?text=Gang+Tay", sortOrder: 0 }] },
    },
  });

  // ─── Gói cước (Free/PRO — phí đổi được qua Admin) ───
  const planFree = await prisma.plan.create({
    data: { name: "Free", monthlyPrice: 0, txnFeePercent: 2.0, productLimit: 20, sortOrder: 1, features: ["20 sản phẩm", "Cửa hàng cơ bản"] },
  });
  await prisma.plan.create({
    data: { name: "PRO", monthlyPrice: 199000, txnFeePercent: 1.5, productLimit: null, sortOrder: 2, features: ["Không giới hạn SP", "Landing Page", "Chat AI", "Ưu tiên hỗ trợ"] },
  });

  // ─── Add-ons ───
  await prisma.addon.createMany({
    data: [
      { name: "Chat AI tư vấn", slug: "chat-ai", monthlyPrice: 99000, developer: "FOHOWAY" },
      { name: "Social Studio", slug: "social-studio", monthlyPrice: 49000, developer: "FOHOWAY" },
      { name: "Countdown Timer", slug: "countdown", monthlyPrice: 0, developer: "FOHOWAY" },
      { name: "Testimonial Slider", slug: "testimonial", monthlyPrice: 0, developer: "FOHOWAY" },
      { name: "Zalo Mini App", slug: "zalo-mini", monthlyPrice: 149000, developer: "DevTeam Sabio", revShareNote: "70/30" },
    ],
  });

  // ─── Mẫu Landing Page (4 mẫu pre-approved) ───
  await prisma.lpTemplate.createMany({
    data: [
      { name: "Thảo Mộc", slug: "thao-moc", icon: "🌿" },
      { name: "Flash Sale", slug: "flash-sale", icon: "⚡" },
      { name: "Chuyên gia", slug: "chuyen-gia", icon: "🎓" },
      { name: "Câu chuyện", slug: "cau-chuyen", icon: "💬" },
    ],
  });

  // ─── Cấu hình AI Chatbot ───
  await prisma.aiChatbotConfig.create({
    data: {
      name: "FOHOWAY AI · Tư vấn dưỡng sinh",
      model: "claude-sonnet-5",
      systemPrompt:
        'Bạn là trợ lý AI chính thức của FOHOWAY Việt Nam. Tư vấn về sản phẩm, dưỡng sinh, cơ hội đại lý. Luôn nhắc: "Sản phẩm không phải là thuốc, không thay thế thuốc chữa bệnh." Trả lời bằng tiếng Việt.',
      temperature: 0.4,
      maxTokens: 1024,
      bannedWords: ["chữa bệnh", "trị dứt điểm", "đặc trị", "thay thế thuốc", "khỏi hẳn", "cam kết chữa"],
    },
  });

  // ─── Tham số cấu hình nền tảng (Admin sửa được) ───
  await prisma.platformSetting.createMany({
    data: [
      { key: "default_txn_fee_percent", value: "1.5", valueType: "number", label: "Phí giao dịch mặc định (%)" },
      { key: "freeship_threshold", value: "500000", valueType: "number", label: "Ngưỡng miễn phí vận chuyển (₫)" },
      { key: "pro_monthly_price", value: "199000", valueType: "number", label: "Phí gói PRO (₫/tháng)" },
      { key: "invoice_period_days", value: "15", valueType: "number", label: "Chu kỳ đối soát hóa đơn (ngày)" },
    ],
  });

  // ─── Tài khoản Admin ───
  await prisma.user.create({
    data: {
      email: "admin@fohoway.vn",
      passwordHash: await hashPassword("admin123"),
      fullName: "Super Admin",
      role: "super_admin",
      emailVerified: true,
    },
  });

  // ─── Đại lý mẫu + cửa hàng (demo, test trigger giá) ───
  const agentUser = await prisma.user.create({
    data: { email: "minhanh@fohoway.vn", phone: "0919715868", passwordHash: await hashPassword("agent123"), fullName: "Nguyễn Minh Anh", role: "agent", emailVerified: true },
  });
  const agent = await prisma.agentProfile.create({
    data: { userId: agentUser.id, agentCode: "DL-0042", tier: "diamond", ekycStatus: "verified", businessName: "Hộ KD Minh Anh", taxId: "0123456789" },
  });
  const store = await prisma.store.create({
    data: { agentId: agent.id, storeName: "Shop Dưỡng Sinh Minh Anh", slug: "minh-anh", phone: "0919715868", email: "minhanh@fohoway.vn", address: "Cầu Giấy, Hà Nội", theme: "nordic", customization: { create: {} } },
  });
  await prisma.subscription.create({ data: { storeId: store.id, planId: planFree.id, status: "active" } });

  // Store products — giá TRONG khung (trigger sẽ cho qua)
  await prisma.storeProduct.createMany({
    data: [
      { storeId: store.id, productId: p1.id, sellingPrice: 910000, stockQuantity: 1240, sortOrder: 1 },
      { storeId: store.id, productId: p2.id, sellingPrice: 7800000, stockQuantity: 86, sortOrder: 2 },
      { storeId: store.id, productId: p3.id, sellingPrice: 380000, stockQuantity: 12, sortOrder: 3 },
    ],
  });

  console.log("✅ Seed xong:");
  console.log(`   - ${await prisma.productCategory.count()} danh mục, ${await prisma.product.count()} SP`);
  console.log(`   - ${await prisma.plan.count()} gói, ${await prisma.addon.count()} add-on, ${await prisma.lpTemplate.count()} mẫu LP`);
  console.log(`   - 1 đại lý mẫu (/s/${store.slug}) với ${await prisma.storeProduct.count()} SP đang bán`);
  console.log("   - Tài khoản: admin@fohoway.vn / admin123  ·  minhanh@fohoway.vn / agent123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
