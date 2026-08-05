"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ReaderProgressBarProps {
  targetSelector?: string;
}

export function ReaderProgressBar({ targetSelector = "#chapter-content" }: ReaderProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    function update() {
      const scrollEl = document.scrollingElement || document.documentElement;
      const top = scrollEl.scrollTop;
      const total = scrollEl.scrollHeight - scrollEl.clientHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, (top / total) * 100)) : 0;
      setProgress(pct);
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [targetSelector]);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed left-0 right-0 top-0 z-40 h-1 bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-[width] duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
