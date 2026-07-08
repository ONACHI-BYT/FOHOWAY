// 3 theme cửa hàng đại lý (port từ prototype store). Mỗi theme = tập CSS variables
// áp lên container cửa hàng qua inline style.
import type { StoreTheme } from "@prisma/client";

export interface ThemeTokens {
  label: string;
  vars: Record<string, string>;
}

export const STORE_THEMES: Record<StoreTheme, ThemeTokens> = {
  nordic: {
    label: "Nordic Minimal",
    vars: {
      "--bg": "#F4F3EF",
      "--surface": "#FFFFFF",
      "--surface2": "#ECEAE5",
      "--ink": "#1A1A1A",
      "--ink2": "#555555",
      "--ink3": "#888888",
      "--border": "#DDDBD6",
      "--brand": "#0D6B4F",
      "--brand-dark": "#094A37",
      "--gold": "#B8860B",
      "--cta": "#1A1A1A",
      "--radius": "0px",
    },
  },
  jade: {
    label: "Jade Elegance",
    vars: {
      "--bg": "#0B2E24",
      "--surface": "#0F3A2E",
      "--surface2": "#134432",
      "--ink": "#E8F0EC",
      "--ink2": "#B0C8BB",
      "--ink3": "#6A9480",
      "--border": "#1A4D3C",
      "--brand": "#3DDBA9",
      "--brand-dark": "#2BC090",
      "--gold": "#D4A843",
      "--cta": "#D4A843",
      "--radius": "12px",
    },
  },
  nature: {
    label: "Nature Organic",
    vars: {
      "--bg": "#F5F0E6",
      "--surface": "#FFFDF8",
      "--surface2": "#EDE7D9",
      "--ink": "#2C2416",
      "--ink2": "#5C5040",
      "--ink3": "#8A7D6B",
      "--border": "#DDD5C4",
      "--brand": "#5A7D2B",
      "--brand-dark": "#3E5A18",
      "--gold": "#C4964B",
      "--cta": "#8B5E3C",
      "--radius": "16px",
    },
  },
};
