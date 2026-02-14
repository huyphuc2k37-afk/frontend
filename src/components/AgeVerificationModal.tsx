"use client";

import { useState, useEffect } from "react";
import { ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const STORAGE_KEY = "vstory-age-verified";

interface AgeVerificationModalProps {
  /** Whether the story is adult-only */
  isAdult: boolean;
  /** Optional: genre or tags that may also trigger the modal */
  genre?: string;
  tags?: string | null;
  /** Called when user confirms or declines */
  onConfirm: () => void;
  onDecline: () => void;
}

/** Genres / tags that require 18+ age verification */
const ADULT_KEYWORDS = [
  "18+",
  "16+",
  "bdsm",
  "trưởng thành",
  "tình cảm người lớn",
];

/** Check if a story requires age verification */
export function needsAgeVerification(
  isAdult: boolean,
  genre?: string,
  tags?: string | null,
): boolean {
  if (isAdult) return true;
  const allText = `${genre || ""} ${tags || ""}`.toLowerCase();
  return ADULT_KEYWORDS.some((kw) => allText.includes(kw));
}

/** Check if user has already verified age (sessionStorage) */
export function isAgeVerified(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

/** Store age verification in sessionStorage */
export function setAgeVerified(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, "true");
}

export default function AgeVerificationModal({
  isAdult,
  genre,
  tags,
  onConfirm,
  onDecline,
}: AgeVerificationModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (needsAgeVerification(isAdult, genre, tags) && !isAgeVerified()) {
      setVisible(true);
    }
  }, [isAdult, genre, tags]);

  if (!visible) return null;

  const handleConfirm = () => {
    setAgeVerified();
    setVisible(false);
    onConfirm();
  };

  const handleDecline = () => {
    setVisible(false);
    onDecline();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          Xác nhận độ tuổi
        </h2>

        {/* Description */}
        <p className="mb-6 text-center text-sm leading-relaxed text-gray-600">
          Truyện này chứa nội dung dành cho người từ{" "}
          <span className="font-semibold text-red-600">18 tuổi trở lên</span>.
          Có thể bao gồm các yếu tố bạo lực, kinh dị, tình dục hoặc nội dung
          nhạy cảm khác.
        </p>

        {/* Warning box */}
        <div className="mb-6 rounded-xl bg-red-50 p-4">
          <p className="text-center text-sm font-medium text-red-700">
            Bạn xác nhận rằng bạn đã đủ 18 tuổi và tự chịu trách nhiệm khi đọc
            nội dung này?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Quay lại
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            <span className="flex items-center justify-center gap-2">
              <ShieldCheckIcon className="h-4 w-4" />
              Tôi đủ 18 tuổi
            </span>
          </button>
        </div>

        {/* Footnote */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Xác nhận độ tuổi sẽ được lưu trong phiên truy cập hiện tại.
        </p>
      </div>
    </div>
  );
}
