"use client";

/**
 * AdBanner — "Biển quảng cáo LED truyền thống"
 *
 * Phong cách: mô phỏng biển LED neon ngoài đời thực — khung viền vàng đồng,
 * nền tối, chữ LED phát sáng có hiệu ứng glow + chạy marquee, hai bóng
 * bulb trang trí, fade-out xuống dưới để liền mạch với trang.
 *
 * Nội dung: cho thuê banner quảng bá — website, MXH, dịch vụ.
 *
 * Full-width (vượt khỏi section-container), responsive:
 *   - Desktop: h ~120 px, chia 3 khối (brand+CTA | marquee | contact+price)
 *   - Mobile:  h ~150 px, xếp dọc gọn
 */

import { MegaphoneIcon, PhoneIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function AdBanner() {
  return (
    <div
      className="adboard-wrap relative w-full"
      aria-label="Quảng cáo — Cho thuê banner quảng bá website, MXH, dịch vụ"
    >
      <div className="adboard relative mx-auto flex w-full items-center justify-center px-3 py-3 sm:px-5 sm:py-4">
        <div className="adboard-frame relative w-full overflow-hidden rounded-md">
          {/* ─── Decorative light bulbs flanking the board ─── */}
          <span className="adboard-bulb adboard-bulb--left" aria-hidden />
          <span className="adboard-bulb adboard-bulb--right" aria-hidden />

          {/* Inner dark panel (the actual "billboard face") */}
          <div className="adboard-face relative overflow-hidden">
            {/* Moving scanline sheen */}
            <div className="adboard-sheen absolute inset-0" aria-hidden />

            {/* Tiny dot grid (LED matrix feel) */}
            <div className="adboard-dotgrid absolute inset-0 opacity-[0.18]" aria-hidden />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_55%,_rgba(0,0,0,0.55)_100%)]" aria-hidden />

            {/* Content grid — 3 columns desktop / stacked mobile */}
            <div className="adboard-grid relative grid w-full grid-cols-1 items-center gap-2 px-3 py-2.5 sm:grid-cols-[auto_1fr_auto] sm:gap-3 sm:px-6 sm:py-3 md:px-8">
              {/* ── Left: brand + tag ── */}
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <div className="adboard-icon flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 shadow-[0_0_18px_rgba(251,191,36,0.55)] ring-2 ring-amber-300/60 sm:h-10 sm:w-10">
                  <MegaphoneIcon className="h-4 w-4 text-white drop-shadow sm:h-5 sm:w-5" />
                </div>
                <div className="leading-tight">
                  <p className="adboard-text-amber font-mono text-[12px] font-extrabold tracking-[0.18em] sm:text-[13px]">
                    THUÊ&nbsp;BANNER
                  </p>
                  <p className="hidden font-mono text-[9px] tracking-[0.25em] text-amber-200/70 sm:block">
                    QUẢNG&nbsp;BÁ&nbsp;•&nbsp;MXH&nbsp;•&nbsp;DV
                  </p>
                </div>
              </div>

              {/* ── Center: scrolling marquee LED ── */}
              <div className="adboard-marquee relative h-7 overflow-hidden sm:h-8">
                <div className="adboard-marquee-track flex items-center gap-8 whitespace-nowrap">
                  <span className="adboard-text-rose">★ QUẢNG BÁ WEBSITE</span>
                  <span className="adboard-text-cyan">★ TIKTOK / FACEBOOK / YOUTUBE</span>
                  <span className="adboard-text-amber">★ DỊCH VỤ &amp; THƯƠNG HIỆU</span>
                  <span className="adboard-text-green">★ SHOP BÁN HÀNG ONLINE</span>
                  <span className="adboard-text-rose">★ QUẢNG BÁ WEBSITE</span>
                  <span className="adboard-text-cyan">★ TIKTOK / FACEBOOK / YOUTUBE</span>
                  <span className="adboard-text-amber">★ DỊCH VỤ &amp; THƯƠNG HIỆU</span>
                  <span className="adboard-text-green">★ SHOP BÁN HÀNG ONLINE</span>
                </div>
              </div>

              {/* ── Right: contact + price ── */}
              <div className="flex items-center justify-center gap-2 sm:justify-end">
                <div className="hidden flex-col items-end leading-tight sm:flex">
                  <span className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider text-amber-200">
                    <PhoneIcon className="h-3 w-3 text-amber-300" />
                    <span className="adboard-text-amber">0584.375.253</span>
                  </span>
                  <span className="font-mono text-[9px] tracking-wider text-amber-100/60">Liên hệ tư vấn</span>
                </div>
                <div className="adboard-price relative flex items-center gap-1 rounded-md border border-amber-300/70 bg-gradient-to-b from-amber-300 to-amber-500 px-2 py-1 shadow-[0_0_18px_rgba(251,191,36,0.55),inset_0_1px_0_rgba(255,255,255,0.45)] sm:px-2.5">
                  <SparklesIcon className="h-3 w-3 text-amber-900" />
                  <span className="font-mono text-[12px] font-black leading-none text-amber-950 sm:text-[13px]">500K</span>
                  <span className="font-mono text-[8px] font-bold leading-none text-amber-900/80">/THÁNG</span>
                </div>
              </div>
            </div>

            {/* AdSense disclosure */}
            <span className="absolute right-2 top-1.5 z-10 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
              Quảng cáo
            </span>
          </div>
        </div>
      </div>

      {/* ─── Scoped styles ─── */}
      <style jsx>{`
        /* Outer wrapper — pure transparent; the board sits on the page background.
           No top/bottom fade layers needed: the gold frame + dark inner face
           create their own clear silhouette on any page tone, and the page's
           own background shows through the 3px gold padding seamlessly. */
        .adboard-wrap {
          background: transparent;
        }

        /* The brass/gold outer frame */
        .adboard-frame {
          background: linear-gradient(180deg, #d4a64a 0%, #b8852a 45%, #8a5f17 100%);
          padding: 3px;
          box-shadow:
            0 10px 30px -10px rgba(0, 0, 0, 0.45),
            0 0 0 1px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 235, 180, 0.6),
            inset 0 -1px 0 rgba(0, 0, 0, 0.35);
          border-radius: 8px;
        }

        /* Decorative bulbs left & right */
        .adboard-bulb {
          position: absolute;
          top: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transform: translateY(-50%);
          background: radial-gradient(circle at 35% 35%, #fff7c2 0%, #ffd76a 40%, #b8860b 100%);
          box-shadow:
            0 0 8px 2px rgba(255, 215, 106, 0.9),
            0 0 16px 4px rgba(255, 200, 80, 0.45);
          z-index: 5;
          animation: bulb-flicker 1.6s ease-in-out infinite;
        }
        .adboard-bulb--left  { left: -3px; }
        .adboard-bulb--right { right: -3px; animation-delay: 0.8s; }
        @keyframes bulb-flicker {
          0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
          50%      { opacity: 0.78; transform: translateY(-50%) scale(0.92); }
        }

        /* Inner dark face */
        .adboard-face {
          background:
            radial-gradient(ellipse at 50% 0%, rgba(60, 30, 90, 0.55) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 100%, rgba(20, 50, 90, 0.45) 0%, transparent 60%),
            linear-gradient(180deg, #0e0e16 0%, #14141c 50%, #0a0a12 100%);
          border-radius: 5px;
        }

        /* LED matrix dot grid */
        .adboard-dotgrid {
          background-image:
            radial-gradient(rgba(255, 215, 130, 0.55) 1px, transparent 1px);
          background-size: 8px 8px;
          mix-blend-mode: screen;
        }

        /* Moving sheen highlight (passes diagonally every 6s) */
        .adboard-sheen {
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 40%,
            rgba(255, 235, 180, 0.10) 50%,
            transparent 60%,
            transparent 100%
          );
          background-size: 250% 250%;
          animation: sheen-sweep 6s linear infinite;
        }
        @keyframes sheen-sweep {
          0%   { background-position: 200% 50%; }
          100% { background-position: -100% 50%; }
        }

        /* Grid layout sizing */
        .adboard-grid {
          min-height: 88px;
        }
        @media (min-width: 640px) {
          .adboard-grid { min-height: 100px; }
        }

        /* ── Marquee scrolling ── */
        .adboard-marquee-track {
          animation: marquee 28s linear infinite;
          will-change: transform;
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* The track contains 2 copies so we translate -50% seamlessly */

        /* ── LED neon text variants ── */
        .adboard-text-amber,
        .adboard-text-rose,
        .adboard-text-cyan,
        .adboard-text-green {
          font-family: ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.06em;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: none;
        }
        @media (min-width: 640px) {
          .adboard-text-amber,
          .adboard-text-rose,
          .adboard-text-cyan,
          .adboard-text-green {
            font-size: 15px;
          }
        }

        .adboard-text-amber {
          background-image: linear-gradient(180deg, #fff5c2 0%, #ffc94a 60%, #b8740a 100%);
          filter: drop-shadow(0 0 6px rgba(255, 196, 70, 0.85))
                  drop-shadow(0 0 14px rgba(255, 150, 40, 0.55));
          animation: led-flicker-amber 2.4s ease-in-out infinite;
        }
        .adboard-text-rose {
          background-image: linear-gradient(180deg, #ffe2e9 0%, #ff5577 60%, #b00020 100%);
          filter: drop-shadow(0 0 6px rgba(255, 90, 130, 0.85))
                  drop-shadow(0 0 14px rgba(255, 40, 80, 0.5));
          animation: led-flicker-rose 3.1s ease-in-out infinite;
        }
        .adboard-text-cyan {
          background-image: linear-gradient(180deg, #e0fbff 0%, #4ee0ff 60%, #0a90b0 100%);
          filter: drop-shadow(0 0 6px rgba(80, 220, 255, 0.85))
                  drop-shadow(0 0 14px rgba(40, 180, 220, 0.5));
          animation: led-flicker-cyan 2.7s ease-in-out infinite;
        }
        .adboard-text-green {
          background-image: linear-gradient(180deg, #e2ffd9 0%, #66ff7a 60%, #138a1a 100%);
          filter: drop-shadow(0 0 6px rgba(120, 255, 140, 0.85))
                  drop-shadow(0 0 14px rgba(40, 200, 80, 0.5));
          animation: led-flicker-green 3.4s ease-in-out infinite;
        }

        @keyframes led-flicker-amber {
          0%, 100% { opacity: 1;   filter: drop-shadow(0 0 6px rgba(255, 196, 70, 0.85)) drop-shadow(0 0 14px rgba(255, 150, 40, 0.55)); }
          50%      { opacity: 0.92; }
        }
        @keyframes led-flicker-rose {
          0%, 100% { opacity: 1; }
          45%      { opacity: 0.85; }
        }
        @keyframes led-flicker-cyan {
          0%, 100% { opacity: 1; }
          40%      { opacity: 0.88; }
        }
        @keyframes led-flicker-green {
          0%, 100% { opacity: 1; }
          55%      { opacity: 0.9; }
        }

        /* Price tag subtle pulse */
        .adboard-price {
          animation: price-pulse 2.2s ease-in-out infinite;
        }
        @keyframes price-pulse {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 18px rgba(251, 191, 36, 0.55), inset 0 1px 0 rgba(255,255,255,0.45); }
          50%      { transform: scale(1.05); box-shadow: 0 0 26px rgba(251, 191, 36, 0.85), inset 0 1px 0 rgba(255,255,255,0.55); }
        }

        /* Respect reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .adboard-marquee-track,
          .adboard-sheen,
          .adboard-bulb,
          .adboard-price,
          .adboard-text-amber,
          .adboard-text-rose,
          .adboard-text-cyan,
          .adboard-text-green {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
