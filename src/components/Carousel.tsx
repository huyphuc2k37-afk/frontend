"use client";

import { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import StoryCard from "./StoryCard";
import type { Story } from "@/types";

interface CarouselProps {
  title: string;
  stories: Story[];
}

export default function Carousel({ title, stories }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-10 sm:py-14" aria-label={title}>
      <div className="section-container">
        {/* Section heading */}
        <div
          className="mb-6 flex items-center justify-between"
        >
          <h2 className="text-display-sm text-gray-900">
            {title}
          </h2>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scroll("left")}
              className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition-all hover:bg-gray-50 hover:shadow-md"
              aria-label="Trước"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition-all hover:bg-gray-50 hover:shadow-md"
              aria-label="Tiếp"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 snap-x snap-mandatory scroll-pl-4"
          role="list"
          aria-label={`Danh sách ${title}`}
        >
          {stories.map((story) => (
            <div
              key={story.id}
              className="snap-start"
              role="listitem"
            >
              <StoryCard story={story} variant="featured" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
