import type { ReaderTheme } from "@/stores/readerStore";

export interface ReaderThemeConfig {
  id: ReaderTheme;
  bg: string;
  text: string;
  border: string;
  metaText: string;
  paragraphHover: string;
  badgeActive: string;
}

export const READER_THEMES: Record<ReaderTheme, ReaderThemeConfig> = {
  light: {
    id: "light",
    bg: "bg-white",
    text: "text-gray-800",
    border: "border-gray-100",
    metaText: "text-gray-400",
    paragraphHover: "hover:bg-gray-100",
    badgeActive: "bg-primary/10 text-primary",
  },
  sepia: {
    id: "sepia",
    bg: "bg-[#f5f0e8]",
    text: "text-[#5c4a32]",
    border: "border-[#d4c5a9]",
    metaText: "text-[#7a6347]",
    paragraphHover: "hover:bg-[#ebe3d5]/60",
    badgeActive: "bg-[#7a6347]/15 text-[#5c4a32]",
  },
  gray: {
    id: "gray",
    bg: "bg-gray-200",
    text: "text-gray-900",
    border: "border-gray-300",
    metaText: "text-gray-600",
    paragraphHover: "hover:bg-gray-300/60",
    badgeActive: "bg-gray-700/15 text-gray-900",
  },
  dark: {
    id: "dark",
    bg: "bg-[#1a1a2e]",
    text: "text-gray-200",
    border: "border-gray-700",
    metaText: "text-gray-400",
    paragraphHover: "hover:bg-white/5",
    badgeActive: "bg-primary-700/40 text-primary-300",
  },
};

export const PAGE_BG: Record<ReaderTheme, string> = {
  light: "bg-[#fdf9f0]",
  sepia: "bg-[#efe7d4]",
  gray: "bg-gray-100",
  dark: "bg-[#0f0f14]",
};
