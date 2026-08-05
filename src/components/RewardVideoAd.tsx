"use client";

import { useState, useCallback } from "react";
import { useAds, useRewardAdCooldown, RewardAdStatus, RewardClaimResult } from "@/hooks/useAds";

interface RewardVideoAdProps {
  token?: string;
  storyId?: string;
  chapterId?: string;
  /** Called when reward is claimed successfully */
  onRewardClaimed?: (coins: number, newBalance: number) => void;
  /** Called when user clicks but can't watch (not logged in, cooldown, etc.) */
  onCannotWatch?: (reason: string) => void;
  /** Custom button text */
  buttonText?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show remaining count */
  showRemaining?: boolean;
  /** Custom className */
  className?: string;
}

const SIZE_CLASSES = {
  sm: {
    button: "px-3 py-1.5 text-xs",
    icon: "h-4 w-4",
    coin: "text-xs",
  },
  md: {
    button: "px-4 py-2 text-sm",
    icon: "h-5 w-5",
    coin: "text-sm",
  },
  lg: {
    button: "px-6 py-3 text-base",
    icon: "h-6 w-6",
    coin: "text-base",
  },
};

export default function RewardVideoAd({
  token,
  storyId,
  chapterId,
  onRewardClaimed,
  onCannotWatch,
  buttonText = "Xem quảng cáo nhận xu",
  size = "md",
  showRemaining = true,
  className = "",
}: RewardVideoAdProps) {
  const { rewardStatus, claimingReward, lastClaimResult, claimReward, fetchRewardStatus } = useAds(token, storyId, chapterId);
  const { cooldownSeconds, formattedCooldown, isOnCooldown } = useRewardAdCooldown(rewardStatus);
  const [showVideo, setShowVideo] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const sizeClasses = SIZE_CLASSES[size];

  // Handle video completion
  const handleVideoComplete = useCallback(async () => {
    setVideoWatched(true);
    setShowVideo(false);

    // Claim the reward
    const result: RewardClaimResult = await claimReward();

    if (result.success) {
      onRewardClaimed?.(result.coins || 0, result.newBalance || 0);
    } else {
      onCannotWatch?.(result.error || "Không thể nhận thưởng");
    }
  }, [claimReward, onRewardClaimed, onCannotWatch]);

  // Handle button click
  const handleClick = useCallback(() => {
    // Check if user is logged in
    if (!token) {
      onCannotWatch?.("Vui lòng đăng nhập để xem quảng cáo nhận xu");
      return;
    }

    // Check cooldown
    if (isOnCooldown || rewardStatus?.reason === "cooldown") {
      onCannotWatch?.(`Vui lòng chờ ${formattedCooldown || `${cooldownSeconds}s`} trước khi xem thêm`);
      return;
    }

    // Check daily limit
    if (rewardStatus?.reason === "daily_limit" || (rewardStatus?.dailyRemaining ?? 10) <= 0) {
      onCannotWatch?.("Bạn đã đạt giới hạn xem quảng cáo hôm nay. Hãy quay lại vào ngày mai!");
      return;
    }

    // Start watching video
    setShowVideo(true);
    setVideoWatched(false);
    setVideoProgress(0);
  }, [token, isOnCooldown, rewardStatus, formattedCooldown, cooldownSeconds, onCannotWatch]);

  // Simulate video progress
  const simulateVideo = useCallback(() => {
    const duration = 15; // 15 seconds video
    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        const newProgress = prev + (100 / duration);
        if (newProgress >= 100) {
          clearInterval(interval);
          handleVideoComplete();
          return 100;
        }
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleVideoComplete]);

  // Start video simulation when video modal opens
  const handleVideoStart = useCallback(() => {
    simulateVideo();
  }, [simulateVideo]);

  // Handle skip video
  const handleSkipVideo = useCallback(() => {
    // User can skip but won't get reward
    setShowVideo(false);
    setVideoWatched(false);
    setVideoProgress(0);
    // Refresh reward status
    fetchRewardStatus();
  }, [fetchRewardStatus]);

  // Determine button state
  const getButtonState = () => {
    if (!token) {
      return { disabled: true, text: "Đăng nhập để nhận thưởng", variant: "secondary" };
    }
    if (isOnCooldown) {
      return { disabled: true, text: `Chờ ${formattedCooldown}`, variant: "cooldown" };
    }
    if (rewardStatus?.reason === "daily_limit" || (rewardStatus?.dailyRemaining ?? 10) <= 0) {
      return { disabled: true, text: "Hết lượt hôm nay", variant: "disabled" };
    }
    if (claimingReward) {
      return { disabled: true, text: "Đang xử lý...", variant: "loading" };
    }
    return { disabled: false, text: buttonText, variant: "primary" };
  };

  const buttonState = getButtonState();

  // Render button
  const renderButton = () => {
    const baseClasses = `inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 ${sizeClasses.button} ${className}`;

    switch (buttonState.variant) {
      case "primary":
        return (
          <button
            onClick={handleClick}
            className={`${baseClasses} bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-600 hover:to-orange-600 hover:shadow-xl active:scale-95`}
          >
            <svg className={sizeClasses.icon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            <span>{buttonState.text}</span>
            <span className={`${sizeClasses.coin} flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5`}>
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
              </svg>
              +5
            </span>
          </button>
        );

      case "cooldown":
        return (
          <button
            disabled
            className={`${baseClasses} cursor-not-allowed bg-gray-200 text-gray-500`}
          >
            <svg className={`${sizeClasses.icon} animate-spin`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{buttonState.text}</span>
          </button>
        );

      case "disabled":
        return (
          <button
            disabled
            className={`${baseClasses} cursor-not-allowed bg-gray-100 text-gray-400`}
          >
            <svg className={sizeClasses.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{buttonState.text}</span>
          </button>
        );

      case "loading":
        return (
          <button
            disabled
            className={`${baseClasses} cursor-wait bg-amber-300 text-white`}
          >
            <svg className={`${sizeClasses.icon} animate-spin`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{buttonState.text}</span>
          </button>
        );

      case "secondary":
        return (
          <button
            onClick={handleClick}
            className={`${baseClasses} bg-primary-500 text-white hover:bg-primary-600 active:scale-95`}
          >
            <svg className={sizeClasses.icon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{buttonState.text}</span>
          </button>
        );

      default:
        return null;
    }
  };

  // Render remaining count
  const renderRemainingCount = () => {
    if (!showRemaining || !rewardStatus) return null;

    const remaining = rewardStatus.dailyRemaining ?? rewardStatus.dailyLimit;
    return (
      <span className="mt-1 text-xs text-gray-500">
        Còn lại: <span className="font-medium">{remaining}</span> / {rewardStatus.dailyLimit} lượt hôm nay
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {renderButton()}
      {renderRemainingCount()}

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Xem quảng cáo nhận thưởng</h3>
              <button
                onClick={handleSkipVideo}
                className="rounded-lg px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                Bỏ qua
              </button>
            </div>

            {/* Video placeholder */}
            <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-gray-900">
              {/* Simulated video content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <svg className="mb-4 h-16 w-16 animate-pulse text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                <p className="text-lg font-medium">Đang phát quảng cáo...</p>
                <p className="mt-2 text-sm text-gray-400">
                  Vui lòng xem hết video để nhận thưởng
                </p>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700">
                <div
                  className="h-full bg-primary-500 transition-all duration-1000"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{Math.ceil((100 - videoProgress) / (100 / 15))}s còn lại</span>
            </div>

            {/* Skip disabled message */}
            <p className="mt-3 text-center text-xs text-gray-400">
              Bỏ qua video = không nhận được thưởng
            </p>

            {/* Auto-complete button for testing */}
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={handleVideoComplete}
                className="mt-4 w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-white hover:bg-primary-600"
              >
                [DEV] Complete Video
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success toast */}
      {lastClaimResult?.success && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>+{lastClaimResult.coins} xu!</span>
        </div>
      )}

      {/* Error toast */}
      {lastClaimResult && !lastClaimResult.success && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{lastClaimResult.error}</span>
        </div>
      )}
    </div>
  );
}

// ─── Standalone Reward Button ─────────────────────────────────────────
interface RewardButtonProps {
  token?: string;
  onRewardClaimed?: (coins: number, newBalance: number) => void;
  size?: "sm" | "md" | "lg";
}

export function RewardButton({ token, onRewardClaimed, size = "md" }: RewardButtonProps) {
  const { rewardStatus, claimingReward, claimReward } = useAds(token);

  const handleClick = async () => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const result = await claimReward();
    if (result.success) {
      onRewardClaimed?.(result.coins || 0, result.newBalance || 0);
    }
  };

  const isDisabled = !token || claimingReward || (rewardStatus?.dailyRemaining ?? 10) <= 0;

  const sizeClasses = SIZE_CLASSES[size];

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all ${sizeClasses.button} ${
        isDisabled
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-600 hover:to-orange-600 hover:shadow-xl active:scale-95"
      }`}
    >
      <svg className={sizeClasses.icon} fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
      </svg>
      Nhận xu
    </button>
  );
}
