"use client";

import Image from "next/image";

export default function AdBanner() {
  return (
    <div className="relative w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
      {/* Desktop banner (>=768px) */}
      <div className="relative hidden w-full md:block" style={{ aspectRatio: "auto" }}>
        <Image
          src="/banner-desktop.png"
          alt="Quảng cáo"
          width={1920}
          height={120}
          className="h-auto w-full object-contain"
          unoptimized
          priority
        />
      </div>
      {/* Mobile banner (<768px) */}
      <div className="relative block w-full md:hidden" style={{ aspectRatio: "auto" }}>
        <Image
          src="/banner-mobile.png"
          alt="Quảng cáo"
          width={750}
          height={120}
          className="h-auto w-full object-contain"
          unoptimized
          priority
        />
      </div>
    </div>
  );
}