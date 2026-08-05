"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, authFetch } from "@/lib/api";

interface AuthorBadgeProps {
  authorId?: string;
  showLevel?: boolean;
  showBadges?: boolean;
  showAvatarFrame?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface BadgeInfo {
  id: string;
  badgeType: string;
  earnedAt: string;
  expiresAt: string | null;
}

interface LevelInfo {
  currentLevel: {
    level: number;
    name: string;
    badgeColor: string;
    avatarFrame?: string | null;
  } | null;
  nextLevel: {
    level: number;
    name: string;
    badgeColor: string;
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

const BADGE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  top_author: { icon: "👑", label: "Tác giả hàng đầu", color: "#FFD700" },
  trending: { icon: "📈", label: "Xu hướng", color: "#FF6B6B" },
  verified: { icon: "✓", label: "Đã xác minh", color: "#4ECDC4" },
  rising_star: { icon: "⭐", label: "Sao đang lên", color: "#FFE66D" },
  prolific: { icon: "🔥", label: "Siêu năng suất", color: "#FF8C42" },
  legendary: { icon: "🏆", label: "Huyền thoại", color: "#9B59B6" },
  vip: { icon: "💎", label: "VIP", color: "#E91E63" },
  contest_winner: { icon: "🎖️", label: "Giải thưởng", color: "#3498DB" },
  community_hero: { icon: "🤝", label: "Anh hùng cộng đồng", color: "#2ECC71" },
};

function getBadgeStyle(badgeType: string) {
  return BADGE_CONFIG[badgeType] || { icon: "🏅", label: badgeType, color: "#666" };
}

export default function AuthorBadge({
  authorId,
  showLevel = true,
  showBadges = true,
  showAvatarFrame = false,
  size = "md",
  className = "",
}: AuthorBadgeProps) {
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const avatarSizes = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (showLevel && authorId) {
          const levelRes = await fetch(`${API_BASE_URL}/api/author/${authorId}/level`);
          if (levelRes.ok) {
            const levelData = await levelRes.json();
            setLevelInfo(levelData);
          }
        }

        if (showBadges && authorId) {
          const badgesRes = await fetch(`${API_BASE_URL}/api/author/${authorId}/badges`);
          if (badgesRes.ok) {
            const badgesData = await badgesRes.json();
            setBadges(badgesData.badges || []);
          }
        }
      } catch (error) {
        console.error("Error fetching author badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authorId, showLevel, showBadges]);

  if (loading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  const level = levelInfo?.currentLevel;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* Level Badge */}
      {showLevel && level && (
        <div
          className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClasses[size]}`}
          style={{
            backgroundColor: `${level.badgeColor}20`,
            color: level.badgeColor,
            border: `1px solid ${level.badgeColor}40`,
          }}
          title={`Cấp ${level.level}: ${level.name}`}
        >
          <span className="leading-none">{getLevelIcon(level.level)}</span>
          <span>{level.name}</span>
        </div>
      )}

      {/* Special Badges */}
      {showBadges && badges.length > 0 && (
        <div className="flex items-center gap-1">
          {badges.slice(0, 5).map((badge) => {
            const config = getBadgeStyle(badge.badgeType);
            return (
              <div
                key={badge.id}
                className={`inline-flex items-center gap-0.5 rounded-full bg-gray-100 ${sizeClasses[size]}`}
                style={{ color: config.color }}
                title={`${config.label} - Đạt được ${new Date(badge.earnedAt).toLocaleDateString("vi-VN")}`}
              >
                <span className="leading-none">{config.icon}</span>
                <span className="hidden sm:inline">{config.label}</span>
              </div>
            );
          })}
          {badges.length > 5 && (
            <div
              className={`inline-flex items-center rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600`}
              title={`Và ${badges.length - 5} badge khác`}
            >
              +{badges.length - 5}
            </div>
          )}
        </div>
      )}

      {/* Avatar Frame */}
      {showAvatarFrame && level?.avatarFrame && (
        <div className="relative">
          <img
            src={level.avatarFrame}
            alt="Avatar frame"
            className={`h-${avatarSizes[size] / 4} w-${avatarSizes[size] / 4}`}
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: avatarSizes[size] + 8,
              height: avatarSizes[size] + 8,
              pointerEvents: "none",
            }}
          />
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

// ─── Compact Badge for inline display ──────────────────────────────────────────
interface CompactBadgeProps {
  badgeType: string;
  size?: "sm" | "md";
}

export function CompactBadge({ badgeType, size = "sm" }: CompactBadgeProps) {
  const config = getBadgeStyle(badgeType);

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full bg-gray-100 font-medium ${
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
      }`}
      style={{ color: config.color }}
      title={config.label}
    >
      <span>{config.icon}</span>
    </span>
  );
}

// ─── Level-only display ─────────────────────────────────────────────────────────
interface LevelBadgeProps {
  level: number;
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ level, name, color, size = "md" }: LevelBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
      title={`Cấp ${level}: ${name}`}
    >
      <span className="leading-none">{getLevelIcon(level)}</span>
      <span>{name}</span>
    </div>
  );
}
