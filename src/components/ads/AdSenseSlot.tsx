"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    if (!adSlot) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // ignore
    }
  }, [adSlot]);

  if (!adSlot) return null;

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
