"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const POPUNDER_COOLDOWN_MS = 12 * 60 * 60 * 1000;
const POPUNDER_DELAY_MS = 15000;
const POPUNDER_MIN_SCROLL = 400;

/**
 * Adsterra Popunder — triggers once per session on user interaction.
 * Place once in the layout or a high-traffic page.
 */
export default function AdsterraPopunder() {
  const loaded = useRef(false);
  const pathname = usePathname();

  const isEligibleRoute =
    pathname === "/" ||
    pathname === "/explore" ||
    pathname === "/ranking";

  useEffect(() => {
    if (!isEligibleRoute || loaded.current) {
      return;
    }

    try {
      const lastShownAt = Number(localStorage.getItem("adsterra-popunder-last-shown") || "0");
      if (Date.now() - lastShownAt < POPUNDER_COOLDOWN_MS) {
        return;
      }
    } catch {
      // ignore storage read issues
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const loadPopunder = () => {
      if (cancelled || loaded.current) return;
      loaded.current = true;

      try {
        localStorage.setItem("adsterra-popunder-last-shown", String(Date.now()));
      } catch {
        // ignore storage write issues
      }

      const script = document.createElement("script");
      script.src = "https://pl28891940.effectivegatecpm.com/77/e0/16/77e0162b09f979d1db349b580c377e9b.js";
      script.async = true;
      document.body.appendChild(script);

      const cleanup = () => {
        try {
          document.body.removeChild(script);
        } catch {}
      };

      window.removeEventListener("scroll", handleScroll);
      window.addEventListener("pagehide", cleanup, { once: true });
    };

    const armPopunder = () => {
      if (cancelled || timer) return;
      timer = setTimeout(loadPopunder, POPUNDER_DELAY_MS);
    };

    const handleScroll = () => {
      if (window.scrollY >= POPUNDER_MIN_SCROLL) {
        armPopunder();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", handleScroll);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isEligibleRoute]);

  return null;
}
