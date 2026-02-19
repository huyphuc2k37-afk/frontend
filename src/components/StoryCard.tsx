"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Story } from "@/types";
import { API_BASE_URL } from "@/lib/api";

interface StoryCardProps {
  story: Story;
  /** Visual size variant */
  variant?: "default" | "featured";
}

const PLACEHOLDER_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23e5e7eb'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";

export default function StoryCard({ story, variant = "default" }: StoryCardProps) {
  const isFeatured = variant === "featured";
  const coverUrl = `${API_BASE_URL}/api/stories/${story.id}/cover`;
  const [coverSrc, setCoverSrc] = useState(coverUrl);

  return (
    <Link href={`/story/${story.slug}`} className="block">
      <article
        className={`group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-transform duration-200 hover:-translate-y-1 hover:shadow-md ${
          isFeatured ? "w-[260px] flex-shrink-0 sm:w-[280px]" : ""
        }`}
      >
        {/* Cover */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
          <Image
            src={coverSrc}
            alt={`Bia truyện ${story.title}`}
            fill
            sizes={isFeatured ? "280px" : "(max-width: 640px) 50vw, 180px"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
            onError={() => setCoverSrc(PLACEHOLDER_COVER)}
          />

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4">
          <h3 className="line-clamp-1 text-heading-md text-gray-900">
            {story.title}
          </h3>
          <p className="mt-0.5 text-caption text-gray-500">
            {story.author?.name}
          </p>
          {story.description && (
            <p className="mt-2 line-clamp-2 text-body-sm text-gray-600">
              {story.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-caption text-gray-400">
            {story.genre?.split(",").map((g: string) => g.trim()).filter(Boolean).slice(0, 2).map((g: string) => (
              <span key={g} className="rounded-full bg-gray-100 px-2 py-0.5">{g}</span>
            ))}
            <span>&middot;</span>
            <span>{story.views > 0 ? `${(story.views / 1000).toFixed(1)}K đọc` : "0 đọc"}</span>
            {story.status && (
              <>
                <span>&middot;</span>
                <span>
                  {story.status === "ongoing" ? "Đang ra" : "Hoàn thành"}
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
