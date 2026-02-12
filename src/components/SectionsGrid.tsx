"use client";

import { motion } from "framer-motion";
import StoryCard from "./StoryCard";
import type { Story } from "@/types";

interface SectionsGridProps {
  title: string;
  stories: Story[];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SectionsGrid({ title, stories }: SectionsGridProps) {
  return (
    <section className="py-10 sm:py-14" aria-label={title}>
      <div className="section-container">
        <motion.h2
          className="mb-6 text-display-sm text-gray-900"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>

        <motion.div
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {stories.map((story) => (
            <motion.div key={story.id} variants={item}>
              <StoryCard story={story} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
