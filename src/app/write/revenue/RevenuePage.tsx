"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  DocumentTextIcon,
  GiftIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useStudio } from "@/components/StudioLayout";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

type Period = "7d" | "30d" | "all";

export default function RevenuePage() {
  const { profile, token } = useStudio();
  const [period, setPeriod] = useState<Period>("30d");

  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonth: 0,
    pendingWithdraw: 0,
    totalChaptersSold: 0,
    totalTips: 0,
    purchaseRevenue: 0,
    tipRevenue: 0,
    balance: 0,
    periodRevenue: 0,
    referralRevenue: 0,
  });

  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [topStories, setTopStories] = useState<any[]>([]);
  const [dailyChart, setDailyChart] = useState<any[]>([]);

  const fetchRevenue = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/revenue?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalRevenue: data.totalRevenue || 0,
          thisMonth: data.thisMonthRevenue || 0,
          pendingWithdraw: data.pendingWithdraw || 0,
          totalChaptersSold: data.totalChaptersSold || 0,
          totalTips: data.totalTips || 0,
          purchaseRevenue: data.purchaseRevenue || 0,
          tipRevenue: data.tipRevenue || 0,
          balance: data.balance || 0,
          periodRevenue: data.periodRevenue || 0,
          referralRevenue: data.referralRevenue || 0,
        });
        setRevenueHistory(data.recentSales || []);
        setTopStories(data.topStories || []);
        setDailyChart(data.dailyChart || []);
      }
    } catch {}
  }, [token, period]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  const formatXu = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + " xu";

  const maxChart = Math.max(...dailyChart.map((d: any) => d.total), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading-md font-bold text-gray-900">Doanh thu</h2>
          <p className="mt-1 text-body-sm text-gray-500">
            Theo dõi thu nhập từ các tác phẩm của bạn
          </p>
        </div>
        <Link
          href="/write/withdraw"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-500 px-5 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-emerald-600"
        >
          <BanknotesIcon className="h-4 w-4" />
          Rút tiền
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Tổng doanh thu",
            value: formatXu(stats.totalRevenue),
            icon: CurrencyDollarIcon,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Tháng này",
            value: formatXu(stats.thisMonth),
            icon: ArrowTrendingUpIcon,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Có thể rút",
            value: formatXu(stats.balance),
            icon: BanknotesIcon,
            color: "text-primary-600 bg-primary-50",
          },
          {
            label: "Chương đã bán",
            value: stats.totalChaptersSold.toString(),
            icon: DocumentTextIcon,
            color: "text-blue-600 bg-blue-50",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className={`inline-flex rounded-xl p-2.5 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-heading-sm font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="mt-0.5 text-caption text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-blue-50 p-3">
            <DocumentTextIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-heading-sm font-bold text-gray-900">
              {formatXu(stats.purchaseRevenue)}
            </p>
            <p className="text-caption text-gray-500">
              Từ bán chương ({stats.totalChaptersSold} lượt)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-rose-50 p-3">
            <GiftIcon className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <p className="text-heading-sm font-bold text-gray-900">
              {formatXu(stats.tipRevenue)}
            </p>
            <p className="text-caption text-gray-500">
              Từ xu ủng hộ ({stats.totalTips} lượt)
            </p>
          </div>
        </div>
        {stats.referralRevenue > 0 && (
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-purple-50 p-3">
              <SparklesIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-heading-sm font-bold text-gray-900">
                {formatXu(stats.referralRevenue)}
              </p>
              <p className="text-caption text-gray-500">
                Từ hoa hồng giới thiệu
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Revenue chart 30 days */}
      {dailyChart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-primary-500" />
              <h3 className="text-body-lg font-bold text-gray-900">
                Doanh thu 30 ngày
              </h3>
            </div>
            <div className="flex items-center gap-3 text-caption">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                Bán chương
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Xu ủng hộ
              </span>
            </div>
          </div>
          <div className="mt-6 flex items-end gap-1" style={{ height: 180 }}>
            {dailyChart.map((d: any, i: number) => (
              <div key={i} className="group flex flex-1 flex-col items-center gap-1 relative">
                <div className="pointer-events-none absolute -top-12 hidden rounded-lg bg-gray-900 px-2 py-1 text-[10px] text-white shadow-lg group-hover:block whitespace-nowrap z-10">
                  {d.day}: {d.total.toLocaleString("vi-VN")} xu
                  {d.purchases > 0 && ` (bán: ${d.purchases.toLocaleString("vi-VN")})`}
                  {d.tips > 0 && ` (tip: ${d.tips.toLocaleString("vi-VN")})`}
                </div>
                <div className="w-full flex flex-col items-stretch" style={{ height: `${Math.max((d.total / maxChart) * 100, 2)}%` }}>
                  {d.purchases > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.purchases / d.total) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.02, duration: 0.4 }}
                      className="w-full bg-primary-400 rounded-t-sm"
                    />
                  )}
                  {d.tips > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.tips / d.total) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.02, duration: 0.4 }}
                      className={`w-full bg-rose-400 ${d.purchases === 0 ? 'rounded-t-sm' : ''}`}
                    />
                  )}
                  {d.total === 0 && (
                    <div className="w-full min-h-[3px] rounded-t-sm bg-gray-200" />
                  )}
                </div>
                {i % 5 === 0 && (
                  <span className="hidden text-[8px] text-gray-400 sm:block">{d.day}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Period filter */}
      <div className="flex gap-1.5">
        {([
          { value: "7d" as Period, label: "7 ngày" },
          { value: "30d" as Period, label: "30 ngày" },
          { value: "all" as Period, label: "Tất cả" },
        ]).map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-lg px-3 py-2 text-caption font-medium transition-all ${
              period === p.value
                ? "bg-primary-500 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Revenue table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-body-lg font-semibold text-gray-900">
            Lịch sử doanh thu
            {period !== "all" && (
              <span className="ml-2 text-caption font-normal text-gray-400">
                ({period === "7d" ? "7 ngày" : "30 ngày"} gần nhất — {formatXu(stats.periodRevenue)})
              </span>
            )}
          </h3>
        </div>
        {revenueHistory.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-3 text-body-sm text-gray-500">Chưa có dữ liệu doanh thu</p>
            <p className="mt-1 text-caption text-gray-400">
              Khi có người mua chương hoặc tặng xu, doanh thu sẽ hiển thị ở đây
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 text-left">
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500">Ngày</th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500">Loại</th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500">Tác phẩm</th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500">Chương</th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500 text-right">Thu nhập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {revenueHistory.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 text-body-sm text-gray-600">
                      {new Date(row.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        row.type === "tip"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-blue-50 text-blue-600"
                      }`}>
                        {row.type === "tip" ? (
                          <><GiftIcon className="h-3 w-3" /> Ủng hộ</>
                        ) : (
                          <><DocumentTextIcon className="h-3 w-3" /> Bán chương</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-body-sm font-medium text-gray-900">
                      {row.storyTitle}
                    </td>
                    <td className="px-6 py-3.5 text-body-sm text-gray-600">
                      {row.chapterTitle}
                    </td>
                    <td className="px-6 py-3.5 text-body-sm font-semibold text-emerald-600 text-right">
                      +{formatXu(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top stories */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-body-lg font-semibold text-gray-900">
            Tác phẩm có doanh thu cao nhất
          </h3>
        </div>
        {topStories.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <SparklesIcon className="mx-auto h-10 w-10 text-gray-200" />
            <p className="mt-3 text-body-sm text-gray-500">
              Chưa có dữ liệu
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {topStories.map((story: any, i: number) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-caption font-bold text-amber-600">
                  #{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-medium text-gray-900">{story.title}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-[11px] text-gray-400">
                    {story.purchases > 0 && (
                      <span className="flex items-center gap-1">
                        <DocumentTextIcon className="h-3 w-3" /> {story.purchases} chương bán
                      </span>
                    )}
                    {story.tips > 0 && (
                      <span className="flex items-center gap-1">
                        <GiftIcon className="h-3 w-3" /> {story.tips} lượt ủng hộ
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-body-sm font-semibold text-emerald-600">
                  {formatXu(story.revenue)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
