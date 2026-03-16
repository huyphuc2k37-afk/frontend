"use client";

import { useEffect, useRef } from "react";

export default function AdsterraBanner({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const container = containerRef.current;

    // Create atOptions script
    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    configScript.text = `
      atOptions = {
        'key' : '24f0952a32e5e61ead56848dc7743d44',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    container.appendChild(configScript);

    // Create invoke script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://www.highperformanceformat.com/24f0952a32e5e61ead56848dc7743d44/invoke.js";
    container.appendChild(invokeScript);

    return () => {
      container.innerHTML = "";
      loaded.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center overflow-hidden ${className || ""}`}
      style={{ minHeight: 250, minWidth: 300 }}
    />
  );
}
