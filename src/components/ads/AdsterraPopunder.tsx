"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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
    pathname === "/ranking" ||
    pathname.startsWith("/story/") ||
    pathname.startsWith("/the-loai/") ||
    pathname.startsWith("/tag/") ||
    pathname.startsWith("/author/");

  useEffect(() => {
    if (!isEligibleRoute || loaded.current || sessionStorage.getItem("adsterra-popunder-loaded") === "1") {
      return;
    }
    loaded.current = true;
    sessionStorage.setItem("adsterra-popunder-loaded", "1");

    const script = document.createElement("script");
    script.src = "https://pl28891940.effectivegatecpm.com/77/e0/16/77e0162b09f979d1db349b580c377e9b.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      try { document.body.removeChild(script); } catch {}
    };
  }, [isEligibleRoute]);

  return null;
}
