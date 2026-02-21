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
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

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

const questMeta: Record<
  string,
  {
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
    iconColor: string;
    progressColor: string;
    borderColor: string;
    bgColor: string;
  }
> = {
  checkin: {
    icon: HandRaisedIcon,
    gradient: "from-amber-400 to-orange-500",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    progressColor: "bg-amber-400",
    borderColor: "border-amber-200",
    bgColor: "bg-amber-50",
  },
  comment: {
    icon: ChatBubbleLeftEllipsisIcon,
    gradient: "from-sky-400 to-blue-500",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    progressColor: "bg-sky-400",
    borderColor: "border-sky-200",
    bgColor: "bg-sky-50",
  },
  read: {
    icon: BookOpenIcon,
    gradient: "from-violet-400 to-purple-500",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    progressColor: "bg-violet-400",
    borderColor: "border-violet-200",
    bgColor: "bg-violet-50",
  },
};

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = (session as any)?.accessToken as string | undefined;

  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
    coins?: number;
  } | null>(null);

  const fetchQuests = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const res = await authFetch("/api/quests/daily", token);
      if (res.ok) {
        const data = await res.json();
        setQuestData(data);
      } else {
        setError("Không thể tải nhiệm vụ. Vui lòng thử lại.");
      }
    } catch {
      setError("Lỗi kết nối server");
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

  // Auto-hide toast after 4s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCheckin = async () => {
    if (!token || checkinLoading) return;
    setCheckinLoading(true);
    setToast(null);
    try {
      const res = await authFetch("/api/quests/checkin", token, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setToast({
          text: data.message || "Điểm danh thành công!",
          type: "success",
          coins: data.reward,
        });
        await fetchQuests();
      } else {
        setToast({
          text: data.error || "Không thể điểm danh",
          type: "error",
        });
      }
    } catch {
      setToast({ text: "Lỗi kết nối server", type: "error" });
    } finally {
      setCheckinLoading(false);
    }
  };

  const completedCount = questData?.quests.filter((q) => q.completed).length ?? 0;
  const totalQuests = questData?.quests.length ?? 3;
  const allCompleted = completedCount === totalQuests && totalQuests > 0;

  // ── Loading state ──
  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <main className="section-container min-h-screen py-8">
          <div className="mx-auto max-w-lg">
            <div className="animate-pulse space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-gray-200" />
              <div className="mx-auto h-8 w-48 rounded-lg bg-gray-200" />
              <div className="h-24 rounded-2xl bg-gray-200" />
              <div className="h-28 rounded-xl bg-gray-200" />
              <div className="h-28 rounded-xl bg-gray-200" />
              <div className="h-28 rounded-xl bg-gray-200" />
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
          {/* ── Page header ── */}
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

          {/* ── Toast notification ── */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${
                  toast.type === "success"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircleSolid className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                ) : (
                  <span className="flex-shrink-0 text-red-500">✕</span>
                )}
                <span
                  className={`flex-1 text-body-sm font-medium ${
                    toast.type === "success" ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {toast.text}
                </span>
                {toast.coins && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-caption font-bold text-amber-700">
                    <CurrencyDollarIcon className="h-3.5 w-3.5" />+{toast.coins}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error state ── */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-body-sm text-red-600">{error}</p>
              <button
                onClick={() => { setLoading(true); fetchQuests(); }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-caption font-medium text-red-700 hover:bg-red-200 transition-colors"
              >
                <ArrowPathIcon className="h-3.5 w-3.5" />
                Thử lại
              </button>
            </div>
          )}

          {/* ── Coins summary card ── */}
          {questData && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption font-medium uppercase tracking-wide text-amber-600">
                    Xu nhận hôm nay
                  </p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-amber-600">
                      {questData.coinsEarned}
                    </span>
                    <span className="text-body-sm font-medium text-amber-400">
                      / {questData.maxDaily} xu
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                    <CurrencyDollarIcon className="h-7 w-7 text-white" />
                  </div>
                  {allCompleted && (
                    <CheckCircleSolid className="absolute -right-1 -top-1 h-6 w-6 text-emerald-500 drop-shadow-sm" />
                  )}
                </div>
              </div>

              {/* Overall progress bar */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-caption">
                  <span className="font-medium text-amber-700">
                    Tiến trình: {completedCount}/{totalQuests} nhiệm vụ
                  </span>
                  {allCompleted && (
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <SparklesIcon className="h-3.5 w-3.5" />
                      Hoàn thành!
                    </span>
                  )}
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-amber-100/80">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(completedCount / totalQuests) * 100}%`,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      allCompleted
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : "bg-gradient-to-r from-amber-400 to-orange-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Quest cards ── */}
          <div className="space-y-3">
            {questData?.quests.map((quest, idx) => {
              const meta = questMeta[quest.id] || questMeta.checkin;
              const Icon = meta.icon;
              const isCheckin = quest.id === "checkin";
              const isRead = quest.id === "read";
              const hasProgress = isRead && quest.target;
              const progressPct = hasProgress
                ? ((quest.progress ?? 0) / quest.target!) * 100
                : 0;

              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className={`overflow-hidden rounded-xl border-2 transition-all ${
                    quest.completed
                      ? "border-emerald-300 bg-emerald-50/70 shadow-sm shadow-emerald-100"
                      : `${meta.borderColor} ${meta.bgColor} shadow-sm`
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Quest icon */}
                      <div
                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                          quest.completed ? "bg-emerald-100" : meta.iconBg
                        }`}
                      >
                        {quest.completed ? (
                          <CheckCircleSolid className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <Icon className={`h-6 w-6 ${meta.iconColor}`} />
                        )}
                      </div>

                      {/* Quest content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3
                              className={`text-body-sm font-bold ${
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
                            className={`flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1 text-caption font-bold shadow-sm ${
                              quest.completed
                                ? "bg-emerald-500 text-white"
                                : "bg-white text-amber-600 ring-1 ring-amber-200"
                            }`}
                          >
                            <CurrencyDollarIcon className="h-3.5 w-3.5" />
                            +{quest.reward} xu
                          </div>
                        </div>

                        {/* ── Reading progress bar ── */}
                        {isRead && quest.target && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-caption">
                              <span
                                className={
                                  quest.completed
                                    ? "font-medium text-emerald-600"
                                    : "font-medium text-gray-600"
                                }
                              >
                                {quest.completed
                                  ? "Đã đọc đủ 10 phút"
                                  : `Đang đọc: ${quest.progress ?? 0}/${quest.target} phút`}
                              </span>
                              <span
                                className={`font-bold ${
                                  quest.completed ? "text-emerald-600" : meta.iconColor
                                }`}
                              >
                                {Math.round(
                                  quest.completed ? 100 : progressPct
                                )}
                                %
                              </span>
                            </div>
                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-inset ring-gray-200/50">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${quest.completed ? 100 : progressPct}%`,
                                }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  quest.completed
                                    ? "bg-emerald-400"
                                    : `bg-gradient-to-r ${meta.gradient}`
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        {/* ── Check-in button ── */}
                        {isCheckin && !quest.completed && (
                          <button
                            onClick={handleCheckin}
                            disabled={checkinLoading}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-body-sm font-bold text-white shadow-md shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg disabled:opacity-60"
                          >
                            {checkinLoading ? (
                              <>
                                <svg
                                  className="h-4 w-4 animate-spin"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  />
                                </svg>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <GiftIcon className="h-4 w-4" />
                                Điểm danh nhận {quest.reward} xu
                              </>
                            )}
                          </button>
                        )}

                        {/* ── Status labels ── */}
                        {quest.completed && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-caption font-bold text-emerald-700">
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              Đã hoàn thành · Đã nhận {quest.reward} xu
                            </span>
                          </div>
                        )}
                        {!quest.completed && !isCheckin && (
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-caption font-medium text-gray-500 ring-1 ring-gray-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                              Chưa hoàn thành
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Info section ── */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-body-sm font-bold text-gray-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-caption">
                💡
              </span>
              Hướng dẫn
            </h3>
            <ul className="space-y-2 text-caption text-gray-600">
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                Nhiệm vụ được làm mới lúc <strong>00:00</strong> mỗi ngày
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                Tối đa nhận <strong>50 xu</strong> miễn phí mỗi ngày
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                Xu từ nhiệm vụ được <strong>cộng tự động</strong> khi hoàn thành
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                Nhiệm vụ đọc truyện sẽ tự động cập nhật khi bạn đọc chương
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
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
