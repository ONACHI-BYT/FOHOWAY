import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const headingFont = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "FOHOWAY Việt Nam — Dưỡng sinh · Sức khỏe · Sự nghiệp",
  description: "Nền tảng thương hiệu & mạng lưới đại lý FOHOWAY Việt Nam.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
