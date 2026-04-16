"use client";

import { useEffect, useRef } from "react";

// Google AdSense — autorelaxed native ad (slot 7907587470)
export default function AdsterraNativeBanner({ className }: { className?: string }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="autorelaxed"
        data-ad-client="ca-pub-5262734754559750"
        data-ad-slot="7907587470"
      />
    </div>
  );
}
