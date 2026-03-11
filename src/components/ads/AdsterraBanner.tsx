"use client";

import { useEffect, useRef, useState } from "react";

const ADSTERRA_KEY = "24f0952a32e5e61ead56848dc7743d44";

export default function AdsterraBanner({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://highperformanceformat.com/${ADSTERRA_KEY}/invoke.js`;
    script.async = true;

    script.onload = () => {
      // Give the ad a moment to render
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
      className={`flex justify-center overflow-hidden transition-opacity duration-300 ${filled ? "opacity-100" : "opacity-0"} ${className || ""}`}
      style={{ minHeight: filled ? 250 : 0, contain: "layout" }}
    >
      <div id={`container-${ADSTERRA_KEY}`} />
    </div>
  );
}
