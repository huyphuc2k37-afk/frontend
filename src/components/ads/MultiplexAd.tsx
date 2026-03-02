"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  className?: string;
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-5262734754559750";
const MULTIPLEX_SLOT = "7907587470";

export default function MultiplexAd({ className }: Props) {
  const pushed = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // ignore
    }

    // Check if ad filled after a delay
    const timer = setTimeout(() => {
      const el = containerRef.current;
      if (el) {
        const ins = el.querySelector("ins");
        if (ins && ins.offsetHeight > 0) {
          setFilled(true);
        }
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden transition-all duration-300 ${filled ? "opacity-100" : "max-h-0 opacity-0"}`}
    >
      <ins
        className={`adsbygoogle${className ? ` ${className}` : ""}`}
        style={{ display: "block" }}
        data-ad-format="autorelaxed"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={MULTIPLEX_SLOT}
      />
    </div>
  );
}
