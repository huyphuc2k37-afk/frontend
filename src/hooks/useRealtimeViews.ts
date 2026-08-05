"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

interface ViewData {
  storyId: string;
  views: number;
  pendingViews: number;
  totalViews: number;
  lastUpdated: string;
}

/**
 * A1: Poll view count mỗi 30s để hiển thị gần real-time.
 * Returns totalViews = DB views + pending buffer (tổng thực tế).
 */
export function useRealtimeViews(slug: string, initialViews: number, intervalMs = 30_000) {
  const [totalViews, setTotalViews] = useState(initialViews);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/stories/${slug}/views`, { cache: "no-store" });
        if (!res.ok) return;
        const data: ViewData = await res.json();
        if (!cancelled && typeof data.totalViews === "number") {
          setTotalViews(data.totalViews);
        }
      } catch {
        // ignore
      }
    };

    // Poll ngay khi mount, sau đó theo interval
    poll();
    const timer = setInterval(poll, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [slug, intervalMs]);

  return totalViews;
}
