// Định dạng tiền VND: 910000 → "910.000₫"
export function formatVND(value: number | string | { toString(): string }): string {
  const n = typeof value === "number" ? value : Number(value.toString());
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("vi-VN") + "₫";
}

// Rút gọn số lớn: 1240 → "1,2k"
export function shortNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}
