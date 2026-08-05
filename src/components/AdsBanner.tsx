"use client";

import { useEffect, useRef, useState } from "react";
import { useAds, AdPlacementLocation } from "@/hooks/useAds";

interface AdsBannerProps {
  location: AdPlacementLocation;
  storyId?: string;
  chapterId?: string;
  token?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Custom height for the banner (default varies by location) */
  height?: number | string;
  /** Show placeholder when ad is loading */
  showPlaceholder?: boolean;
  /** Custom placeholder content */
  placeholder?: React.ReactNode;
  /** Called when ad is clicked */
  onAdClick?: () => void;
  /** Called when ad is loaded */
  onAdLoad?: () => void;
  /** Called when ad fails to load */
  onAdError?: (error: Error) => void;
}

// Default heights by location (in pixels)
const DEFAULT_HEIGHTS: Record<AdPlacementLocation, number> = {
  banner_top: 90,
  banner_sidebar: 250,
  banner_footer: 90,
  in_content: 100,
  reward_video: 60,
};

export default function AdsBanner({
  location,
  storyId,
  chapterId,
  token,
  className = "",
  style,
  height,
  showPlaceholder = true,
  placeholder,
  onAdClick,
  onAdLoad,
  onAdError,
}: AdsBannerProps) {
  const { getPlacementConfig, recordImpression, isPlacementActive } = useAds(token, storyId, chapterId);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  const config = getPlacementConfig(location);
  const isActive = isPlacementActive(location);
  const computedHeight = height ?? DEFAULT_HEIGHTS[location];

  // Record impression when component mounts
  useEffect(() => {
    if (isActive) {
      recordImpression(location, storyId, chapterId);
    }
  }, [location, isActive, recordImpression, storyId, chapterId]);

  // Simulate ad loading (in production, this would be replaced with actual ad SDK)
  useEffect(() => {
    if (!isActive) return;

    // Simulate ad network response time
    const loadTimeout = setTimeout(() => {
      setAdLoaded(true);
      onAdLoad?.();
    }, 500 + Math.random() * 500);

    return () => clearTimeout(loadTimeout);
  }, [isActive, onAdLoad]);

  const handleAdClick = () => {
    onAdClick?.();
  };

  // If placement is not active, don't render anything
  if (!isActive) {
    return null;
  }

  // Render placeholder
  if (!adLoaded && showPlaceholder) {
    return (
      <div
        className={`ads-banner ads-banner--placeholder flex items-center justify-center bg-gray-100 ${className}`}
        style={{
          height: typeof computedHeight === "number" ? `${computedHeight}px` : computedHeight,
          ...style,
        }}
      >
        {placeholder || (
          <div className="flex flex-col items-center gap-1">
            <div className="h-6 w-6 animate-pulse rounded-full bg-gray-300" />
            <span className="text-caption text-gray-400">Đang tải quảng cáo...</span>
          </div>
        )}
      </div>
    );
  }

  // Render placeholder on error
  if (adError || adError === "placeholder") {
    return (
      <div
        className={`ads-banner ads-banner--error ${className}`}
        style={{
          height: typeof computedHeight === "number" ? `${computedHeight}px` : computedHeight,
          ...style,
        }}
      >
        {/* Empty space for failed ad - no visual distraction */}
      </div>
    );
  }

  // Render actual ad placeholder (simulated)
  return (
    <div
      ref={adRef}
      className={`ads-banner ads-banner--${location} relative overflow-hidden rounded-lg ${className}`}
      style={{
        height: typeof computedHeight === "number" ? `${computedHeight}px` : computedHeight,
        backgroundColor: location === "banner_sidebar" ? "#f3f4f6" : "#ffffff",
        border: "1px solid #e5e7eb",
        ...style,
      }}
      onClick={handleAdClick}
      role="article"
      aria-label="Quảng cáo"
    >
      {/* Simulated ad content - Replace with actual ad SDK integration */}
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 p-4">
          {/* Ad indicator */}
          <div className="flex items-center gap-1">
            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500">
              Quảng cáo
            </span>
          </div>
          
          {/* Simulated ad content based on location */}
          {location === "banner_top" && (
            <div className="flex w-full items-center justify-between gap-4">
              <div className="h-10 w-24 rounded bg-gradient-to-r from-blue-100 to-blue-200" />
              <div className="flex-1 text-center">
                <div className="text-sm font-semibold text-gray-700">Ứng dụng đọc truyện</div>
                <div className="text-xs text-gray-500">Tải ngay - Miễn phí</div>
              </div>
              <button className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white">
                Tải
              </button>
            </div>
          )}

          {location === "banner_sidebar" && (
            <div className="flex w-full flex-col items-center gap-3">
              <div className="h-20 w-full rounded bg-gradient-to-r from-purple-100 to-pink-100" />
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700">Sách hay mỗi ngày</div>
                <div className="text-xs text-gray-500">Đọc không giới hạn</div>
              </div>
              <button className="w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-white">
                Khám phá ngay
              </button>
            </div>
          )}

          {location === "banner_footer" && (
            <div className="flex w-full items-center justify-between gap-4">
              <div className="text-sm font-medium text-gray-600">Quảng cáo</div>
              <button className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50">
                Bỏ qua
              </button>
            </div>
          )}

          {location === "in_content" && (
            <div className="flex w-full items-center gap-4">
              <div className="h-16 w-16 rounded bg-gradient-to-br from-amber-100 to-orange-100" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-700">Ưu đãi đặc biệt</div>
                <div className="text-xs text-gray-500">Giảm 50% cho thành viên mới</div>
              </div>
            </div>
          )}

          {location === "reward_video" && (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">Video quảng cáo</div>
                <div className="text-xs text-gray-500">Xem để nhận 5 xu</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ad metadata */}
      <div className="absolute bottom-1 right-1">
        <span className="text-[9px] text-gray-400">Ad</span>
      </div>
    </div>
  );
}

// ─── Preset Banner Components ─────────────────────────────────────────

interface PresetBannerProps {
  storyId?: string;
  chapterId?: string;
  token?: string;
}

export function TopBanner({ storyId, chapterId, token }: PresetBannerProps) {
  return (
    <AdsBanner
      location="banner_top"
      storyId={storyId}
      chapterId={chapterId}
      token={token}
      className="w-full"
    />
  );
}

export function SidebarBanner({ storyId, chapterId, token }: PresetBannerProps) {
  return (
    <AdsBanner
      location="banner_sidebar"
      storyId={storyId}
      chapterId={chapterId}
      token={token}
      className="w-full"
    />
  );
}

export function FooterBanner({ storyId, chapterId, token }: PresetBannerProps) {
  return (
    <AdsBanner
      location="banner_footer"
      storyId={storyId}
      chapterId={chapterId}
      token={token}
      className="w-full"
    />
  );
}

export function InContentAd({ storyId, chapterId, token, className }: PresetBannerProps & { className?: string }) {
  return (
    <AdsBanner
      location="in_content"
      storyId={storyId}
      chapterId={chapterId}
      token={token}
      className={className}
    />
  );
}
