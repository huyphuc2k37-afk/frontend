"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api";

interface Banner {
  location: string;
  customImageUrl: string | null;
  customImageMobileUrl: string | null;
  clickUrl: string | null;
  advertiserName: string | null;
  isOpenNewTab?: boolean;
}

export default function AdBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ads/banners`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.banners)) {
          setBanners(data.banners);
        }
      })
      .catch(() => {});
  }, []);

  const handleClick = useCallback(async (location: string) => {
    // Fire-and-forget click tracking
    fetch(`${API_BASE_URL}/api/ads/click/${location}`, { method: "POST" }).catch(() => {});
  }, []);

  const dismissBanner = useCallback((location: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(location);
      return next;
    });
    // Store in sessionStorage so it doesn't re-appear on navigation
    try {
      sessionStorage.setItem(`banner_dismissed_${location}`, "1");
    } catch {}
  }, []);

  const getBannerSrc = (banner: Banner) => {
    // Prefer mobile image on small screens
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return banner.customImageMobileUrl || banner.customImageUrl;
    }
    return banner.customImageUrl || banner.customImageMobileUrl;
  };

  if (banners.length === 0) return null;

  return (
    <>
      {banners
        .filter((b) => b.customImageUrl || b.customImageMobileUrl)
        .filter((b) => !dismissed.has(b.location))
        .filter((b) => {
          try {
            return !sessionStorage.getItem(`banner_dismissed_${b.location}`);
          } catch {
            return true;
          }
        })
        .map((banner) => {
          const src = getBannerSrc(banner);
          if (!src || !banner.clickUrl) return null;

          return (
            <div
              key={banner.location}
              className="relative w-full bg-gray-100 dark:bg-gray-800 overflow-hidden"
              style={{ height: "auto", maxHeight: 120, containIntrinsicSize: "auto 120px", contentVisibility: "auto" }}
            >
              <a
                href={banner.clickUrl}
                target={banner.isOpenNewTab !== false ? "_blank" : "_self"}
                rel="noopener noreferrer"
                onClick={() => handleClick(banner.location)}
                className="block w-full cursor-pointer"
                aria-label={banner.advertiserName ? `Quảng cáo: ${banner.advertiserName}` : "Quảng cáo"}
              >
                <div className="relative w-full" style={{ aspectRatio: "auto" }}>
                  <Image
                    src={src}
                    alt={banner.advertiserName || "Quảng cáo"}
                    fill
                    className="object-contain"
                    unoptimized
                    sizes="100vw"
                    priority={banner.location === "banner_top"}
                  />
                </div>
              </a>

              {/* Dismiss button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dismissBanner(banner.location);
                }}
                className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 text-white/70 hover:bg-black/70 hover:text-white transition-colors"
                title="Đóng banner quảng cáo"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
    </>
  );
}
