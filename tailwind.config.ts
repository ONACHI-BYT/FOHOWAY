import type { Config } from "tailwindcss";

// Bảng màu thương hiệu FOHOWAY (theo docs mục 8.2)
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0D6B4F", // jade green
          dark: "#094A37",
          light: "#E8F3ED",
        },
        gold: {
          DEFAULT: "#B8860B",
          light: "#FDF6E3",
        },
        cta: "#C5392A",
        ink: "#1A1A1A",
        surface: "#FFFFFF",
        canvas: "#F4F3EF",
      },
      fontFamily: {
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
