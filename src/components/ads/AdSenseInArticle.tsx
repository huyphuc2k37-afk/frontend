"use client";

import { useEffect, useRef } from "react";

// Google AdSense — in-article fluid ad (slot 1869731119)
export default function AdSenseInArticle({ className }: { className?: string }) {
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
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-5262734754559750"
        data-ad-slot="1869731119"
      />
    </div>
  );
}
