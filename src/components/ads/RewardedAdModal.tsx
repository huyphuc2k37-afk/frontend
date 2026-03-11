"use client";

import { useState, useEffect, useCallback } from "react";
import { XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

const SMARTLINK_URL =
  "https://www.effectivegatecpm.com/k8gij0ja?key=3269e3cb85ab313577ba4920065048fe";

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
  const [linkOpened, setLinkOpened] = useState(false);

  // Open smartlink in new tab on mount
  useEffect(() => {
    const w = window.open(SMARTLINK_URL, "_blank", "noopener,noreferrer");
    if (w) {
      setLinkOpened(true);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-body-sm font-semibold text-gray-800">
            📢 Xem quảng cáo nhận xu
          </span>
          {canClose && (
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-linear"
              style={{
                width: `${((cooldownSeconds - secondsLeft) / cooldownSeconds) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-5">
          {canClose ? (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-body-md font-semibold text-gray-900">
                Hoàn thành!
              </p>
              <p className="mt-1 text-caption text-gray-500">
                Nhấn nút bên dưới để nhận xu thưởng
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <span className="text-2xl font-bold text-amber-600 tabular-nums">
                  {secondsLeft}
                </span>
              </div>
              <p className="text-body-sm text-gray-600">
                Vui lòng chờ <span className="font-semibold">{secondsLeft}s</span> để nhận thưởng
              </p>
              {!linkOpened && (
                <a
                  href={SMARTLINK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-caption font-medium text-primary-600 hover:underline"
                >
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  Mở quảng cáo
                </a>
              )}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {canClose ? (
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-body-sm font-bold text-white shadow-lg transition hover:from-amber-600 hover:to-orange-600"
            >
              🪙 Nhận xu thưởng
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-body-sm font-medium text-gray-500 transition hover:bg-gray-50"
            >
              Hủy bỏ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
