"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-5262734754559750";
// Use a display ad slot for the rewarded ad overlay
const REWARDED_AD_SLOT = "1869731119";

interface RewardedAdProps {
  /** Seconds the user must wait before they can close */
  cooldownSeconds: number;
  /** Called when the user successfully watches the full ad and closes */
  onComplete: () => void;
  /** Called when the user cancels before timer finishes (if allowed) */
  onCancel: () => void;
}

export default function RewardedAdModal({
  cooldownSeconds,
  onComplete,
  onCancel,
}: RewardedAdProps) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);
  const [canClose, setCanClose] = useState(false);
  const adPushed = useRef(false);

  // Push the ad
  useEffect(() => {
    if (adPushed.current) return;
    adPushed.current = true;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // ignore
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) {
      setCanClose(true);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleClose = useCallback(() => {
    if (canClose) {
      onComplete();
    }
  }, [canClose, onComplete]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80">
        <div className="flex items-center gap-2">
          <span className="text-body-sm font-medium text-gray-300">
            📢 Quảng cáo
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!canClose ? (
            <div className="flex items-center gap-2">
              <span className="text-caption text-gray-400">Đóng sau</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-body-sm font-bold text-white tabular-nums">
                {secondsLeft}
              </span>
            </div>
          ) : (
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-body-sm font-semibold text-white transition hover:bg-white/25"
            >
              <XMarkIcon className="h-4 w-4" />
              Đóng & nhận xu
            </button>
          )}
        </div>
      </div>

      {/* Countdown progress bar */}
      <div className="h-1 w-full bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-linear"
          style={{
            width: `${((cooldownSeconds - secondsLeft) / cooldownSeconds) * 100}%`,
          }}
        />
      </div>

      {/* Ad content area */}
      <div className="flex flex-1 items-center justify-center p-4 overflow-auto">
        <div className="w-full max-w-2xl">
          {/* Main AdSense ad */}
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: 250 }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={REWARDED_AD_SLOT}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />

          {/* Fallback content shown while ad loads */}
          <div className="mt-4 text-center">
            <p className="text-caption text-gray-500">
              {canClose
                ? "✅ Bạn đã xem xong quảng cáo. Nhấn nút đóng để nhận xu!"
                : `⏳ Vui lòng chờ ${secondsLeft} giây để nhận thưởng...`}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: cancel link (only before timer ends) */}
      {!canClose && (
        <div className="px-4 py-3 text-center">
          <button
            onClick={onCancel}
            className="text-caption text-gray-600 underline transition hover:text-gray-400"
          >
            Bỏ qua (không nhận xu)
          </button>
        </div>
      )}
    </div>
  );
}
