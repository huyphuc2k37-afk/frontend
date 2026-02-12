"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  HeartIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  FireIcon,
  SunIcon,
  BookOpenIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  CloudIcon,
  GlobeAltIcon,
  BoltIcon,
  BuildingOffice2Icon,
  RocketLaunchIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";
import type { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  HeartIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  FireIcon,
  SunIcon,
  BookOpenIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  CloudIcon,
  GlobeAltIcon,
  BoltIcon,
  BuildingOffice2Icon,
  RocketLaunchIcon,
  FaceSmileIcon,
};

interface CategoryChipsProps {
  categories: Category[];
  /** Active category name for filtering (null = all) */
  activeCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const chip = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function CategoryChips({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryChipsProps) {
  const isInteractive = !!onCategoryChange;

  return (
    <section className="py-10 sm:py-14" aria-label="Thể loại">
      <div className="section-container">
        <motion.h2
          className="mb-6 text-center text-display-sm text-gray-900"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Khám phá thể loại
        </motion.h2>

        {/* "All" chip when interactive */}
        {isInteractive && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={() => onCategoryChange(null)}
              className={`rounded-full px-5 py-2 text-body-sm font-semibold transition-all ${
                activeCategory === null
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-pressed={activeCategory === null}
            >
              Tất cả thể loại
            </button>
          </div>
        )}

        <motion.div
          className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon];
            const isActive = activeCategory === cat.name;
            const Wrapper = isInteractive ? 'button' as const : Link;
            const wrapperProps = isInteractive
              ? {
                  onClick: () =>
                    onCategoryChange(isActive ? null : cat.name),
                  'aria-pressed': isActive,
                }
              : { href: `/explore?category=${cat.slug}` };

            return (
              <motion.div key={cat.id} variants={chip}>
                <Wrapper
                  {...(wrapperProps as any)}
                  className={`card-hover group flex items-center gap-3 rounded-2xl border px-5 py-3 transition-all hover:border-transparent hover:shadow-lg ${
                    isActive
                      ? "border-primary-400 bg-primary-50 shadow-md"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  {Icon && (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: cat.color }}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-body-sm font-semibold text-gray-900">
                      {cat.name}
                    </div>
                    <div className="text-caption text-gray-400">
                      {cat.storyCount} truyện
                    </div>
                  </div>
                </Wrapper>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
