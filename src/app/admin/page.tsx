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
  EyeIcon,
  GiftIcon,
  TrophyIcon,
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
  const [storyStats, setStoryStats] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() =>
        setStats({
          totalUsers: 0,
          totalStories: 0,
          totalChapters: 0,
          totalRevenue: 0,
          approvedDepositsAmount: 0,
          grossContentRevenue: 0,
          platformGrossWallet: 0,
          platformNetIncome: 0,
          taxTotal: 0,
          authorNetPaid: 0,
          totalWithdrawn: 0,
          pendingDeposits: 0,
          pendingWithdrawals: 0,
          totalQuestXu: 0,
          totalViewEarningsXu: 0,
          totalAdminCreditXu: 0,
          totalAuthorEarnings: 0,
          totalXuInCirculation: 0,
          totalViews: 0,
          _error: true,
        })
      );
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/admin/stories/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStoryStats)
      .catch(() => setStoryStats(null));
  }, [token]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

  const approvedDepositsAmount = stats.approvedDepositsAmount ?? stats.totalRevenue ?? 0;
  const grossContentRevenue = stats.grossContentRevenue ?? 0;
  const platformNetIncome = stats.platformNetIncome ?? 0;
  const totalQuestXu = stats.totalQuestXu ?? 0;
  const totalViewEarningsXu = stats.totalViewEarningsXu ?? 0;
  const totalAdminCreditXu = stats.totalAdminCreditXu ?? 0;
  const totalAuthorEarnings = stats.totalAuthorEarnings ?? 0;
  const totalXuInCirculation = stats.totalXuInCirculation ?? 0;
  const totalViews = stats.totalViews ?? 0;
  const taxTotal = stats.taxTotal ?? 0;
  const authorNetPaid = stats.authorNetPaid ?? 0;

  const cards = [
    { label: "Người dùng", value: stats.totalUsers, icon: UsersIcon, color: "text-blue-600 bg-blue-50", href: "/admin/users" },
    { label: "Truyện", value: stats.totalStories, icon: BookOpenIcon, color: "text-emerald-600 bg-emerald-50", href: "/admin/stories" },
    { label: "Chương", value: stats.totalChapters, icon: DocumentTextIcon, color: "text-purple-600 bg-purple-50", href: null },
    { label: "Tổng lượt xem", value: new Intl.NumberFormat("vi-VN").format(totalViews), icon: EyeIcon, color: "text-cyan-600 bg-cyan-50", href: null },
    { label: "Tổng xu đang lưu hành", value: formatVND(totalXuInCirculation) + " xu", icon: BanknotesIcon, color: "text-yellow-600 bg-yellow-50", href: null },
    { label: "Tổng nạp (đã duyệt)", value: formatVND(approvedDepositsAmount) + "đ", icon: CurrencyDollarIcon, color: "text-amber-600 bg-amber-50", href: "/admin/deposits" },
    { label: "Doanh thu nội dung (mua + tặng)", value: formatVND(grossContentRevenue) + " xu", icon: CurrencyDollarIcon, color: "text-indigo-600 bg-indigo-50", href: null },
    { label: "Tác giả nhận (65%)", value: formatVND(authorNetPaid) + " xu", icon: CurrencyDollarIcon, color: "text-green-600 bg-green-50", href: null },
    { label: "Nền tảng giữ (30%)", value: formatVND(platformNetIncome) + " xu", icon: CurrencyDollarIcon, color: "text-emerald-600 bg-emerald-50", href: null },
    { label: "Thuế (5%)", value: formatVND(taxTotal) + " xu", icon: CurrencyDollarIcon, color: "text-red-600 bg-red-50", href: null },
    { label: "Xu admin cộng tác giả", value: formatVND(totalAdminCreditXu) + " xu", icon: BanknotesIcon, color: "text-rose-600 bg-rose-50", href: null },
    { label: "Xu từ nhiệm vụ (đã phát)", value: formatVND(totalQuestXu) + " xu", icon: TrophyIcon, color: "text-orange-600 bg-orange-50", href: null },
    { label: "Xu từ views (tác giả)", value: formatVND(totalViewEarningsXu) + " xu", icon: GiftIcon, color: "text-teal-600 bg-teal-50", href: null },
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

      {/* Story Origin Stats */}
      {storyStats && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-body-lg font-semibold text-gray-900">Thống kê truyện</h3>
          <p className="mt-1 text-body-sm text-gray-500">Phân chia theo loại truyện sáng tác và dịch</p>

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-caption text-blue-600">Tổng truyện</p>
              <p className="mt-1 text-heading-md font-bold text-blue-700">{storyStats.overview?.total || 0}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-caption text-emerald-600">Sáng tác</p>
              <p className="mt-1 text-heading-md font-bold text-emerald-700">{storyStats.overview?.original || 0}</p>
              <p className="mt-0.5 text-caption text-emerald-500">
                {((storyStats.overview?.original || 0) / (storyStats.overview?.total || 1) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-caption text-purple-600">Truyện dịch</p>
              <p className="mt-1 text-heading-md font-bold text-purple-700">{storyStats.overview?.translated || 0}</p>
              <p className="mt-0.5 text-caption text-purple-500">
                {((storyStats.overview?.translated || 0) / (storyStats.overview?.total || 1) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-caption text-amber-600">Chờ duyệt</p>
              <p className="mt-1 text-heading-md font-bold text-amber-700">{storyStats.overview?.pending || 0}</p>
            </div>
          </div>

          {/* Top Translators */}
          {storyStats.topTranslators && storyStats.topTranslators.length > 0 && (
            <div className="mt-6">
              <h4 className="text-body-sm font-semibold text-gray-700">Top dịch giả</h4>
              <div className="mt-2 space-y-2">
                {storyStats.topTranslators.slice(0, 5).map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div>
                      <span className="text-body-sm font-medium text-gray-800">{t.name}</span>
                      <span className="ml-2 text-caption text-gray-500">{t.storyCount} truyện</span>
                    </div>
                    <span className="text-caption text-gray-500">
                      {t.totalViews >= 1000 ? `${(t.totalViews / 1000).toFixed(1)}K views` : `${t.totalViews} views`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Stats */}
          {storyStats.monthlyStats && storyStats.monthlyStats.length > 0 && (
            <div className="mt-6">
              <h4 className="text-body-sm font-semibold text-gray-700">Biến động 6 tháng gần nhất</h4>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-body-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 text-left font-medium text-gray-500">Tháng</th>
                      <th className="py-2 text-right font-medium text-gray-500">Sáng tác</th>
                      <th className="py-2 text-right font-medium text-gray-500">Dịch</th>
                      <th className="py-2 text-right font-medium text-gray-500">Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storyStats.monthlyStats.map((m: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">{m.month}</td>
                        <td className="py-2 text-right text-emerald-600">{m.original}</td>
                        <td className="py-2 text-right text-purple-600">{m.translated}</td>
                        <td className="py-2 text-right font-medium text-gray-800">{m.original + m.translated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Link
            href="/admin/stories"
            className="mt-4 inline-block text-body-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Xem danh sách truyện →
          </Link>
        </div>
      )}

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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
