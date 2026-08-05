"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  SparklesIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  EyeIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authFetch, API_BASE_URL, resolveCoverSrc } from "@/lib/api";
import { useWalletBalance } from "@/contexts/WalletBalanceContext";

const COINS_PER_SUGGESTION = 50;
const MAX_SUGGESTIONS_PER_DAY = 3;

interface PoolStory {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  author: { id: string; name: string };
  views: number;
  likes: number;
  genre: string;
  suggestedAt: string;
  message?: string;
}

interface SuggestionPool {
  date: string;
  slots: number;
  stories: PoolStory[];
  total: number;
}

interface UserSuggestion {
  id: string;
  storyId: string;
  message?: string;
  coinsSpent: number;
  status: string;
  createdAt: string;
  expiresAt?: string;
  story: {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    author: { id: string; name: string };
  };
}

interface UserSuggestionsResponse {
  suggestions: UserSuggestion[];
  todayCount: number;
  maxPerDay: number;
  remainingToday: number;
  coinsPerSuggestion: number;
}

function RedirectToLogin() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login?callbackUrl=/suggest");
  }, [router]);
  return null;
}

export default function SuggestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"featured" | "promote" | "history">("featured");
  const [pool, setPool] = useState<SuggestionPool | null>(null);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestionsResponse | null>(null);
  const [userStories, setUserStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { balance: sharedBalance, refresh: refreshBalance } = useWalletBalance();
  const token = (session as any)?.accessToken as string | undefined;

  // Fetch featured pool
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/suggestions/pool`)
      .then((r) => r.json())
      .then((data) => setPool(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch user's suggestions and stories when logged in
  useEffect(() => {
    if (!token) return;

    Promise.all([
      authFetch("/api/suggestions/me", token).then((r) => r.json()),
      authFetch("/api/profile", token).then((r) => r.json()),
    ])
      .then(([suggestionsData, profileData]) => {
        setUserSuggestions(suggestionsData);
        setUserStories(profileData?.stories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handlePromote = async () => {
    if (!selectedStory || !token) return;

    setSubmitting(true);
    try {
      const res = await authFetch("/api/suggestions/promote", token, {
        method: "POST",
        body: JSON.stringify({
          storyId: selectedStory,
          message: message.trim() || undefined,
        }),
      });

      if (res.ok) {
        setNotification({ type: "success", message: "Đề xuất đã được gửi thành công!" });
        setSelectedStory(null);
        setMessage("");
        refreshBalance();

        // Refresh user suggestions
        const updated = await authFetch("/api/suggestions/me", token).then((r) => r.json());
        setUserSuggestions(updated);
      } else {
        const err = await res.json().catch(() => ({ error: "Có lỗi xảy ra" }));
        setNotification({ type: "error", message: err.error || "Có lỗi xảy ra" });
      }
    } catch {
      setNotification({ type: "error", message: "Lỗi kết nối. Vui lòng thử lại." });
    }
    setSubmitting(false);

    setTimeout(() => setNotification(null), 5000);
  };

  const handleCancel = async (id: string) => {
    if (!token) return;
    if (!confirm("Bạn có chắc muốn hủy đề xuất này? Xu sẽ được hoàn trả.")) return;

    try {
      const res = await authFetch(`/api/suggestions/cancel/${id}`, token, { method: "POST" });
      if (res.ok) {
        setNotification({ type: "success", message: "Đề xuất đã được hủy. Xu đã được hoàn trả." });
        refreshBalance();

        const updated = await authFetch("/api/suggestions/me", token).then((r) => r.json());
        setUserSuggestions(updated);
      } else {
        const err = await res.json().catch(() => ({ error: "Có lỗi xảy ra" }));
        setNotification({ type: "error", message: err.error || "Có lỗi xảy ra" });
      }
    } catch {
      setNotification({ type: "error", message: "Lỗi kết nối. Vui lòng thử lại." });
    }

    setTimeout(() => setNotification(null), 5000);
  };

  const statusConfig: Record<string, { color: string; bg: string; label: string; icon: any }> = {
    pending: { color: "text-amber-600", bg: "bg-amber-50", label: "Chờ duyệt", icon: ClockIcon },
    approved: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Đã duyệt", icon: CheckCircleIcon },
    rejected: { color: "text-red-600", bg: "bg-red-50", label: "Từ chối", icon: XCircleIcon },
    expired: { color: "text-gray-600", bg: "bg-gray-50", label: "Hết hạn", icon: ExclamationTriangleIcon },
    cancelled: { color: "text-gray-600", bg: "bg-gray-50", label: "Đã hủy", icon: XCircleIcon },
    spam: { color: "text-red-600", bg: "bg-red-50", label: "Spam", icon: ExclamationTriangleIcon },
  };

  if (status === "loading") {
    return (
      <>
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
        <RedirectToLogin />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="section-container py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Page title */}
          <div>
            <h1 className="text-heading-lg font-bold text-gray-900">Đề Xuất Truyện</h1>
            <p className="mt-1 text-body-sm text-gray-500">
              Giới thiệu truyện bạn yêu thích lên trang chủ
            </p>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`flex items-center gap-3 rounded-xl px-5 py-4 ${
              notification.type === "success"
                ? "border border-emerald-200 bg-emerald-50"
                : "border border-red-200 bg-red-50"
            }`}>
              {notification.type === "success" ? (
                <CheckCircleIcon className="h-6 w-6 flex-shrink-0 text-emerald-600" />
              ) : (
                <XCircleIcon className="h-6 w-6 flex-shrink-0 text-red-600" />
              )}
              <p className={`text-body-sm font-medium ${
                notification.type === "success" ? "text-emerald-900" : "text-red-900"
              }`}>
                {notification.message}
              </p>
            </div>
          )}

          {/* Stats card */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-2.5">
                  <CurrencyDollarIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-caption text-gray-500">Phí đề xuất</p>
                  <p className="text-heading-sm font-bold text-gray-900">{COINS_PER_SUGGESTION} xu</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2.5">
                  <SparklesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-caption text-gray-500">Đã đề xuất hôm nay</p>
                  <p className="text-heading-sm font-bold text-gray-900">
                    {userSuggestions?.todayCount || 0} / {MAX_SUGGESTIONS_PER_DAY}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50 to-green-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2.5">
                  <StarIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-caption text-gray-500">Còn lại hôm nay</p>
                  <p className="text-heading-sm font-bold text-gray-900">
                    {userSuggestions?.remainingToday ?? MAX_SUGGESTIONS_PER_DAY}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("featured")}
              className={`flex-1 rounded-lg py-2.5 text-body-sm font-semibold transition-all ${
                activeTab === "featured"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <StarIcon className="mx-auto mb-1 h-5 w-5" />
              Truyện nổi bật
            </button>
            <button
              onClick={() => setActiveTab("promote")}
              className={`flex-1 rounded-lg py-2.5 text-body-sm font-semibold transition-all ${
                activeTab === "promote"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ArrowTrendingUpIcon className="mx-auto mb-1 h-5 w-5" />
              Đề xuất truyện
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 rounded-lg py-2.5 text-body-sm font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ClockIcon className="mx-auto mb-1 h-5 w-5" />
              Lịch sử
            </button>
          </div>

          {/* Featured Stories Tab */}
          {activeTab === "featured" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-body-lg font-semibold text-gray-900">Truyện nổi bật hôm nay</h2>
                  <p className="text-caption text-gray-500">{pool?.date} · {pool?.total || 0}/{pool?.slots || 5} vị trí</p>
                </div>
              </div>

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4">
                      <div className="flex gap-4">
                        <div className="h-32 w-24 rounded-xl bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-gray-200" />
                          <div className="h-3 w-1/2 rounded bg-gray-200" />
                          <div className="h-3 w-2/3 rounded bg-gray-200" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pool?.stories && pool.stories.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {pool.stories.map((story, index) => (
                    <Link
                      key={story.id}
                      href={`/story/${story.slug}`}
                      className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          {story.coverImage ? (
                            <Image
                              src={resolveCoverSrc(story)}
                              alt={story.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                              <BookOpenIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          {index < 3 && (
                            <div className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-caption font-bold text-white ${
                              index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"
                            }`}>
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600">
                            {story.title}
                          </h3>
                          <p className="mt-1 text-caption text-gray-500">{story.author.name}</p>
                          <div className="mt-2 flex items-center gap-3 text-caption text-gray-400">
                            <span className="flex items-center gap-1">
                              <EyeIcon className="h-3.5 w-3.5" />
                              {story.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <HeartIcon className="h-3.5 w-3.5" />
                              {story.likes.toLocaleString()}
                            </span>
                          </div>
                          {story.message && (
                            <p className="mt-2 line-clamp-2 text-caption italic text-gray-500">
                              "{story.message}"
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                  <StarIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-3 text-body-sm text-gray-500">Chưa có truyện nổi bật nào hôm nay</p>
                  <p className="mt-1 text-caption text-gray-400">Hãy là người đầu tiên đề xuất!</p>
                </div>
              )}
            </div>
          )}

          {/* Promote Tab */}
          {activeTab === "promote" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-body-lg font-semibold text-gray-900">Đề xuất truyện của bạn</h2>
                <p className="mt-1 text-caption text-gray-500">
                  Chi {COINS_PER_SUGGESTION} xu để giới thiệu truyện lên trang chủ
                </p>
              </div>

              {/* Balance warning */}
              {(sharedBalance ?? 0) < COINS_PER_SUGGESTION && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="text-body-sm font-semibold text-amber-900">Số dư không đủ</p>
                    <p className="text-caption text-amber-700">
                      Bạn cần ít nhất {COINS_PER_SUGGESTION} xu để đề xuất truyện.
                    </p>
                  </div>
                  <Link href="/wallet" className="ml-auto rounded-lg bg-amber-500 px-4 py-2 text-caption font-semibold text-white hover:bg-amber-600">
                    Nạp xu
                  </Link>
                </div>
              )}

              {/* Daily limit warning */}
              {(userSuggestions?.remainingToday ?? MAX_SUGGESTIONS_PER_DAY) <= 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                  <ClockIcon className="h-6 w-6 flex-shrink-0 text-gray-600" />
                  <p className="text-body-sm text-gray-700">
                    Bạn đã đề xuất tối đa {MAX_SUGGESTIONS_PER_DAY} truyện hôm nay. Vui lòng thử lại ngày mai.
                  </p>
                </div>
              )}

              {/* Story selection */}
              {(sharedBalance ?? 0) >= COINS_PER_SUGGESTION && (userSuggestions?.remainingToday ?? MAX_SUGGESTIONS_PER_DAY) > 0 && (
                <>
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-body-md font-semibold text-gray-900">Chọn truyện để đề xuất</h3>
                    <p className="mt-1 text-caption text-gray-500">
                      Chỉ hiển thị truyện đã được duyệt của bạn
                    </p>

                    {userStories.length > 0 ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {userStories.map((story) => (
                          <button
                            key={story.id}
                            onClick={() => setSelectedStory(story.id)}
                            className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                              selectedStory === story.id
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {story.coverImage && (
                                <Image
                                  src={resolveCoverSrc(story)}
                                  alt={story.title}
                                  width={36}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-body-sm font-medium text-gray-900">{story.title}</p>
                              <p className="text-caption text-gray-500">{story.genre}</p>
                            </div>
                            {selectedStory === story.id && (
                              <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-primary-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 py-8 text-center">
                        <BookOpenIcon className="mx-auto h-10 w-10 text-gray-300" />
                        <p className="mt-2 text-body-sm text-gray-500">Bạn chưa có truyện nào được duyệt</p>
                      </div>
                    )}
                  </div>

                  {/* Message input */}
                  {selectedStory && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="text-body-md font-semibold text-gray-900">Lời nhắn (tùy chọn)</h3>
                      <p className="mt-1 text-caption text-gray-500">
                        Giới thiệu ngắn gọn về truyện để thu hút người đọc
                      </p>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="VD: Truyện hay về đề tài xuyên không, cốt truyện hấp dẫn..."
                        maxLength={200}
                        rows={3}
                        className="mt-4 w-full rounded-xl border border-gray-200 p-4 text-body-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                      <p className="mt-2 text-right text-caption text-gray-400">{message.length}/200</p>
                    </div>
                  )}

                  {/* Confirm button */}
                  {selectedStory && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-body-md font-semibold text-gray-900">Xác nhận đề xuất</p>
                          <p className="text-caption text-gray-500">
                            Phí: <span className="font-semibold text-amber-600">{COINS_PER_SUGGESTION} xu</span>
                          </p>
                        </div>
                        <button
                          onClick={handlePromote}
                          disabled={submitting}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:from-primary-600 hover:to-primary-700 disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="h-5 w-5" />
                              Đề xuất ngay
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-body-lg font-semibold text-gray-900">Lịch sử đề xuất</h2>
                <p className="mt-1 text-caption text-gray-500">
                  Theo dõi các đề xuất của bạn
                </p>
              </div>

              {userSuggestions?.suggestions && userSuggestions.suggestions.length > 0 ? (
                <div className="space-y-4">
                  {userSuggestions.suggestions.map((suggestion) => {
                    const config = statusConfig[suggestion.status] || statusConfig.pending;
                    const StatusIcon = config.icon;

                    return (
                      <div key={suggestion.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex gap-4">
                          <Link href={`/story/${suggestion.story.slug}`} className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {suggestion.story.coverImage && (
                              <Image
                                src={resolveCoverSrc(suggestion.story)}
                                alt={suggestion.story.title}
                                width={48}
                                height={64}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Link href={`/story/${suggestion.story.slug}`} className="font-semibold text-gray-900 hover:text-primary-600">
                                  {suggestion.story.title}
                                </Link>
                                <p className="mt-0.5 text-caption text-gray-500">
                                  {new Date(suggestion.createdAt).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-semibold ${config.color} ${config.bg}`}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {config.label}
                              </span>
                            </div>
                            {suggestion.message && (
                              <p className="mt-2 line-clamp-2 text-caption italic text-gray-500">
                                "{suggestion.message}"
                              </p>
                            )}
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-caption text-gray-400">
                                Đã chi: {suggestion.coinsSpent} xu
                              </span>
                              {suggestion.status === "pending" && (
                                <button
                                  onClick={() => handleCancel(suggestion.id)}
                                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-gray-50"
                                >
                                  Hủy đề xuất
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-3 text-body-sm text-gray-500">Chưa có đề xuất nào</p>
                  <p className="mt-1 text-caption text-gray-400">Hãy đề xuất truyện bạn yêu thích!</p>
                </div>
              )}
            </div>
          )}

          {/* Info section */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-body-md font-semibold text-gray-900">Quy định đề xuất</h3>
            <ul className="mt-4 space-y-3">
              {[
                { icon: CurrencyDollarIcon, text: `Phí đề xuất: ${COINS_PER_SUGGESTION} xu/truyện` },
                { icon: ClockIcon, text: `Tối đa ${MAX_SUGGESTIONS_PER_DAY} đề xuất/ngày` },
                { icon: CheckCircleIcon, text: "Đề xuất sẽ được duyệt trong 24h" },
                { icon: SparklesIcon, text: "Đề xuất thành công sẽ hiển thị trên trang chủ" },
                { icon: XCircleIcon, text: "Đề xuất bị từ chối sẽ được hoàn xu đầy đủ" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-body-sm text-gray-600">
                  <item.icon className="h-5 w-5 flex-shrink-0 text-primary-500" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
