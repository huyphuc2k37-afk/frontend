"use client";

import { useEffect, useRef } from "react";

const SOCIALBAR_SRC =
  "https://pl28892029.effectivegatecpm.com/d0/11/e3/d011e32c93f5234cd37954a80fb5d680.js";

/**
 * Adsterra SocialBar — floating interactive ad widget.
 * Loads once per page. Renders nothing visible itself.
 */
export default function AdsterraSocialBar() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    if (typeof window === "undefined") return;

    loaded.current = true;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = SOCIALBAR_SRC;
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
