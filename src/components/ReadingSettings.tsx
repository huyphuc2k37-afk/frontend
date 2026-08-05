"use client";

import { useEffect } from "react";
import { Settings2, Type, AlignJustify, Palette, RotateCcw, Check } from "lucide-react";
import { useReaderStore, READER_FONT_FAMILIES, READER_FONT_CSS, READER_FONT_LABELS, type ReaderSettings as Settings } from "@/stores/readerStore";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import { cn } from "@/lib/utils";

const FONT_PRESETS: Array<{ value: number; label: string }> = [
  { value: 14, label: "Nhỏ" },
  { value: 16, label: "Vừa" },
  { value: 18, label: "Mặc định" },
  { value: 22, label: "Lớn" },
  { value: 28, label: "Rất lớn" },
];

const THEMES: Array<{
  id: Settings["theme"];
  label: string;
  bg: string;
  text: string;
  border: string;
}> = [
  {
    id: "light",
    label: "Sáng",
    bg: "bg-white",
    text: "text-gray-900",
    border: "border-gray-200",
  },
  {
    id: "sepia",
    label: "Nâu",
    bg: "bg-[#f4ecd8]",
    text: "text-[#5b4636]",
    border: "border-[#d4c5a9]",
  },
  {
    id: "gray",
    label: "Xám",
    bg: "bg-gray-200",
    text: "text-gray-900",
    border: "border-gray-300",
  },
  {
    id: "dark",
    label: "Tối",
    bg: "bg-[#1a1a2e]",
    text: "text-gray-100",
    border: "border-gray-700",
  },
];

interface ReadingSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReadingSettingsPanel({ isOpen, onClose }: ReadingSettingsPanelProps) {
  const { settings, setSetting, reset } = useReaderStore();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-popover shadow-2xl animate-in slide-in-from-right">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-heading text-heading-md">Cài đặt đọc truyện</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng">
            ✕
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Section icon={<Type className="h-4 w-4" />} title="Phông chữ">
            <div className="grid grid-cols-2 gap-2">
              {READER_FONT_FAMILIES.map((family) => (
                <button
                  key={family}
                  onClick={() => setSetting("fontFamily", family)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-body-md transition-all",
                    settings.fontFamily === family
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background hover:bg-muted"
                  )}
                  style={{ fontFamily: READER_FONT_CSS[family] }}
                >
                  {READER_FONT_LABELS[family]}
                </button>
              ))}
            </div>
          </Section>

          <Section
            icon={<Type className="h-4 w-4" />}
            title="Cỡ chữ"
            badge={`${settings.fontSize}px`}
          >
            <input
              type="range"
              min={14}
              max={28}
              step={1}
              value={settings.fontSize}
              onChange={(e) => setSetting("fontSize", Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="mt-1 flex justify-between text-caption text-muted-foreground">
              <span>Nhỏ</span>
              <span>Lớn</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {FONT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setSetting("fontSize", preset.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-caption transition-all",
                    settings.fontSize === preset.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background hover:bg-muted"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </Section>

          <Section
            icon={<AlignJustify className="h-4 w-4" />}
            title="Giãn dòng"
            badge={settings.lineHeight.toFixed(1)}
          >
            <input
              type="range"
              min={1.4}
              max={2.2}
              step={0.1}
              value={settings.lineHeight}
              onChange={(e) => setSetting("lineHeight", Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
          </Section>

          <Section
            icon={<AlignJustify className="h-4 w-4 rotate-90" />}
            title="Độ rộng"
            badge={`${settings.maxWidth}px`}
          >
            <input
              type="range"
              min={600}
              max={900}
              step={20}
              value={settings.maxWidth}
              onChange={(e) => setSetting("maxWidth", Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
          </Section>

          <Section icon={<Palette className="h-4 w-4" />} title="Chủ đề">
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSetting("theme", t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all",
                    settings.theme === t.id
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  )}
                >
                  <div className={cn("h-10 w-full rounded-md border", t.bg, t.border, "flex items-center justify-center")}>
                    <span className={cn("text-body-sm font-semibold", t.text)}>Aa</span>
                  </div>
                  <span className="text-caption font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Xem trước">
            <div
              className={cn(
                "rounded-lg border p-4 transition-colors",
                THEMES.find((t) => t.id === settings.theme)?.bg,
                THEMES.find((t) => t.id === settings.theme)?.border
              )}
              style={{
                fontFamily: READER_FONT_CSS[settings.fontFamily],
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
              }}
            >
              <p className={cn(THEMES.find((t) => t.id === settings.theme)?.text)}>
                Đêm qua, An ngồi bên cửa sổ, nhìn ra khu vườn ngủ quên trong tiếng dế kêu rả rích.
              </p>
            </div>
          </Section>
        </div>

        <footer className="border-t border-border bg-card px-6 py-3">
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4" /> Đặt lại mặc định
          </Button>
        </footer>
      </aside>
    </>
  );
}

function Section({
  icon,
  title,
  badge,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-body-md font-semibold text-foreground">
          {icon} {title}
        </h3>
        {badge && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-caption font-medium text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

// Backward-compatible hook for any callers still using the old API
export function useReadingSettings() {
  const { settings, setSetting, reset } = useReaderStore();
  return {
    settings: {
      ...settings,
      // old API expected a `margin` value; map to maxWidth for compat
      margin: settings.maxWidth === 720 ? 16 : 0,
    },
    updateSettings: (s: Settings & { margin?: number }) => {
      Object.entries(s).forEach(([key, value]) => {
        if (value !== undefined) {
          // @ts-expect-error - permitted dynamic keys
          setSetting(key, value);
        }
      });
    },
    reset,
  };
}
