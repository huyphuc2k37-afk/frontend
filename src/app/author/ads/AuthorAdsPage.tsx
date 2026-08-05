"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  BanknotesIcon,
  EyeIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import StudioLayout from "@/components/StudioLayout";
import { useStudio } from "@/components/StudioLayout";
import { API_BASE_URL } from "@/lib/api";

type Period = "7d" | "30d" | "all";

interface Story {
  id: string;
  title: string;
  slug: string;
  views: number;
  latestChapter: number;
}

interface Earning {
  id: string;
  storyId: string;
  storyTitle: string;
  storySlug: string;
  chapterNumber: number;
  chapterId: string;
  impressions: number;
  earnings: number;
  createdAt: string;
}

interface TopStory {
  storyId: string;
  title: string;
  slug: string;
  impressions: number;
  earnings: number;
}

interface DailyData {
  date: string;
  day: string;
  impressions: number;
  earnings: number;
}

export default function AuthorAdsPage() {
  const { token } = useStudio();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  // Config state
  const [enabled, setEnabled] = useState(false);
  const [adFrequency, setAdFrequency] = useState(3);
  const [updating, setUpdating] = useState(false);

  // Stats state
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(0);
  const [periodEarnings, setPeriodEarnings] = useState(0);
  const [periodImpressions, setPeriodImpressions] = useState(0);
  const [revenueShare, setRevenueShare] = useState(0.7);
  const [stories, setStories] = useState<Story[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [dailyChart, setDailyChart] = useState<DailyData[]>([]);
  const [topStories, setTopStories] = useState<TopStory[]>([]);

  // Withdrawal modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankHolder, setBankHolder] = useState("");

  const fetchConfig = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/author/ads/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEnabled(data.enabled);
        setAdFrequency(data.adFrequency);
        setRevenueShare(data.revenueShare);
        setTotalEarnings(data.totalEarnings);
        setPendingWithdrawal(data.pendingWithdrawal);
        setStories(data.stories || []);
      }
    } catch {}
  }, [token]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/author/ads/stats?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setTotalEarnings(data.totalEarnings);
        setPendingWithdrawal(data.pendingWithdrawal);
        setPeriodEarnings(data.periodEarnings);
        setPeriodImpressions(data.periodImpressions);
        setRevenueShare(data.revenueShare);
        setDailyChart(data.dailyChart || []);
        setTopStories(data.topStories || []);
      }
    } catch {}
  }, [token, period]);

  const fetchEarnings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/author/ads/earnings?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setEarnings(data.earnings || []);
      }
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([fetchConfig(), fetchStats(), fetchEarnings()]).finally(() =>
      setLoading(false)
    );
  }, [token, fetchConfig, fetchStats, fetchEarnings]);

  const handleToggleEnabled = async () => {
    if (!token) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/author/ads/config`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (res.ok) {
        setEnabled(!enabled);
      }
    } catch {}
    setUpdating(false);
  };

  const handleUpdateFrequency = async (newFrequency: number) => {
    if (!token) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/author/ads/config`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adFrequency: newFrequency }),
      });
      if (res.ok) {
        setAdFrequency(newFrequency);
      }
    } catch {}
    setUpdating(false);
  };

  const handleWithdraw = async () => {
    if (!token) return;
    if (!bankName || !bankAccount || !bankHolder) {
      setWithdrawError("Vui lòng điền đầy đủ thông tin ngân hàng");
      return;
    }

    setWithdrawing(true);
    setWithdrawError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/author/ads/withdraw`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bankName, bankAccount, bankHolder }),
      });
      const data = await res.json();

      if (!res.ok) {
        setWithdrawError(data.error || "Có lỗi xảy ra");
        return;
      }

      setWithdrawSuccess(true);
      setShowWithdrawModal(false);
      // Refresh data
      await fetchConfig();
      await fetchStats();
      // Reset form
      setBankName("");
      setBankAccount("");
      setBankHolder("");
    } catch {
      setWithdrawError("Có lỗi xảy ra, vui lòng thử lại");
    }
    setWithdrawing(false);
  };

  const formatXu = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + " xu";

  const availableBalance = totalEarnings - pendingWithdrawal;
  const maxChart = Math.max(...dailyChart.map((d) => d.earnings), 1);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <StudioLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading-md font-bold text-gray-900">
            Quảng cáo tác giả
          </h2>
          <p className="mt-1 text-body-sm text-gray-500">
            Hiển thị quảng cáo trên truyện để kiếm thêm thu nhập
          </p>
        </div>
        {availableBalance > 0 && (
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-500 px-5 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-emerald-600"
          >
            <BanknotesIcon className="h-4 w-4" />
            Rút {formatXu(availableBalance)}
          </button>
        )}
      </div>

      {/* Ad Configuration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-primary-50 p-2.5">
            <SparklesIcon className="h-6 w-6 text-primary-500" />
          </div>
          <div>
            <h3 className="text-body-lg font-bold text-gray-900">
              Cài đặt quảng cáo
            </h3>
            <p className="text-caption text-gray-500">
              Bật quảng cáo để hiển thị trên truyện của bạn
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div>
              <p className="font-semibold text-gray-900">Bật quảng cáo</p>
              <p className="text-caption text-gray-500">
                Cho phép hiển thị quảng cáo trên các chương truyện
              </p>
            </div>
            <button
              onClick={handleToggleEnabled}
              disabled={updating}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                enabled ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Ad Frequency */}
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Tần suất quảng cáo</p>
                <p className="text-caption text-gray-500">
                  Hiển thị quảng cáo mỗi N chương
                </p>
              </div>
              <span className="text-heading-sm font-bold text-primary-600">
                {adFrequency} chương
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 10].map((freq) => (
                <button
                  key={freq}
                  onClick={() => handleUpdateFrequency(freq)}
                  disabled={updating}
                  className={`flex-1 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors ${
                    adFrequency === freq
                      ? "bg-primary-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Revenue Share Info */}
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">
                Tỷ lệ nhận thu nhập: {(revenueShare * 100).toFixed(0)}%
              </p>
              <p className="text-caption text-emerald-700">
                Bạn nhận {(revenueShare * 100).toFixed(0)}% doanh thu từ quảng cáo
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Tổng thu nhập",
            value: formatXu(totalEarnings),
            icon: CurrencyDollarIcon,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Chờ rút",
            value: formatXu(pendingWithdrawal),
            icon: BanknotesIcon,
            color: "text-orange-600 bg-orange-50",
          },
          {
            label: "Lượt hiển thị",
            value: periodImpressions.toLocaleString("vi-VN"),
            icon: EyeIcon,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Kỳ này",
            value: formatXu(periodEarnings),
            icon: ArrowTrendingUpIcon,
            color: "text-emerald-600 bg-emerald-50",
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

      {/* Revenue Chart */}
      {dailyChart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-primary-500" />
              <h3 className="text-body-lg font-bold text-gray-900">
                Thu nhập quảng cáo
              </h3>
            </div>
            <div className="flex gap-1.5">
              {([
                { value: "7d" as Period, label: "7 ngày" },
                { value: "30d" as Period, label: "30 ngày" },
                { value: "all" as Period, label: "Tất cả" },
              ]).map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`rounded-lg px-3 py-1.5 text-caption font-medium transition-all ${
                    period === p.value
                      ? "bg-primary-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div
            className="mt-6 flex items-end gap-1"
            style={{ height: 160 }}
          >
            {dailyChart.map((d, i) => (
              <div
                key={i}
                className="group relative flex flex-1 flex-col items-center gap-1"
              >
                <div className="pointer-events-none absolute -top-12 hidden rounded-lg bg-gray-900 px-2 py-1 text-[10px] text-white shadow-lg group-hover:block whitespace-nowrap z-10">
                  {d.day}: {formatXu(d.earnings)} ({d.impressions} lượt)
                </div>
                <div
                  className="w-full rounded-t-sm bg-emerald-400 transition-all"
                  style={{
                    height: `${Math.max((d.earnings / maxChart) * 100, 2)}%`,
                  }}
                />
                {i % 5 === 0 && (
                  <span className="hidden text-[8px] text-gray-400 sm:block">
                    {d.day}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stories with Ads */}
      {stories.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-body-lg font-semibold text-gray-900">
              Truyện có quảng cáo
            </h3>
            <p className="text-caption text-gray-500 mt-0.5">
              {enabled ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Quảng cáo đang bật
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-400">
                  <XCircleIcon className="h-3.5 w-3.5" />
                  Quảng cáo đang tắt
                </span>
              )}
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {stories.map((story) => (
              <div
                key={story.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="rounded-lg bg-gray-100 p-2">
                  <BookOpenIcon className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-gray-900 truncate">
                    {story.title}
                  </p>
                  <p className="text-caption text-gray-400">
                    {story.views.toLocaleString("vi-VN")} lượt đọc ·{" "}
                    {story.latestChapter} chương
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-caption text-gray-500">
                    Mỗi {adFrequency} chương
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Stories */}
      {topStories.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-body-lg font-semibold text-gray-900">
              Truyện có thu nhập cao nhất
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {topStories.map((story, i) => (
              <div
                key={story.storyId}
                className="flex items-center gap-4 px-6 py-4"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-caption font-bold text-emerald-600">
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-gray-900 truncate">
                    {story.title}
                  </p>
                  <p className="text-caption text-gray-400">
                    {story.impressions.toLocaleString("vi-VN")} lượt hiển thị
                  </p>
                </div>
                <p className="text-body-sm font-semibold text-emerald-600">
                  {formatXu(story.earnings)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Earnings History */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-body-lg font-semibold text-gray-900">
            Lịch sử thu nhập
          </h3>
        </div>
        {earnings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-3 text-body-sm text-gray-500">
              Chưa có dữ liệu thu nhập
            </p>
            <p className="mt-1 text-caption text-gray-400">
              Khi có người xem quảng cáo trên truyện, thu nhập sẽ hiển thị ở
              đây
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 text-left">
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500">
                    Truyện
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500">
                    Chương
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500 text-right">
                    Lượt hiển thị
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold text-gray-500 text-right">
                    Thu nhập
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {earnings.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 text-body-sm text-gray-600">
                      {new Date(row.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-3.5 text-body-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {row.storyTitle}
                    </td>
                    <td className="px-6 py-3.5 text-body-sm text-gray-600">
                      #{row.chapterNumber}
                    </td>
                    <td className="px-6 py-3.5 text-body-sm text-gray-600 text-right">
                      {row.impressions.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-3.5 text-body-sm font-semibold text-emerald-600 text-right">
                      +{formatXu(row.earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Success Modal */}
      {withdrawSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-heading-md font-bold text-gray-900">
                Yêu cầu rút tiền thành công!
              </h3>
              <p className="mt-2 text-body-sm text-gray-500">
                Yêu cầu rút tiền của bạn đã được gửi đi. Chúng tôi sẽ xử lý
                trong 1-3 ngày làm việc.
              </p>
              <button
                onClick={() => setWithdrawSuccess(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-body-sm font-semibold text-white hover:bg-emerald-600"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-heading-md font-bold text-gray-900">
              Rút tiền từ quảng cáo
            </h3>
            <p className="mt-1 text-body-sm text-gray-500">
              Số dư khả dụng: <span className="font-semibold text-emerald-600">{formatXu(availableBalance)}</span>
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-caption font-medium text-gray-700 mb-1">
                  Tên ngân hàng
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="VD: Vietcombank"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-caption font-medium text-gray-700 mb-1">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="VD: 1234567890"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-caption font-medium text-gray-700 mb-1">
                  Tên chủ tài khoản
                </label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder="VD: NGUYEN VAN A"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            {withdrawError && (
              <p className="mt-4 text-caption text-red-600">{withdrawError}</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-body-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {withdrawing ? "Đang xử lý..." : "Xác nhận rút tiền"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </StudioLayout>
  );
}
