"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/components/AdminLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  UsersIcon,
  BookOpenIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function AdminDashboard() {
  const { token } = useAdmin();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, [token]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

  const cards = [
    { label: "Người dùng", value: stats.totalUsers, icon: UsersIcon, color: "text-blue-600 bg-blue-50", href: "/admin/users" },
    { label: "Truyện", value: stats.totalStories, icon: BookOpenIcon, color: "text-emerald-600 bg-emerald-50", href: "/admin/stories" },
    { label: "Chương", value: stats.totalChapters, icon: DocumentTextIcon, color: "text-purple-600 bg-purple-50", href: null },
    { label: "Tổng nạp (đã duyệt)", value: formatVND(stats.totalRevenue) + "đ", icon: CurrencyDollarIcon, color: "text-amber-600 bg-amber-50", href: "/admin/deposits" },
  ];

  const alerts = [
    { label: "Yêu cầu nạp xu chờ duyệt", count: stats.pendingDeposits, href: "/admin/deposits", color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "Yêu cầu rút tiền chờ duyệt", count: stats.pendingWithdrawals, href: "/admin/withdrawals", color: "text-red-600 bg-red-50 border-red-200" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-bold text-gray-900">Tổng quan hệ thống</h2>
        <p className="mt-1 text-body-sm text-gray-500">Quản lý toàn bộ dữ liệu VStory</p>
      </div>

      {/* Alerts */}
      {alerts.filter((a) => a.count > 0).length > 0 && (
        <div className="space-y-3">
          {alerts.filter((a) => a.count > 0).map((alert, i) => (
            <Link
              key={i}
              href={alert.href}
              className={`flex items-center gap-3 rounded-xl border px-5 py-4 transition-all hover:shadow-md ${alert.color}`}
            >
              <ClockIcon className="h-6 w-6 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-body-sm font-semibold">{alert.label}</p>
              </div>
              <span className="text-heading-sm font-bold">{alert.count}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card, i) => {
          const inner = (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className={`inline-flex rounded-xl p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-heading-sm font-bold text-gray-900">{card.value}</p>
              <p className="mt-0.5 text-caption text-gray-500">{card.label}</p>
            </div>
          );
          return card.href ? (
            <Link key={i} href={card.href}>{inner}</Link>
          ) : (
            <div key={i}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
