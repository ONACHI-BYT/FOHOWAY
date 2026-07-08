import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { scanBannedWords } from "@/app/lib/compliance";

// POST /api/ai/scan  { text }  → { hasBanned, found }
export async function POST(req: Request) {
  const { text } = await req.json().catch(() => ({ text: "" }));
  // Lấy thêm từ cấm cấu hình động từ AI config (nếu có)
  const cfg = await prisma.aiChatbotConfig.findFirst({ where: { isActive: true } });
  const result = scanBannedWords(String(text ?? ""), cfg?.bannedWords ?? []);
  return NextResponse.json(result);
}
