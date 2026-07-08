export const dynamic = "force-static";

const TIMELINE = [
  ["2007", "Thành lập tại Moscow, khởi đầu sứ mệnh dưỡng sinh."],
  ["2012", "Viện R&D & nhà máy GMP Thiên Tân."],
  ["2018", "30+ quốc gia; gia nhập WEF."],
  ["2024", "Ra mắt thị trường Việt Nam."],
  ["2026", "Nền tảng số hóa toàn diện."],
];

const VALUES = [
  ["和", "Hòa", "Hòa hợp thiên nhiên, xã hội."],
  ["治", "Trị", "Quản trị minh bạch."],
  ["友", "Hữu", "Doanh nghiệp — gia đình lớn."],
  ["德", "Đức", "Kinh doanh trung thực."],
];

const LEADERS = [
  ["韩", "Han Jinming", "Chủ tịch WHIEDA/FOHERB/FOHOWAY"],
  ["K", "Kevin Hou", "Phó CT · GĐ Thị trường Quốc tế"],
  ["Y", "Lê Hải Yến", "Trưởng Ban PTTT Việt Nam"],
  ["B", "Nguyễn Bích", "Trưởng Ban ĐH Việt Nam"],
];

export default function TapDoanPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cta">Hồ sơ tập đoàn</span>
      <h1 className="mt-2 font-heading text-3xl text-brand-dark">Về FOHOWAY Group</h1>
      <p className="mb-10 mt-2 max-w-2xl text-ink/60">
        Thành lập 02/2007 tại Moscow, thuộc hệ sinh thái FOHERB/WHIEDA (Chủ tịch Han Jinming). Thành viên Tăng
        trưởng Toàn cầu — Diễn đàn Kinh tế Thế giới.
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="mb-4 font-heading text-xl text-brand-dark">Dấu mốc lịch sử</h3>
          <div className="space-y-4 border-l-2 border-gold/40 pl-6">
            {TIMELINE.map(([y, t]) => (
              <div key={y} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-canvas bg-cta" />
                <b className="font-heading text-cta">{y}</b>
                <p className="text-sm text-ink/70">{t}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-heading text-xl text-brand-dark">Giá trị cốt lõi</h3>
          <div className="grid grid-cols-2 gap-3">
            {VALUES.map(([zi, b, p]) => (
              <div key={zi} className="rounded-xl bg-brand p-6 text-center text-white transition hover:bg-brand-dark">
                <div className="font-heading text-3xl text-gold">{zi}</div>
                <b className="mt-1.5 block">{b}</b>
                <p className="text-xs text-white/70">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="mb-4 mt-14 font-heading text-xl text-brand-dark">Ban lãnh đạo</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {LEADERS.map(([av, b, s]) => (
          <div key={b} className="rounded-xl border border-black/10 bg-white p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-gold bg-gradient-to-br from-brand to-brand-dark font-heading text-2xl font-bold text-gold">
              {av}
            </div>
            <b className="mt-3 block text-sm text-brand-dark">{b}</b>
            <small className="text-xs text-ink/50">{s}</small>
          </div>
        ))}
      </div>
    </main>
  );
}
