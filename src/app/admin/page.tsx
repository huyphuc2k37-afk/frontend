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
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [sendingNotice, setSendingNotice] = useState(false);
  const [noticeResult, setNoticeResult] = useState<string | null>(null);
  const [resettingRevenue, setResettingRevenue] = useState(false);
  const [revenueResult, setRevenueResult] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats({ totalUsers: 0, totalStories: 0, totalChapters: 0, totalRevenue: 0, totalWithdrawn: 0, pendingDeposits: 0, _error: true }));
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

      {/* Broadcast notification */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-body-lg font-semibold text-gray-900">Gửi thông báo đến mọi người</h3>
        <p className="mt-1 text-body-sm text-gray-500">Thông báo sẽ xuất hiện ở icon chuông của người dùng.</p>

        <div className="mt-4 grid gap-3">
          <input
            value={noticeTitle}
            onChange={(e) => setNoticeTitle(e.target.value)}
            placeholder="Tiêu đề"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-body-sm text-gray-900 placeholder-gray-400 focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-200"
          />
          <textarea
            value={noticeMessage}
            onChange={(e) => setNoticeMessage(e.target.value)}
            placeholder="Nội dung thông báo"
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-body-sm text-gray-900 placeholder-gray-400 focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-200"
          />
          <div className="flex items-center gap-3">
            <button
              disabled={!token || sendingNotice || !noticeTitle.trim() || !noticeMessage.trim()}
              onClick={async () => {
                if (!token) return;
                setSendingNotice(true);
                setNoticeResult(null);
                try {
                  const res = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      title: noticeTitle.trim(),
                      message: noticeMessage.trim(),
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setNoticeResult(data?.error || "Gửi thông báo thất bại");
                  } else {
                    setNoticeResult(`Đã gửi thông báo (${data?.count ?? 0} người).`);
                    setNoticeTitle("");
                    setNoticeMessage("");
                  }
                } catch {
                  setNoticeResult("Gửi thông báo thất bại");
                } finally {
                  setSendingNotice(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sendingNotice ? "Đang gửi..." : "Gửi thông báo"}
            </button>

            {noticeResult && <p className="text-body-sm text-gray-600">{noticeResult}</p>}
          </div>
        </div>
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

      {/* Revenue management */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-body-lg font-semibold text-gray-900">Quản lý doanh thu</h3>
        <p className="mt-1 text-body-sm text-gray-500">Xóa dữ liệu nạp xu test. Thao tác này không hoàn xu đã cộng.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            disabled={resettingRevenue}
            onClick={async () => {
              if (!token) return;
              if (!confirm("Bạn có chắc muốn xóa TẤT CẢ deposit đã duyệt? Thao tác này không thể hoàn tác.")) return;
              setResettingRevenue(true);
              setRevenueResult(null);
              try {
                const res = await fetch(`${API_BASE_URL}/api/admin/stats/revenue`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ action: "reset-all" }),
                });
                const data = await res.json();
                if (res.ok) {
                  setRevenueResult(data.message || "Đã xóa thành công");
                  // Re-fetch stats
                  const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (statsRes.ok) setStats(await statsRes.json());
                } else {
                  setRevenueResult(data.error || "Lỗi");
                }
              } catch {
                setRevenueResult("Lỗi kết nối server");
              }
              setResettingRevenue(false);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-body-sm font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-60"
          >
            {resettingRevenue ? "Đang xóa..." : "Xóa tất cả deposit đã duyệt"}
          </button>
          {revenueResult && <p className="text-body-sm text-gray-600">{revenueResult}</p>}
        </div>
        <p className="mt-3 text-caption text-gray-400">
          Lưu ý: Nếu muốn trừ xu các tài khoản đã test, vào trang Người dùng để điều chỉnh xu từng tài khoản.
        </p>
      </div>
    </div>
  );
}
