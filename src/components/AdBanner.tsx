"use client";

/**
 * Self-rendered responsive ad banner — no external image asset needed.
 *
 * Layout follows Google AdSense banner standards:
 *   - Desktop (>=768px): 728 × 90 — IAB "Leaderboard"
 *   - Mobile  (<768px):  320 × 100 — IAB "Mobile Banner"
 *
 * Renders 5 sections as a single cohesive card:
 *   1. Brand mark + primary CTA
 *   2. Service highlights (4 chips)
 *   3. Section title
 *   4. Contact strip (Fanpage + Zalo)
 *   5. Pricing
 *
 * Has subtle animations: gradient drift, shimmer on the CTA, slow pulse on
 * the price badge. All animations respect prefers-reduced-motion.
 */

import { MegaphoneIcon, BoltIcon, EyeIcon, GiftIcon, ChatBubbleLeftRightIcon, PhoneIcon } from "@heroicons/react/24/outline";

export default function AdBanner() {
  return (
    <div className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
      {/* ─── Desktop: 728×90 (md+) ─────────────────────────────────── */}
      <div
        className="banner-shell banner-shell--desktop relative mx-auto hidden h-[90px] w-full max-w-[728px] flex-row items-stretch overflow-hidden rounded-xl shadow-sm md:flex"
        role="complementary"
        aria-label="Quảng cáo — Đặt banner đầu trang"
      >
        <BannerBody compact stacked={false} />
      </div>

      {/* ─── Mobile: 320×100 ───────────────────────────────────────── */}
      <div
        className="banner-shell banner-shell--mobile relative mx-auto flex h-[100px] w-full max-w-[320px] flex-col overflow-hidden rounded-xl shadow-sm md:hidden"
        role="complementary"
        aria-label="Quảng cáo — Đặt banner đầu trang"
      >
        <BannerBody compact={false} stacked />
      </div>
    </div>
  );
}

function BannerBody({ compact, stacked }: { compact: boolean; stacked: boolean }) {
  return (
    <>
      {/* Animated gradient backdrop */}
      <div className="banner-gradient absolute inset-0" aria-hidden />

      {/* Decorative shapes */}
      <div className="banner-shape banner-shape--a" aria-hidden />
      <div className="banner-shape banner-shape--b" aria-hidden />

      {/* AdSense-required disclosure */}
      <span className="absolute right-1.5 top-1 z-10 rounded bg-black/35 px-1.5 py-px text-[9px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
        Quảng cáo
      </span>

      {/* Content row — direction switches based on compact/stacked */}
      <div className={`relative z-[1] flex w-full ${stacked ? "flex-col" : "flex-row"}`}>
        {/* ── Brand + primary CTA ── */}
        <div
          className={`flex items-center gap-2 ${
            stacked ? "px-3 pt-2.5 pb-1" : "pl-3 pr-2"
          }`}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <MegaphoneIcon className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="banner-brand truncate text-[13px] font-extrabold leading-tight tracking-wide text-white">
              STORY<span className="text-amber-300">.VN</span>
            </p>
            <p className="banner-cta-shimmer truncate text-[10px] font-semibold leading-tight">
              Quảng cáo ngay – Hiệu quả tức thì!
            </p>
          </div>
        </div>

        {/* ── Service highlights ── */}
        {!stacked && (
          <div className="flex flex-1 items-center justify-center gap-1.5 px-1">
            <ServiceChip icon={<EyeIcon className="h-3 w-3" />} label="Tiếp cận" />
            <ServiceChip icon={<BoltIcon className="h-3 w-3" />} label="Hiệu quả" />
            <ServiceChip icon={<GiftIcon className="h-3 w-3" />} label="Ưu đãi" />
            <ServiceChip icon={<ChatBubbleLeftRightIcon className="h-3 w-3" />} label="Hỗ trợ" />
          </div>
        )}

        {/* ── Right block: contact + price (desktop) ── */}
        {!stacked && (
          <div className="flex items-center gap-2.5 pr-3">
            <div className="flex flex-col items-end leading-tight">
              <span className="flex items-center gap-1 text-[10px] font-medium text-white/90">
                <PhoneIcon className="h-3 w-3" /> 0584.375.253
              </span>
              <span className="text-[9px] text-white/65">Fanpage VStory</span>
            </div>
            <div className="banner-price-pulse flex flex-col items-center justify-center rounded-lg bg-amber-400 px-2 py-1 shadow-md ring-1 ring-amber-300">
              <span className="text-[12px] font-extrabold leading-none text-amber-950">500K</span>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-amber-900">/tháng</span>
            </div>
          </div>
        )}

        {/* ── Stacked mobile bottom row ── */}
        {stacked && (
          <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-1">
            <div className="flex items-center gap-1 overflow-hidden">
              <ServiceChip icon={<EyeIcon className="h-3 w-3" />} label="Tiếp cận" small />
              <ServiceChip icon={<BoltIcon className="h-3 w-3" />} label="Hiệu quả" small />
              <ServiceChip icon={<GiftIcon className="h-3 w-3" />} label="Ưu đãi" small />
            </div>
            <div className="banner-price-pulse flex items-center gap-1 rounded-md bg-amber-400 px-1.5 py-0.5 shadow-sm ring-1 ring-amber-300">
              <span className="text-[11px] font-extrabold leading-none text-amber-950">500K</span>
              <span className="text-[8px] font-semibold uppercase text-amber-900">/tháng</span>
            </div>
          </div>
        )}
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        .banner-gradient {
          background: linear-gradient(
            115deg,
            #6d28d9 0%,
            #7c3aed 28%,
            #db2777 65%,
            #f59e0b 100%
          );
          background-size: 220% 220%;
          animation: banner-gradient-drift 18s ease-in-out infinite;
        }
        @keyframes banner-gradient-drift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .banner-shape {
          position: absolute;
          border-radius: 9999px;
          filter: blur(28px);
          opacity: 0.35;
          pointer-events: none;
        }
        .banner-shape--a {
          top: -40px;
          right: -20px;
          width: 110px;
          height: 110px;
          background: #fde047;
        }
        .banner-shape--b {
          bottom: -30px;
          left: 30%;
          width: 80px;
          height: 80px;
          background: #67e8f9;
        }

        .banner-cta-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.85) 0%,
            #fde68a 50%,
            rgba(255, 255, 255, 0.85) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: banner-shimmer 3.5s linear infinite;
        }
        @keyframes banner-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .banner-price-pulse {
          animation: banner-pulse 2.4s ease-in-out infinite;
        }
        @keyframes banner-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.6); }
          50% { transform: scale(1.06); box-shadow: 0 0 0 6px rgba(251, 191, 36, 0); }
        }

        /* Accessibility — respect user preference */
        @media (prefers-reduced-motion: reduce) {
          .banner-gradient,
          .banner-cta-shimmer,
          .banner-price-pulse {
            animation: none !important;
          }
          .banner-gradient {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
}

function ServiceChip({
  icon,
  label,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  small?: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-0.5 rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm ${
        small ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
      } font-medium`}
    >
      {icon}
      {label}
    </span>
  );
}
