"use client";

import { useEffect, useRef, useState } from "react";

export default function AdsterraBanner({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || loaded.current || !containerRef.current) return;
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
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`mx-auto flex w-full max-w-[300px] items-center justify-center overflow-hidden ${className || ""}`}
      style={{ minHeight: 250 }}
    />
  );
}
