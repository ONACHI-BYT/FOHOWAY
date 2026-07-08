// Kiểm duyệt tuân thủ TPCN — quét từ cấm trong nội dung công dụng/quảng cáo.
// LƯU Ý: đây là lớp chặn NHANH (substring). Bản production nên bổ sung kiểm duyệt
// bằng LLM có ngữ cảnh (tránh false-positive như câu disclaimer "không phải là thuốc").

export const BANNED_WORDS_TPCN = [
  "chữa bệnh",
  "trị bệnh",
  "đặc trị",
  "trị dứt điểm",
  "trị tận gốc",
  "thay thế thuốc",
  "điều trị",
  "chữa khỏi",
  "khỏi hẳn",
  "kháng sinh",
  "tiêu diệt",
  "ngăn ngừa bệnh",
  "phòng bệnh",
  "kê đơn",
  "cam kết chữa",
  "bác sĩ khuyên dùng",
];

// Các cụm hợp lệ chứa từ nhạy cảm — bỏ qua để tránh false-positive.
const WHITELIST_PHRASES = ["không phải là thuốc", "không thay thế thuốc chữa bệnh", "không thay thế thuốc"];

export interface ScanResult {
  hasBanned: boolean;
  found: string[];
}

export function scanBannedWords(text: string, extraWords: string[] = []): ScanResult {
  if (!text) return { hasBanned: false, found: [] };
  let haystack = text.toLowerCase();
  // Gỡ các cụm whitelist trước khi quét
  for (const w of WHITELIST_PHRASES) haystack = haystack.split(w).join(" ");

  const dict = [...BANNED_WORDS_TPCN, ...extraWords.map((w) => w.toLowerCase())];
  const found = dict.filter((w) => haystack.includes(w));
  return { hasBanned: found.length > 0, found: [...new Set(found)] };
}
