"use client";

import { useEffect, useRef } from "react";

const POPUNDER_SRC =
  "https://pl28891940.effectivegatecpm.com/77/e0/16/77e0162b09f979d1db349b580c377e9b.js";

/**
 * Loads the Adsterra popunder script once per browser session.
 * Renders nothing visible.
 */
export default function AdsterraPopunder() {
  const loaded = useRef(false);

  useEffect(() => {
    // Only fire once per session
    if (loaded.current) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("adsterra_pop")) return;

    loaded.current = true;
    sessionStorage.setItem("adsterra_pop", "1");

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = POPUNDER_SRC;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      try {
        document.body.removeChild(script);
      } catch {
        // already removed
      }
    };
  }, []);

  return null;
}
