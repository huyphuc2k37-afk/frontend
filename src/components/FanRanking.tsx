"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import type { FanClubMember } from "@/types";

interface Props {
  authorId: string;
  currentMember: FanClubMember | null;
}

const TIER_COLORS = {
  member: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", label: "Member" },
  vip: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-400", label: "VIP" },
  svip: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-400", label: "SVIP" },
};

const RANK_MEDALS = {
  1: { emoji: "🥇", bg: "bg-yellow-50", border: "border-yellow-400" },
  2: { emoji: "🥈", bg: "bg-gray-50", border: "border-gray-400" },
  3: { emoji: "🥉", bg: "bg-orange-50", border: "border-orange-400" },
};

export default function FanRanking({ authorId, currentMember }: Props) {
  const [ranking, setRanking] = useState<(FanClubMember & { rank: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorId) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/fanclub/${authorId}/ranking`)
      .then((r) => r.json())
      .then((data) => {
        setRanking(data.ranking || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authorId]);

  // Find current user's position in the ranking
  const currentUserRank = currentMember
    ? ranking.findIndex((r) => r.userId === currentMember.userId) + 1
    : null;

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h3 className="text-heading-md font-bold text-gray-900">Bảng xếp hạng Fans</h3>
        <div className="mt-4 flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-heading-md font-bold text-gray-900">Bảng xếp hạng Fans</h3>
        <Link
          href={`/fanclub/${authorId}`}
          className="text-caption text-primary-600 hover:text-primary-500"
        >
          Xem chi tiết →
        </Link>
      </div>

      {ranking.length === 0 ? (
        <p className="mt-4 text-body-sm text-gray-500">
          Chưa có ai trong bảng xếp hạng. Hãy là người đầu tiên tham gia!
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {/* Top 3 highlighted */}
          {ranking.slice(0, 3).map((fan) => {
            const medal = RANK_MEDALS[fan.rank as keyof typeof RANK_MEDALS];
            const tier = TIER_COLORS[fan.tier];
            return (
              <div
                key={fan.id}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 ${medal?.border || "border-gray-200"} ${medal?.bg || "bg-white"}`}
              >
                <div className="flex h-8 w-8 items-center justify-center text-lg">
                  {medal?.emoji || <span className="text-body-sm font-bold text-gray-500">{fan.rank}</span>}
                </div>
                {fan.user?.image ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                    <Image src={fan.user.image} alt="" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-body-md font-bold text-white">
                    {fan.user?.name?.[0] || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-body-sm font-semibold text-gray-900">{fan.user?.name}</p>
                  <p className="text-caption text-gray-500">
                    {fan.tierCoins.toLocaleString("vi-VN")} xu
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-caption font-semibold ${tier.bg} ${tier.text}`}>
                  {tier.label}
                </span>
              </div>
            );
          })}

          {/* Rest of ranking */}
          {ranking.slice(3).map((fan) => {
            const tier = TIER_COLORS[fan.tier];
            const isCurrentUser = currentMember?.userId === fan.userId;
            return (
              <div
                key={fan.id}
                className={`flex items-center gap-3 rounded-xl border border-gray-100 p-3 ${
                  isCurrentUser ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <span className="text-body-sm font-bold text-gray-500">{fan.rank}</span>
                </div>
                {fan.user?.image ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                    <Image src={fan.user.image} alt="" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-caption font-bold text-gray-500">
                    {fan.user?.name?.[0] || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-body-sm font-medium text-gray-700">
                    {fan.user?.name}
                    {isCurrentUser && <span className="ml-1 text-primary-600">(Bạn)</span>}
                  </p>
                </div>
                <span className="text-caption text-gray-500">
                  {fan.tierCoins.toLocaleString("vi-VN")} xu
                </span>
                <span className={`rounded-full px-2 py-0.5 text-caption font-semibold ${tier.bg} ${tier.text}`}>
                  {tier.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Current user's rank if not in top list */}
      {currentMember && currentUserRank && currentUserRank > 10 && (
        <div className="mt-4 rounded-xl border-2 border-purple-300 bg-purple-50 p-3">
          <p className="text-caption text-purple-600">Vị trí của bạn trong bảng xếp hạng</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-body-md font-bold text-purple-700">Hạng #{currentUserRank}</span>
            <span className="text-body-sm text-purple-600">
              {currentMember.tierCoins.toLocaleString("vi-VN")} xu
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
