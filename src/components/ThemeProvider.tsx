"use client";

import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/stores/themeStore";

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const setResolvedTheme = useThemeStore((state) => state.setResolvedTheme);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolveTheme = (): "light" | "dark" => {
      if (theme === "system") return mediaQuery.matches ? "dark" : "light";
      return theme;
    };

    const update = () => {
      const resolved = resolveTheme();
      applyTheme(resolved);
      setResolvedTheme(resolved);
    };

    update();

    if (theme === "system") {
      const handler = () => update();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme, setResolvedTheme]);

  return <>{children}</>;
}
