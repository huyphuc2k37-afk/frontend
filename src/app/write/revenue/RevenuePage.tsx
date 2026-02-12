"use client";

import { useState } from "react";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  DocumentTextIcon,
  EyeIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { useStudio } from "@/components/StudioLayout";
import Link from "next/link";

type Period = "7d" | "30d" | "all";

export default function RevenuePage() {
  const { profile } = useStudio();
  const [period, setPeriod] = useState<Period>("30d");

  // TODO: Fetch from API
  const stats = {
    totalRevenue: 0,
    thisMonth: 0,
    pendingWithdraw: 0,
    totalChaptersSold: 0,
  };

  const revenueHistory: { date: string; story: string; chapters: number; amount: number; reads: number }[] = [];

  const topStories: { title: string; revenue: number; chapters: number; views: number }[] = [];

  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + " xu";

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
            value: formatVND(stats.totalRevenue),
            icon: CurrencyDollarIcon,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Tháng này",
            value: formatVND(stats.thisMonth),
            icon: ArrowTrendingUpIcon,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Có thể rút",
            value: formatVND(stats.pendingWithdraw),
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
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className={`inline-flex rounded-xl p-2.5 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-heading-sm font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="mt-0.5 text-caption text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

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
          </h3>
        </div>
        {revenueHistory.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-3 text-body-sm text-gray-500">Chưa có dữ liệu doanh thu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 text-left">
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500">Ngày</th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500">Tác phẩm</th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500 text-center">Chương bán</th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500 text-center">Lượt đọc</th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {revenueHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 text-body-sm text-gray-600">{row.date}</td>
                    <td className="px-6 py-3.5 text-body-sm font-medium text-gray-900">{row.story}</td>
                    <td className="px-6 py-3.5 text-body-sm text-gray-600 text-center">{row.chapters}</td>
                    <td className="px-6 py-3.5 text-body-sm text-gray-600 text-center">{row.reads}</td>
                    <td className="px-6 py-3.5 text-body-sm font-semibold text-emerald-600 text-right">
                      {formatVND(row.amount)}
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
        <div className="divide-y divide-gray-50">
          {topStories.map((story, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-caption font-bold text-amber-600">
                #{i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body-sm font-medium text-gray-900">{story.title}</p>
                <div className="mt-0.5 flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="h-3 w-3" /> {story.chapters} chương bán
                  </span>
                  <span className="flex items-center gap-1">
                    <EyeIcon className="h-3 w-3" /> {story.views} lượt đọc
                  </span>
                </div>
              </div>
              <p className="text-body-sm font-semibold text-emerald-600">
                {formatVND(story.revenue)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
