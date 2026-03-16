"use client";

import { useEffect, useRef, useState } from "react";

export default function AdsterraNativeBanner({ className }: { className?: string }) {
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

    const invokeScript = document.createElement("script");
    invokeScript.async = true;
    invokeScript.setAttribute("data-cfasync", "false");
    invokeScript.src = "https://pl28925505.effectivegatecpm.com/02940d14691a7600629d569106deb0da/invoke.js";
    container.appendChild(invokeScript);

    return () => {
      container.innerHTML = "";
      loaded.current = false;
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`mx-auto w-full overflow-hidden ${className || ""}`}
    >
      <div id="container-02940d14691a7600629d569106deb0da" />
    </div>
  );
}
