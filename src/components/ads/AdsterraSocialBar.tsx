"use client";

import { useEffect, useRef } from "react";

/**
 * Adsterra Social Bar — floating social-style ad.
 * Loads once globally (safe to render in layout).
 */
export default function AdsterraSocialBar() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = "https://pl28892029.effectivegatecpm.com/d0/11/e3/d011e32c93f5234cd37954a80fb5d680.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      try { document.body.removeChild(script); } catch {}
    };
  }, []);

  return null;
}
