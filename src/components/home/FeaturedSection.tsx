"use client";

import { useRef, useState, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import StoryCard, { ApiStory } from "@/components/home/StoryCard";

interface FeaturedSectionProps {
  stories: ApiStory[];
}

export default function FeaturedSection({ stories }: FeaturedSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [stories.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || stories.length === 0) return;
    const updateActiveCard = () => {
      const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-featured-card='true']"));
      if (cards.length === 0) return;
      const containerCenter = container.scrollLeft + container.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActiveIndex(closestIndex);
    };
    updateActiveCard();
    container.addEventListener("scroll", updateActiveCard, { passive: true });
    return () => container.removeEventListener("scroll", updateActiveCard);
  }, [stories]);

  if (stories.length === 0) return null;

  return (
    <section className="border-b border-[#f0e6d0]/50 py-6">
      <div className="section-container">
        <div className="mb-5 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-amber-500" />
          <h2 className="text-heading-md font-bold text-gray-900">Truyện nổi bật</h2>
        </div>

        {/* Mobile horizontal scroll */}
        <div className="-mx-4 md:hidden">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto px-4 pb-4 pt-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {stories.map((story, i) => (
              <div
                key={story.id}
                data-featured-card="true"
                className="w-[40vw] min-w-[40vw] max-w-[160px] snap-start"
              >
                <StoryCard story={story} index={i} />
              </div>
            ))}
          </div>
          {/* Dots indicator */}
          {stories.length > 1 && (
            <div className="mt-2 flex justify-center gap-1.5">
              {stories.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-6 bg-primary-500" : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop grid */}
        <div className="hidden grid-cols-2 gap-4 md:grid md:grid-cols-3 lg:grid-cols-5">
          {stories.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
