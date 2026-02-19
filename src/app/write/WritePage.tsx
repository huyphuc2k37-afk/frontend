"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PlusIcon,
  SparklesIcon,
  EyeIcon,
  HeartIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  PencilSquareIcon,
  ChartBarIcon,
  BoltIcon,
  FireIcon,
  CurrencyDollarIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import { useStudio } from "@/components/StudioLayout";
import { API_BASE_URL } from "@/lib/api";

interface UserStory {
  id: string;
  title: string;
  slug: string;
  genre: string;
  views: number;
  likes: number;
  status: string;
  approvalStatus?: string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { chapters: number; bookmarks: number; comments: number };
}

interface DashboardData {
  balance: number;
  totalViews: number;
  totalLikes: number;
  todayEarnings: number;
  monthEarnings: number;
  earningsChart: { day: string; value: number }[];
}

export default function WritePage() {
  const { profile, token } = useStudio();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!token) return;

    // Fetch stories + dashboard in parallel
    Promise.all([
      fetch(`${API_BASE_URL}/api/manage/stories`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/manage/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([storiesData, dashData]) => {
        if (storiesData?.stories) setStories(storiesData.stories);
        if (dashData?.balance !== undefined) setDashboard(dashData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const totalViews = dashboard?.totalViews || stories.reduce((s, st) => s + st.views, 0);
  const totalLikes = dashboard?.totalLikes || stories.reduce((s, st) => s + st.likes, 0);
  const totalChapters = stories.reduce((s, st) => s + (st._count?.chapters || 0), 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const formatXu = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

  // Real earnings chart data from API
  const earningsChart = dashboard?.earningsChart || [];
  const maxChartValue = Math.max(...earningsChart.map((d) => d.value), 1);

  const recentStories = [...stories]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ── Welcome card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 p-6 text-white shadow-lg sm:p-8"
      >
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-body-sm font-medium text-white/70">{greeting()},</p>
          <h2 className="mt-1 text-heading-lg font-bold">{profile?.name || "Tác giả"} 👋</h2>
          <p className="mt-2 max-w-lg text-body-md text-white/80">
            Chào mừng bạn đến Author Studio. Tiếp tục sáng tạo và chia sẻ câu chuyện của bạn với cộng đồng!
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/write/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-body-sm font-semibold text-primary-700 shadow-md transition-all hover:bg-white/90 hover:shadow-lg"
            >
              <PlusIcon className="h-4 w-4" />
              Viết truyện mới
            </Link>
            <Link
              href="/write/stories"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-body-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <BookOpenIcon className="h-4 w-4" />
              Quản lý tác phẩm
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stats grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { icon: BookOpenIcon, label: "Tác phẩm", value: stories.length, color: "text-primary-500", bg: "bg-primary-50" },
          { icon: CurrencyDollarIcon, label: "Số dư xu", value: formatXu(dashboard?.balance || 0), color: "text-amber-500", bg: "bg-amber-50" },
          { icon: EyeIcon, label: "Lượt đọc", value: totalViews.toLocaleString(), color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: GiftIcon, label: "Thu nhập tháng này", value: formatXu(dashboard?.monthEarnings || 0) + " xu", color: "text-rose-500", bg: "bg-rose-50" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-heading-md font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-caption text-gray-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Views chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-primary-500" />
              <h3 className="text-body-lg font-bold text-gray-900">
                Thu nhập 14 ngày gần nhất
              </h3>
            </div>
            <span className="flex items-center gap-1 text-caption font-medium text-emerald-500">
              <ArrowTrendingUpIcon className="h-4 w-4" />
              {dashboard?.todayEarnings ? `Hôm nay: ${formatXu(dashboard.todayEarnings)} xu` : "Chưa có dữ liệu"}
            </span>
          </div>
          <div className="mt-6 flex items-end gap-1.5" style={{ height: 160 }}>
            {earningsChart.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((d.value / maxChartValue) * 100, 2)}%` }}
                  transition={{ delay: 0.3 + i * 0.03, duration: 0.5 }}
                  className={`w-full min-h-[4px] rounded-t-md transition-colors hover:from-primary-600 hover:to-primary-500 ${
                    d.value > 0
                      ? "bg-gradient-to-t from-primary-500 to-primary-400"
                      : "bg-gray-200"
                  }`}
                  title={`${d.day}: ${formatXu(d.value)} xu`}
                />
                <span className="hidden text-[9px] text-gray-400 sm:block">
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Quick actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-accent-500" />
            <h3 className="text-body-lg font-bold text-gray-900">
              Thao tác nhanh
            </h3>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { href: "/write/new", label: "Tạo truyện mới", icon: PlusIcon, color: "text-primary-500" },
              { href: "/write/stories", label: "Quản lý tác phẩm", icon: BookOpenIcon, color: "text-blue-500" },
              { href: "/write/stats", label: "Xem thống kê", icon: ChartBarIcon, color: "text-emerald-500" },
              { href: "/write/guide", label: "Hướng dẫn viết truyện", icon: DocumentTextIcon, color: "text-amber-500" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-gray-50"
              >
                <div className="rounded-lg bg-gray-50 p-2">
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <span className="text-body-sm font-medium text-gray-700">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent stories ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-orange-500" />
            <h3 className="text-body-lg font-bold text-gray-900">
              Tác phẩm gần đây
            </h3>
          </div>
          {stories.length > 0 && (
            <Link
              href="/write/stories"
              className="text-body-sm font-medium text-primary-500 hover:underline"
            >
              Xem tất cả →
            </Link>
          )}
        </div>

        {stories.length === 0 ? (
          <div className="py-12 text-center">
            <SparklesIcon className="mx-auto h-14 w-14 text-gray-200" />
            <h4 className="mt-3 text-body-md font-semibold text-gray-500">
              Chưa có tác phẩm nào
            </h4>
            <p className="mt-1 text-body-sm text-gray-400">
              Bắt đầu hành trình tác giả bằng tác phẩm đầu tiên!
            </p>
            <Link
              href="/write/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600"
            >
              <PlusIcon className="h-4 w-4" />
              Tạo truyện đầu tiên
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {recentStories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
              >
                <Link
                  href={`/write/${story.id}`}
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-all hover:border-primary-200 hover:bg-primary-50/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-body-md font-semibold text-gray-900">
                        {story.title}
                      </h4>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          story.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : story.status === "paused"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {story.status === "completed" ? "Hoàn thành" : story.status === "paused" ? "Tạm ngưng" : "Đang viết"}
                      </span>
                      {story.approvalStatus === "pending" && (
                        <span className="flex-shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700 border border-yellow-200">
                          ⏳ Chờ duyệt
                        </span>
                      )}
                      {story.approvalStatus === "rejected" && (
                        <span className="flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                          ❌ Từ chối
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-caption text-gray-500">
                      {story.genre?.split(",").map((g: string) => g.trim()).filter(Boolean).slice(0, 2).map((g: string) => (
                        <span key={g} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium">{g}</span>
                      ))}
                      <span className="flex items-center gap-1">
                        <DocumentTextIcon className="h-3 w-3" />
                        {story._count?.chapters || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeIcon className="h-3 w-3" />
                        {story.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <HeartIcon className="h-3 w-3" />
                        {story.likes.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {new Date(story.updatedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <PencilSquareIcon className="ml-3 h-5 w-5 flex-shrink-0 text-gray-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Tips / Announcement ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-accent-200 bg-gradient-to-r from-accent-50 to-blue-50 p-5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-accent-100 p-2">
            <SparklesIcon className="h-5 w-5 text-accent-600" />
          </div>
          <div>
            <h4 className="text-body-sm font-bold text-gray-900">
              💡 Mẹo viết truyện
            </h4>
            <p className="mt-1 text-body-sm text-gray-600">
              Viết đều đặn mỗi ngày, dù chỉ 500 từ, còn hơn viết 5000 từ một lần rồi nghỉ cả tuần.
              Sự kiên trì là chìa khóa để xây dựng lượng độc giả trung thành!
            </p>
            <Link
              href="/write/guide"
              className="mt-2 inline-block text-body-sm font-medium text-accent-600 hover:underline"
            >
              Đọc thêm hướng dẫn →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
