"use client";

/**
 * FeaturedCardShell — premium "VIP slot" wrapper for featured stories.
 *
 * Visual:
 *   - Gold gradient border matching the LED billboard at the top of the page
 *   - Border-radius tracks the underlying StoryCard's cover (rounded-xl)
 *   - Animated shine: a soft golden glow travels clockwise around the border
 *   - Corner badge "VIP" with "100K/tháng" price to communicate the slot
 *     is a paid promotion, not organic ranking
 *
 * The inner StoryCard is rendered unchanged — this shell is purely cosmetic.
 */

import { ReactNode } from "react";
import { StarIcon } from "@heroicons/react/24/solid";

interface FeaturedCardShellProps {
  children: ReactNode;
  /** Slot position (1..N) shown in the corner badge. */
  slot?: number;
}

export default function FeaturedCardShell({ children, slot }: FeaturedCardShellProps) {
  return (
    <div className="featured-slot group relative">
      {/* Outer gold frame */}
      <div className="featured-slot-frame relative rounded-xl">
        {/* Animated travelling shine (background-clip: border-box) */}
        <span className="featured-slot-shine absolute inset-0 rounded-xl" aria-hidden />

        {/* Inner padding houses the original card so the gold border shows */}
        <div className="featured-slot-inner relative rounded-[10px] bg-[#fdf9f0] p-[2px]">
          <div className="overflow-hidden rounded-[9px]">{children}</div>
        </div>

        {/* VIP badge — top-right corner */}
        <div className="featured-slot-badge pointer-events-none absolute -right-1 -top-1 z-10 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-950 shadow-[0_2px_8px_rgba(251,191,36,0.55)] ring-1 ring-amber-200 sm:px-2 sm:text-[10px]">
          <StarIcon className="h-2.5 w-2.5 text-amber-900 sm:h-3 sm:w-3" />
          <span className="hidden sm:inline">VIP&nbsp;</span>
          {slot ? `#${slot}` : "HOT"}
          <span className="hidden text-amber-900/80 sm:inline">&nbsp;• 100K</span>
        </div>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        /* The frame is the same rounded-xl as the cover for a flush fit */
        .featured-slot-frame {
          background:
            linear-gradient(
              135deg,
              #fde68a 0%,
              #d4a64a 25%,
              #b8852a 50%,
              #d4a64a 75%,
              #fde68a 100%
            );
          background-size: 300% 300%;
          padding: 2px;
          box-shadow:
            0 6px 18px -6px rgba(184, 133, 42, 0.45),
            0 0 0 1px rgba(184, 133, 42, 0.18);
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .featured-slot-frame:hover {
          transform: translateY(-2px);
          box-shadow:
            0 12px 24px -8px rgba(184, 133, 42, 0.55),
            0 0 0 1px rgba(184, 133, 42, 0.25);
        }

        /* Travelling shine: a soft bright blob orbits the rounded rectangle.
           Implemented as a long thin gradient strip rotated via conic + transform
           so it appears to sweep the whole perimeter. */
        .featured-slot-shine {
          pointer-events: none;
          background:
            conic-gradient(
              from 0deg,
              transparent 0%,
              transparent 55%,
              rgba(255, 245, 200, 0.0) 60%,
              rgba(255, 247, 200, 0.95) 67%,
              rgba(255, 220, 130, 0.55) 72%,
              transparent 80%,
              transparent 100%
            );
          /* Mask to a ring (border-only) — show the shine only on the border,
             not the interior */
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          padding: 2px;
          animation: featured-shine-orbit 4.5s linear infinite;
        }

        /* Inner wrapper sits inside the frame and clips the cover */
        .featured-slot-inner {
          box-shadow:
            inset 0 0 0 1px rgba(184, 133, 42, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        @keyframes featured-shine-orbit {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Badge: subtle wobble + glow pulse */
        .featured-slot-badge {
          animation: featured-badge-pulse 2.4s ease-in-out infinite;
        }
        @keyframes featured-badge-pulse {
          0%, 100% {
            box-shadow:
              0 2px 8px rgba(251, 191, 36, 0.55),
              0 0 0 0 rgba(251, 191, 36, 0.45);
          }
          50% {
            box-shadow:
              0 2px 12px rgba(251, 191, 36, 0.75),
              0 0 0 4px rgba(251, 191, 36, 0);
          }
        }

        /* Respect reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .featured-slot-shine,
          .featured-slot-badge {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
