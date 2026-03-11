"use client";

import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    atOptions?: Record<string, unknown>;
  }
}

const ADSTERRA_KEY = "24f0952a32e5e61ead56848dc7743d44";

export default function AdsterraBanner({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  const [filled, setFilled] = useState(false);
  const uniqueId = useId().replace(/:/g, "_");

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    // Adsterra invoke.js reads atOptions then inserts an iframe next to the script
    window.atOptions = {
      key: ADSTERRA_KEY,
      format: "iframe",
      height: 250,
      width: 300,
      params: {},
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://highperformanceformat.com/${ADSTERRA_KEY}/invoke.js`;
    script.async = true;

    script.onload = () => {
      setTimeout(() => setFilled(true), 500);
    };
    script.onerror = () => {
      // Hide if blocked by adblocker
    };

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div
      ref={containerRef}
      id={`adsterra-${uniqueId}`}
      className={`flex justify-center overflow-hidden transition-opacity duration-300 ${filled ? "opacity-100" : "opacity-0"} ${className || ""}`}
      style={{ minHeight: filled ? 250 : 0, contain: "layout" }}
    />
  );
}
