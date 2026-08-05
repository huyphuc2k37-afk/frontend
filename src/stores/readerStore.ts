import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ReaderTheme = "light" | "sepia" | "gray" | "dark";

export type ReaderFontFamily =
  | "lora"
  | "merriweather"
  | "jakarta"
  | "openSans"
  | "quicksand";

export const READER_FONT_FAMILIES: ReaderFontFamily[] = [
  "lora",
  "merriweather",
  "jakarta",
  "openSans",
  "quicksand",
];

export const READER_FONT_CSS: Record<ReaderFontFamily, string> = {
  lora: "var(--font-lora), Lora, Georgia, serif",
  merriweather: "var(--font-merriweather), Merriweather, Georgia, serif",
  jakarta: "var(--font-jakarta), Plus Jakarta Sans, sans-serif",
  openSans: "var(--font-open-sans), 'Open Sans', sans-serif",
  quicksand: "var(--font-quicksand), Quicksand, sans-serif",
};

export const READER_FONT_LABELS: Record<ReaderFontFamily, string> = {
  lora: "Lora (Serif)",
  merriweather: "Merriweather (Serif)",
  jakarta: "Plus Jakarta (Sans)",
  openSans: "Open Sans",
  quicksand: "Quicksand",
};

export interface ReaderSettings {
  fontSize: number; // 14-28
  lineHeight: number; // 1.4-2.2
  theme: ReaderTheme;
  fontFamily: ReaderFontFamily;
  maxWidth: number; // 600-900
}

interface ReaderState {
  settings: ReaderSettings;
  setSetting: <K extends keyof ReaderSettings>(
    key: K,
    value: ReaderSettings[K]
  ) => void;
  reset: () => void;
}

const DEFAULTS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.8,
  theme: "light",
  fontFamily: "lora",
  maxWidth: 720,
};

/**
 * Migrate persisted state from older shapes:
 * - fontFamily was "serif" | "sans" → map to named fonts
 * - fontSize was 14-24 → clamp to 14-28
 */
function migrateSettings(input: any): ReaderSettings {
  const out: ReaderSettings = { ...DEFAULTS, ...(input || {}) };
  // Map legacy values first
  let ff: string = out.fontFamily as unknown as string;
  if (ff === "serif") ff = "lora";
  else if (ff === "sans") ff = "jakarta";
  if (!READER_FONT_FAMILIES.includes(ff as ReaderFontFamily)) ff = "lora";
  out.fontFamily = ff as ReaderFontFamily;
  out.fontSize = Math.min(28, Math.max(14, Number(out.fontSize) || 18));
  out.lineHeight = Math.min(2.2, Math.max(1.4, Number(out.lineHeight) || 1.8));
  out.maxWidth = Math.min(900, Math.max(600, Number(out.maxWidth) || 720));
  if (!["light", "sepia", "gray", "dark"].includes(out.theme)) out.theme = "light";
  return out;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      settings: DEFAULTS,
      setSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),
      reset: () => set({ settings: DEFAULTS }),
    }),
    {
      name: "vstory-reader-settings",
      version: 2,
      migrate: (state: any, _version) => {
        if (!state) return { settings: DEFAULTS };
        return { settings: migrateSettings(state.settings) };
      },
    }
  )
);
