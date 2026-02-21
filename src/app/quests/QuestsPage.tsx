"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authFetch } from "@/lib/api";
import {
  CheckCircleIcon,
  GiftIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftEllipsisIcon,
  BookOpenIcon,
  HandRaisedIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  progress?: number;
  target?: number;
}

interface QuestData {
  date: string;
  quests: Quest[];
  coinsEarned: number;
  maxDaily: number;
}

const questIcons: Record<string, React.ElementType> = {
  checkin: HandRaisedIcon,
  comment: ChatBubbleLeftEllipsisIcon,
  read: BookOpenIcon,
};

const questColors: Record<string, { bg: string; border: string; icon: string; completedBg: string }> = {
  checkin: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-500",
    completedBg: "bg-emerald-50",
  },
  comment: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: "text-sky-500",
    completedBg: "bg-emerald-50",
  },
  read: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "text-violet-500",
    completedBg: "bg-emerald-50",
  },
};

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = (session as any)?.accessToken as string | undefined;

  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchQuests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch("/api/quests/daily", token);
      if (res.ok) {
        const data = await res.json();
        setQuestData(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (token) fetchQuests();
  }, [token, status, router, fetchQuests]);

  const handleCheckin = async () => {
    if (!token || checkinLoading) return;
    setCheckinLoading(true);
    setMessage(null);
    try {
      const res = await authFetch("/api/quests/checkin", token, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message || "Điểm danh thành công!", type: "success" });
        await fetchQuests();
      } else {
        setMessage({ text: data.error || "Không thể điểm danh", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối server", type: "error" });
    } finally {
      setCheckinLoading(false);
    }
  };

  const allCompleted = questData?.quests.every((q) => q.completed) ?? false;

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <main className="section-container min-h-screen py-8">
          <div className="mx-auto max-w-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 rounded-lg bg-gray-200" />
              <div className="h-32 rounded-xl bg-gray-200" />
              <div className="h-32 rounded-xl bg-gray-200" />
              <div className="h-32 rounded-xl bg-gray-200" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="section-container min-h-screen py-8">
        <div className="mx-auto max-w-lg">
          {/* Page header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50">
              <GiftIcon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-heading-lg font-bold text-gray-900">
              Nhiệm vụ hàng ngày
            </h1>
            <p className="mt-1 text-body-sm text-gray-500">
              Hoàn thành nhiệm vụ để nhận xu miễn phí mỗi ngày
            </p>
          </div>

          {/* Coins summary card */}
          {questData && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption font-medium text-amber-700">Xu nhận hôm nay</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-amber-600">
                      {questData.coinsEarned}
                    </span>
                    <span className="text-body-sm text-amber-500">
                      / {questData.maxDaily} xu
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <CurrencyDollarIcon className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{
                    width: `${Math.min((questData.coinsEarned / questData.maxDaily) * 100, 100)}%`,
                  }}
                />
              </div>
              {allCompleted && (
                <div className="mt-3 flex items-center gap-1.5 text-caption font-medium text-emerald-600">
                  <SparklesIcon className="h-4 w-4" />
                  Bạn đã hoàn thành tất cả nhiệm vụ hôm nay!
                </div>
              )}
            </div>
          )}

          {/* Toast message */}
          {message && (
            <div
              className={`mb-4 rounded-xl border px-4 py-3 text-body-sm font-medium ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Quest cards */}
          <div className="space-y-3">
            {questData?.quests.map((quest) => {
              const Icon = questIcons[quest.id] || GiftIcon;
              const colors = questColors[quest.id] || questColors.checkin;
              const isCheckin = quest.id === "checkin";
              const isRead = quest.id === "read";

              return (
                <div
                  key={quest.id}
                  className={`overflow-hidden rounded-xl border transition-all ${
                    quest.completed
                      ? "border-emerald-200 bg-emerald-50/60"
                      : `${colors.border} ${colors.bg}`
                  }`}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        quest.completed
                          ? "bg-emerald-100"
                          : "bg-white/80"
                      }`}
                    >
                      {quest.completed ? (
                        <CheckCircleSolid className="h-6 w-6 text-emerald-500" />
                      ) : (
                        <Icon className={`h-5 w-5 ${colors.icon}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className={`text-body-sm font-semibold ${
                              quest.completed ? "text-emerald-700" : "text-gray-900"
                            }`}
                          >
                            {quest.title}
                          </h3>
                          <p
                            className={`mt-0.5 text-caption ${
                              quest.completed ? "text-emerald-600" : "text-gray-500"
                            }`}
                          >
                            {quest.description}
                          </p>
                        </div>

                        {/* Reward badge */}
                        <div
                          className={`flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-caption font-semibold ${
                            quest.completed
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-white/90 text-amber-600 shadow-sm"
                          }`}
                        >
                          <CurrencyDollarIcon className="h-3.5 w-3.5" />
                          +{quest.reward}
                        </div>
                      </div>

                      {/* Reading progress bar */}
                      {isRead && !quest.completed && quest.target && (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-caption text-gray-500">
                            <span>{quest.progress ?? 0}/{quest.target} phút</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/80">
                            <div
                              className="h-full rounded-full bg-violet-400 transition-all duration-500"
                              style={{
                                width: `${((quest.progress ?? 0) / quest.target) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Check-in button */}
                      {isCheckin && !quest.completed && (
                        <button
                          onClick={handleCheckin}
                          disabled={checkinLoading}
                          className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-caption font-semibold text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md disabled:opacity-60"
                        >
                          {checkinLoading ? (
                            <span className="flex items-center gap-1.5">
                              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Đang xử lý...
                            </span>
                          ) : (
                            <>
                              <HandRaisedIcon className="h-4 w-4" />
                              Điểm danh ngay
                            </>
                          )}
                        </button>
                      )}

                      {/* Completed label */}
                      {quest.completed && (
                        <p className="mt-2 flex items-center gap-1 text-caption font-medium text-emerald-600">
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          Đã hoàn thành
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info section */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-2 text-body-sm font-semibold text-gray-900">
              Hướng dẫn
            </h3>
            <ul className="space-y-1.5 text-caption text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                Nhiệm vụ được làm mới lúc 00:00 mỗi ngày
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                Tối đa nhận 50 xu miễn phí mỗi ngày
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                Nhiệm vụ đọc truyện sẽ tự động cập nhật khi bạn đọc
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                Xu nhận được có thể dùng để mua chương truyện trả phí
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
