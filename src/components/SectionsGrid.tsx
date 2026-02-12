"use client";

import StoryCard from "./StoryCard";
import type { Story } from "@/types";

interface SectionsGridProps {
  title: string;
  stories: Story[];
}

export default function SectionsGrid({ title, stories }: SectionsGridProps) {
  return (
    <section className="py-10 sm:py-14" aria-label={title}>
      <div className="section-container">
        <h2 className="mb-6 text-display-sm text-gray-900">{title}</h2>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stories.map((story) => (
            <div key={story.id}>
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
