"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Adsterra Social Bar — floating social-style ad.
 * Loads once globally (safe to render in layout).
 */
export default function AdsterraSocialBar() {
  const loaded = useRef(false);
  const pathname = usePathname();
  const isChapterPage = pathname.startsWith("/story/") && pathname.includes("/chapter/");

  const isEligibleRoute =
    pathname === "/" ||
    pathname === "/explore" ||
    pathname === "/ranking" ||
    pathname.startsWith("/story/") ||
    pathname.startsWith("/the-loai/") ||
    pathname.startsWith("/tag/") ||
    pathname.startsWith("/author/");

  useEffect(() => {
    if (!isEligibleRoute || isChapterPage || loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = "https://pl28892029.effectivegatecpm.com/d0/11/e3/d011e32c93f5234cd37954a80fb5d680.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      try { document.body.removeChild(script); } catch {}
      loaded.current = false;
    };
  }, [isChapterPage, isEligibleRoute]);

  return null;
}
