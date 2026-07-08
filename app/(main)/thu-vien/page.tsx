import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

// Fallback demo khi DB chưa có bài viết
const DEMO = [
  { icon: "📄", title: "Catalogue 2026 (PDF)", meta: "120 SP · 48 trang", type: "article" },
  { icon: "📄", title: "Cẩm nang 3 học thuyết", meta: "Đào tạo đại lý", type: "article" },
  { icon: "🎬", title: "Giới thiệu FOHOWAY", meta: "YouTube · 12:40", type: "video" },
  { icon: "🎬", title: "Liệu trình kinh lạc", meta: "YouTube · 8:15", type: "video" },
  { icon: "🎧", title: "Podcast #01 · Âm dương", meta: "24 phút", type: "podcast" },
  { icon: "🎧", title: "Podcast #02 · Ngũ tạng", meta: "31 phút", type: "podcast" },
];

const ICON: Record<string, string> = { article: "📄", video: "🎬", podcast: "🎧" };

export default async function ThuVienPage() {
  const articles = await prisma.contentArticle.findMany({
    where: { source: "fohoway", isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const items = articles.length
    ? articles.map((a) => ({ icon: ICON[a.type] ?? "📄", title: a.title, meta: a.type, type: a.type }))
    : DEMO;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cta">Tri thức</span>
      <h1 className="mt-2 font-heading text-3xl text-brand-dark">Thư viện tài liệu & truyền thông</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((x, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border border-black/10 bg-white p-5 transition hover:shadow">
            <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-brand-light text-xl">
              {x.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-brand-dark">{x.title}</h4>
              <small className="text-xs text-ink/50">{x.meta}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border-l-4 border-gold bg-gold-light px-4 py-3 text-sm text-amber-900">
        🎙 Lộ trình: Podcast &quot;Dưỡng Sinh Mỗi Ngày&quot;, đồng bộ YouTube & TikTok qua API.
      </div>
    </main>
  );
}
