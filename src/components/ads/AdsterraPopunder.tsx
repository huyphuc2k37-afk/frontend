"use client";

import { useEffect, useRef } from "react";

/**
 * Adsterra Popunder — triggers once per session on user interaction.
 * Place once in the layout or a high-traffic page.
 */
export default function AdsterraPopunder() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = "https://pl28891940.effectivegatecpm.com/77/e0/16/77e0162b09f979d1db349b580c377e9b.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      try { document.body.removeChild(script); } catch {}
    };
  }, []);

  return null;
}
