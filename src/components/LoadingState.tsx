"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";

export function CardSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-xl bg-gray-200" />
          <div className="mt-2.5 h-3.5 w-3/4 rounded bg-gray-200" />
          <div className="mt-1.5 h-3 w-1/2 rounded bg-gray-100" />
          <div className="mt-2 flex gap-1.5">
            <div className="h-4 w-12 rounded-full bg-gray-100" />
            <div className="h-4 w-10 rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-[160px] flex-shrink-0 animate-pulse sm:w-[180px]">
          <div className="aspect-[3/4] rounded-xl bg-gray-200" />
          <div className="mt-2.5 h-3.5 w-3/4 rounded bg-gray-200" />
          <div className="mt-1.5 h-3 w-1/2 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-5 w-5 border-2" : size === "lg" ? "h-10 w-10 border-4" : "h-8 w-8 border-[3px]";
  return (
    <div className="flex justify-center py-8" role="status" aria-label="Đang tải">
      <ArrowPathIcon
        className={`${sizeClass} animate-spin text-primary-500`}
        style={{ animationDuration: "1s" }}
      />
    </div>
  );
}
