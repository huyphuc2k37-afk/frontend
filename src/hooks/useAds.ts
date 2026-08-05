"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL, authFetch } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────
export type AdPlacementLocation = "banner_top" | "banner_sidebar" | "banner_footer" | "in_content" | "reward_video";

export interface AdPlacementConfig {
  location: AdPlacementLocation;
  isActive: boolean;
  adNetwork: string;
  adUnitId: string | null;
  priority: number;
}

export interface AdPlacementsResponse {
  placements: AdPlacementConfig[];
  timestamp: string;
}

export interface RewardAdStatus {
  canWatch: boolean;
  reason: string | null;
  cooldownRemaining: number | null;
  dailyRemaining: number;
  dailyLimit: number;
}

export interface RewardClaimResult {
  success: boolean;
  coins?: number;
  newBalance?: number;
  message?: string;
  error?: string;
}

// ─── Hook: useAds ──────────────────────────────────────────────────────
/**
 * Hook for managing ad placements and reward video ads
 * 
 * @param token - Optional auth token for user-specific features
 * @param storyId - Optional story ID context for analytics
 * @param chapterId - Optional chapter ID context for analytics
 */
export function useAds(token?: string, storyId?: string, chapterId?: string) {
  // State
  const [placements, setPlacements] = useState<AdPlacementConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rewardStatus, setRewardStatus] = useState<RewardAdStatus | null>(null);
  const [claimingReward, setClaimingReward] = useState(false);
  const [lastClaimResult, setLastClaimResult] = useState<RewardClaimResult | null>(null);

  // Refs for tracking
  const impressionTracked = useRef<Set<string>>(new Set());

  // ─── Fetch ad placements ──────────────────────────────────────────────
  const fetchPlacements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/ads/placements`);
      if (!response.ok) {
        throw new Error("Failed to fetch ad placements");
      }
      const data: AdPlacementsResponse = await response.json();
      setPlacements(data.placements);
    } catch (err) {
      console.error("[useAds] Error fetching placements:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Set fallback placements on error
      setPlacements(getFallbackPlacements());
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Fetch reward ad status ──────────────────────────────────────────
  const fetchRewardStatus = useCallback(async () => {
    if (!token) {
      setRewardStatus(null);
      return;
    }

    try {
      const response = await authFetch("/api/ads/can-watch", token);
      if (response.ok) {
        const data = await response.json();
        setRewardStatus(data);
      }
    } catch (err) {
      console.error("[useAds] Error fetching reward status:", err);
    }
  }, [token]);

  // ─── Record impression ───────────────────────────────────────────────
  const recordImpression = useCallback(
    async (placement: AdPlacementLocation, customStoryId?: string, customChapterId?: string) => {
      const impressionKey = `${placement}-${customStoryId || storyId}-${customChapterId || chapterId}-${Date.now()}`;
      
      // Prevent duplicate impressions for same placement in short time
      if (impressionTracked.current.has(placement)) {
        return;
      }
      impressionTracked.current.add(placement);

      try {
        const body: Record<string, unknown> = { placement };
        if (customStoryId || storyId) body.storyId = customStoryId || storyId;
        if (customChapterId || chapterId) body.chapterId = customChapterId || chapterId;

        await fetch(`${API_BASE_URL}/api/ads/impression`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (err) {
        console.error("[useAds] Error recording impression:", err);
      }
    },
    [storyId, chapterId]
  );

  // ─── Claim reward ad ──────────────────────────────────────────────────
  const claimReward = useCallback(async (): Promise<RewardClaimResult> => {
    if (!token) {
      return { success: false, error: "Vui lòng đăng nhập để nhận thưởng" };
    }

    setClaimingReward(true);
    setLastClaimResult(null);

    try {
      const response = await authFetch("/api/ads/reward", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result: RewardClaimResult = await response.json();
      setLastClaimResult(result);

      if (result.success) {
        // Refresh reward status after claiming
        await fetchRewardStatus();
      }

      return result;
    } catch (err) {
      const errorResult: RewardClaimResult = {
        success: false,
        error: err instanceof Error ? err.message : "Lỗi kết nối server",
      };
      setLastClaimResult(errorResult);
      return errorResult;
    } finally {
      setClaimingReward(false);
    }
  }, [token, fetchRewardStatus]);

  // ─── Get placement config ─────────────────────────────────────────────
  const getPlacementConfig = useCallback(
    (location: AdPlacementLocation): AdPlacementConfig | undefined => {
      return placements.find((p) => p.location === location);
    },
    [placements]
  );

  // ─── Check if placement is active ──────────────────────────────────────
  const isPlacementActive = useCallback(
    (location: AdPlacementLocation): boolean => {
      const config = getPlacementConfig(location);
      return config?.isActive ?? true; // Default to active if not found
    },
    [getPlacementConfig]
  );

  // ─── Initial fetch ───────────────────────────────────────────────────
  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  useEffect(() => {
    if (token) {
      fetchRewardStatus();
    }
  }, [token, fetchRewardStatus]);

  return {
    // State
    placements,
    loading,
    error,
    rewardStatus,
    claimingReward,
    lastClaimResult,

    // Actions
    fetchPlacements,
    fetchRewardStatus,
    recordImpression,
    claimReward,

    // Helpers
    getPlacementConfig,
    isPlacementActive,
  };
}

// ─── Fallback placements (when API fails) ───────────────────────────────
function getFallbackPlacements(): AdPlacementConfig[] {
  return [
    { location: "banner_top", isActive: true, adNetwork: "google", adUnitId: null, priority: 100 },
    { location: "banner_sidebar", isActive: true, adNetwork: "google", adUnitId: null, priority: 90 },
    { location: "banner_footer", isActive: true, adNetwork: "google", adUnitId: null, priority: 80 },
    { location: "in_content", isActive: true, adNetwork: "google", adUnitId: null, priority: 70 },
    { location: "reward_video", isActive: true, adNetwork: "google", adUnitId: null, priority: 60 },
  ];
}

// ─── Hook: useRewardAdCooldown ─────────────────────────────────────────
/**
 * Hook to manage reward ad cooldown timer
 */
export function useRewardAdCooldown(rewardStatus: RewardAdStatus | null) {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!rewardStatus?.cooldownRemaining || rewardStatus.cooldownRemaining <= 0) {
      setCooldownSeconds(0);
      return;
    }

    const initialSeconds = rewardStatus.cooldownRemaining * 60;
    setCooldownSeconds(initialSeconds);

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rewardStatus?.cooldownRemaining]);

  const formatCooldown = useCallback((seconds: number): string => {
    if (seconds <= 0) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${secs}s`;
  }, []);

  return {
    cooldownSeconds,
    formattedCooldown: formatCooldown(cooldownSeconds),
    isOnCooldown: cooldownSeconds > 0,
  };
}
