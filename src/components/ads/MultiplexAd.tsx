"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-[250px]">
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
