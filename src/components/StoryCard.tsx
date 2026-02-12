"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Story } from "@/types";

interface StoryCardProps {
  story: Story;
  /** Visual size variant */
  variant?: "default" | "featured";
}

const PLACEHOLDER_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23e5e7eb'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";

export default function StoryCard({ story, variant = "default" }: StoryCardProps) {
  const isFeatured = variant === "featured";

  return (
    <Link href={`/story/${story.slug}`} className="block">
      <motion.article
        className={`card-hover group overflow-hidden rounded-2xl border border-gray-100 bg-white ${
          isFeatured ? "w-[260px] flex-shrink-0 sm:w-[280px]" : ""
        }`}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
      >
        {/* Cover */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
          <Image
            src={story.coverImage || PLACEHOLDER_COVER}
            alt={`Bia truyện ${story.title}`}
            fill
            sizes={isFeatured ? "280px" : "(max-width: 640px) 50vw, 25vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
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
            <span className="rounded-full bg-gray-100 px-2 py-0.5">
              {story.genre}
            </span>
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
      </motion.article>
    </Link>
  );
}
