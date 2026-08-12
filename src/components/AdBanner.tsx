"use client";

import Image from "next/image";

export default function AdBanner() {
  return (
    <div className="relative w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
      {/* Desktop banner (>=768px) — keeps original 728×90, centered */}
      <div className="hidden justify-center md:flex">
        <Image
          src="/banner-desktop.png"
          alt="Quảng cáo"
          width={728}
          height={90}
          className="block"
          unoptimized
          priority
        />
      </div>
      {/* Mobile banner (<768px) — keeps original 320×100, centered */}
      <div className="flex justify-center md:hidden">
        <Image
          src="/banner-mobile.png"
          alt="Quảng cáo"
          width={320}
          height={100}
          className="block"
          unoptimized
          priority
        />
      </div>
    </div>
  );
}