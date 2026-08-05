"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, authFetch } from "@/lib/api";

interface LevelProgressProps {
  authorId?: string;
  showStats?: boolean;
  showRequirements?: boolean;
  compact?: boolean;
  className?: string;
}

interface LevelInfo {
  currentLevel: {
    level: number;
    name: string;
    badgeColor: string;
    minViews: number;
    minStories: number;
    minEarnings: number;
  } | null;
  nextLevel: {
    level: number;
    name: string;
    badgeColor: string;
    minViews: number;
    minStories: number;
    minEarnings: number;
  } | null;
  stats: {
    totalViews: number;
    totalStories: number;
    totalEarnings: number;
  };
  progress: {
    percentage: number;
    viewsToNext: number;
    storiesToNext: number;
    earningsToNext: number;
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString("vi-VN");
}

export default function LevelProgress({
  authorId,
  showStats = true,
  showRequirements = true,
  compact = false,
  className = "",
}: LevelProgressProps) {
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevelInfo = async () => {
      if (!authorId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/author/${authorId}/level`);
        if (!res.ok) {
          throw new Error("Failed to fetch level info");
        }
        const data = await res.json();
        setLevelInfo(data);
      } catch (err) {
        console.error("Error fetching level info:", err);
        setError("Không thể tải thông tin cấp bậc");
      } finally {
        setLoading(false);
      }
    };

    fetchLevelInfo();
  }, [authorId]);

  if (loading) {
    return (
      <div className={`rounded-xl bg-white p-4 shadow-card ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-2 w-full rounded-full bg-gray-200" />
          <div className="flex justify-between">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="h-3 w-16 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !levelInfo) {
    return null;
  }

  const { currentLevel, nextLevel, stats, progress } = levelInfo;

  if (!currentLevel) {
    return null;
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-amber-500";
    return "bg-gray-400";
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `${currentLevel.badgeColor}20`,
            color: currentLevel.badgeColor,
          }}
        >
          <span>{getLevelIcon(currentLevel.level)}</span>
          <span>{currentLevel.name}</span>
        </div>
        {nextLevel && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor(progress.percentage)}`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span>{progress.percentage}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-white p-4 shadow-card ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
            style={{
              backgroundColor: `${currentLevel.badgeColor}20`,
              color: currentLevel.badgeColor,
            }}
          >
            {getLevelIcon(currentLevel.level)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cấp bậc hiện tại</p>
            <p
              className="text-lg font-bold"
              style={{ color: currentLevel.badgeColor }}
            >
              {currentLevel.name}
              <span className="ml-1 text-sm font-normal text-gray-400">
                (Lv.{currentLevel.level})
              </span>
            </p>
          </div>
        </div>

        {nextLevel && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Cấp tiếp theo</p>
            <p className="text-base font-semibold" style={{ color: nextLevel.badgeColor }}>
              {nextLevel.name}
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {nextLevel && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600">Tiến độ lên cấp</span>
            <span className="font-medium text-gray-900">{progress.percentage}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress.percentage)}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      {showStats && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-gray-50 p-2 text-center">
            <p className="text-lg font-bold text-gray-900">
              {formatNumber(stats.totalViews)}
            </p>
            <p className="text-xs text-gray-500">Lượt xem</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2 text-center">
            <p className="text-lg font-bold text-gray-900">{stats.totalStories}</p>
            <p className="text-xs text-gray-500">Truyện</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2 text-center">
            <p className="text-lg font-bold text-gray-900">
              {formatNumber(stats.totalEarnings)}
            </p>
            <p className="text-xs text-gray-500">Xu</p>
          </div>
        </div>
      )}

      {/* Requirements to Next Level */}
      {showRequirements && nextLevel && (
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Yêu cầu lên {nextLevel.name}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Lượt xem</span>
              <span className={progress.viewsToNext > 0 ? "text-amber-600" : "text-emerald-600"}>
                {formatNumber(stats.totalViews)} / {formatNumber(nextLevel.minViews)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Số truyện</span>
              <span className={progress.storiesToNext > 0 ? "text-amber-600" : "text-emerald-600"}>
                {stats.totalStories} / {nextLevel.minStories}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Thu nhập</span>
              <span className={progress.earningsToNext > 0 ? "text-amber-600" : "text-emerald-600"}>
                {formatNumber(stats.totalEarnings)} / {formatNumber(nextLevel.minEarnings)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Max Level Reached */}
      {!nextLevel && (
        <div className="rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 p-3 text-center">
          <p className="text-lg">🎉</p>
          <p className="font-semibold text-amber-700">Bạn đã đạt cấp bậc cao nhất!</p>
          <p className="mt-1 text-sm text-amber-600">Đại tác gia huyền thoại</p>
        </div>
      )}
    </div>
  );
}

function getLevelIcon(level: number): string {
  const icons: Record<number, string> = {
    1: "👶",
    2: "🎖️",
    3: "⭐",
    4: "🌟",
    5: "💫",
    6: "✨",
    7: "💎",
    8: "👑",
    9: "🏆",
    10: "🔱",
  };
  return icons[level] || "🎖️";
}
