"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  EyeIcon,
  HeartIcon,
  BookOpenIcon,
  DocumentTextIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { useStudio } from "@/components/StudioLayout";
import { API_BASE_URL } from "@/lib/api";

interface UserStory {
  id: string;
  title: string;
  views: number;
  likes: number;
  status: string;
  _count: { chapters: number; bookmarks: number; comments: number };
}

export default function StatsPage() {
  const { token } = useStudio();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/manage/stories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.stories) setStories(data.stories);
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

  const totalViews = stories.reduce((s, st) => s + st.views, 0);
  const totalLikes = stories.reduce((s, st) => s + st.likes, 0);
  const totalChapters = stories.reduce((s, st) => s + (st._count?.chapters || 0), 0);
  const totalBookmarks = stories.reduce((s, st) => s + (st._count?.bookmarks || 0), 0);
  const totalComments = stories.reduce((s, st) => s + (st._count?.comments || 0), 0);

  const maxViews = Math.max(...stories.map((s) => s.views), 1);

  // Real chart data will come from API — show zeroes for now
  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      day: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      views: 0,
      likes: 0,
    };
  });
  const maxDayViews = 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-bold text-gray-900">
          Thống kê tổng quan
        </h2>
        <p className="mt-1 text-body-sm text-gray-500">
          Theo dõi hiệu suất tác phẩm của bạn
        </p>
      </div>

      {/* ── Big stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { icon: BookOpenIcon, label: "Tác phẩm", value: stories.length, color: "text-primary-500", bg: "bg-primary-50" },
          { icon: DocumentTextIcon, label: "Chương", value: totalChapters, color: "text-blue-500", bg: "bg-blue-50" },
          { icon: EyeIcon, label: "Lượt đọc", value: totalViews, color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: HeartIcon, label: "Lượt thích", value: totalLikes, color: "text-rose-500", bg: "bg-rose-50" },
          { icon: BookmarkIcon, label: "Lưu truyện", value: totalBookmarks, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-heading-md font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-caption text-gray-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── 30-day chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-primary-500" />
            <h3 className="text-body-lg font-bold text-gray-900">
              Lượt đọc 30 ngày gần nhất
            </h3>
          </div>
          <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-caption font-medium text-emerald-600">
            <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
            Tổng: {days30.reduce((s, d) => s + d.views, 0).toLocaleString()}
          </span>
        </div>
        <div className="mt-6 flex items-end gap-1" style={{ height: 200 }}>
          {days30.map((d, i) => (
            <div key={i} className="group flex flex-1 flex-col items-center gap-1 relative">
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-10 hidden rounded-lg bg-gray-900 px-2 py-1 text-[10px] text-white shadow-lg group-hover:block">
                {d.day}: {d.views}
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.views / maxDayViews) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.02, duration: 0.4 }}
                className="w-full min-h-[3px] rounded-t-sm bg-gradient-to-t from-primary-500 to-primary-400 transition-all hover:from-primary-600 hover:to-primary-500"
              />
              {i % 5 === 0 && (
                <span className="hidden text-[8px] text-gray-400 sm:block">{d.day}</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Per-story table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white shadow-sm"
      >
        <div className="border-b border-gray-100 p-6">
          <h3 className="text-body-lg font-bold text-gray-900">
            Thống kê theo tác phẩm
          </h3>
        </div>

        {stories.length === 0 ? (
          <div className="p-12 text-center text-body-sm text-gray-400">
            Chưa có tác phẩm nào để thống kê
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-caption font-semibold text-gray-500">
                  <th className="px-6 py-3">Tên truyện</th>
                  <th className="px-4 py-3 text-center">Chương</th>
                  <th className="px-4 py-3 text-center">Lượt đọc</th>
                  <th className="px-4 py-3 text-center">Thích</th>
                  <th className="px-4 py-3 text-center">Lưu</th>
                  <th className="px-4 py-3 text-center">Bình luận</th>
                  <th className="px-6 py-3">Phổ biến</th>
                </tr>
              </thead>
              <tbody>
                {[...stories]
                  .sort((a, b) => b.views - a.views)
                  .map((story, i) => (
                    <tr
                      key={story.id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                            {i + 1}
                          </span>
                          <span className="text-body-sm font-medium text-gray-900">
                            {story.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-body-sm text-gray-600">
                        {story._count?.chapters || 0}
                      </td>
                      <td className="px-4 py-4 text-center text-body-sm font-medium text-gray-900">
                        {story.views.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center text-body-sm text-gray-600">
                        {story.likes.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center text-body-sm text-gray-600">
                        {story._count?.bookmarks || 0}
                      </td>
                      <td className="px-4 py-4 text-center text-body-sm text-gray-600">
                        {story._count?.comments || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(story.views / maxViews) * 100}%` }}
                              transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                            />
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {Math.round((story.views / maxViews) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
