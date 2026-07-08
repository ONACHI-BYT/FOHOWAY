import { formatVND } from "@/app/lib/format";

export interface ProductCardData {
  name: string;
  categoryName?: string | null;
  basePrice: number | string | { toString(): string };
  msrpPrice?: number | string | { toString(): string } | null;
  emoji?: string | null;
  imageUrl?: string | null;
  soldLabel?: string | null;
  href?: string;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const inner = (
    <>
      <div className="grid aspect-square place-items-center bg-brand-light/60 text-5xl">
        {p.emoji ?? "📦"}
      </div>
      <div className="p-4">
        {p.categoryName && (
          <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand">
            {p.categoryName}
          </span>
        )}
        <h3 className="mt-2 font-heading text-[15px] font-medium leading-tight text-brand-dark">{p.name}</h3>
        <div className="mt-1 text-[11px] text-gold">★★★★★</div>
        <div className="mt-1 text-sm font-semibold text-cta">
          {formatVND(p.basePrice)}
          {p.msrpPrice && (
            <s className="ml-1.5 text-[11px] font-normal text-ink/40">{formatVND(p.msrpPrice)}</s>
          )}
        </div>
        {p.soldLabel && <div className="mt-1 text-[10px] uppercase text-ink/40">Đã bán {p.soldLabel}</div>}
      </div>
    </>
  );

  const cls =
    "block overflow-hidden rounded-xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-lg";
  return p.href ? (
    <a href={p.href} className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
