"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot?: string;
  className?: string;
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-5262734754559750";
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHAPTER_BOTTOM || "1336707630";

export default function AdSenseSlot({ slot, className }: Props) {
  const adSlot = slot || DEFAULT_SLOT;
  const containerRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!adSlot) return;
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
  }, [adSlot]);

  if (!adSlot) return null;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden transition-all duration-300 ${filled ? "opacity-100" : "max-h-0 opacity-0"}`}
    >
      <ins
        className={`adsbygoogle${className ? ` ${className}` : ""}`}
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
