"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/AdminLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  BuildingOfficeIcon,
  GiftIcon,
  EyeIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type PeriodType = "daily" | "weekly" | "monthly" | "yearly";
type RevenuePeriod = "30d" | "90d" | "365d" | "all";

interface OverviewData {
  today: { deposits: number; coins: number; count: number };
  thisWeek: { deposits: number; coins: number; count: number };
  thisMonth: { deposits: number; coins: number; count: number; contentSpending: number; authorPayments: number; platformRevenue: number; tax: number };
  lastMonth: { deposits: number; contentSpending: number };
  allTime: { contentSpending: number; authorPayments: number; platformRevenue: number; tax: number };
  pending: { deposits: number; withdrawals: number };
  growth: { revenue: number; earnings: number };
}

interface ChartData {
  data: Array<{
    date?: string;
    week?: string;
    month?: string;
    year?: number;
    deposits: number;
    purchases: number;
    tips: number;
    views: number;
    admin: number;
    total: number;
    label: string;
  }>;
  summary: {
    totalDeposits: number;
    totalPurchases: number;
    totalTips: number;
    totalRevenue: number;
  };
}

interface RevenueByType {
  byType: Array<{
    type: string;
    label: string;
    gross: number;
    authorAmount: number;
    platformAmount: number;
    taxAmount: number;
    count: number;
    percentage: number;
  }>;
  summary: {
    totalDepositsAmount: number;
    totalDepositsCoins: number;
    depositCount: number;
    totalContentSpending: number;
    totalAuthorEarnings: number;
    totalPlatformRevenue: number;
    totalTax: number;
    referralEarnings: number;
    period: string;
  };
}

interface AuthorEarnings {
  authors: Array<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    storyCount: number;
    joinedAt: string;
    earnings: {
      purchases: number;
      tips: number;
      views: number;
      admin: number;
      total: number;
    };
  }>;
  total: number;
  page: number;
  totalPages: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function RevenueDashboard() {
  const { token } = useAdmin();
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("30d");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [revenueByType, setRevenueByType] = useState<RevenueByType | null>(null);
  const [authorEarnings, setAuthorEarnings] = useState<AuthorEarnings | null>(null);
  const [authorPage, setAuthorPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const [overviewRes, chartRes, typeRes, authorRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/revenue/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/admin/revenue/${period}?days=${period === "daily" ? 30 : period === "weekly" ? 12 : period === "monthly" ? 12 : 5}&weeks=${period === "weekly" ? 12 : 12}&months=${period === "monthly" ? 12 : 12}&years=${period === "yearly" ? 5 : 5}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/admin/revenue/by-type?period=${revenuePeriod}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/admin/revenue/authors?page=${authorPage}&limit=20&period=${revenuePeriod}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [overviewData, chartResData, typeResData, authorResData] = await Promise.all([
        overviewRes.json(),
        chartRes.json(),
        typeRes.json(),
        authorRes.json(),
      ]);

      setOverview(overviewData);
      setChartData(chartResData);
      setRevenueByType(typeResData);
      setAuthorEarnings(authorResData);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
    }
  }, [token, period, revenuePeriod, authorPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (format: "csv" | "json") => {
    if (!token) return;
    setExporting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/revenue/export?format=${format}&period=${revenuePeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (format === "csv") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `revenue-report-${revenuePeriod}-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `revenue-report-${revenuePeriod}-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (num: number) => new Intl.NumberFormat("vi-VN").format(num);
  const formatPercent = (num: number) => `${num > 0 ? "+" : ""}${num}%`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const summaryCards = overview
    ? [
        {
          label: "Hôm nay",
          value: formatCurrency(overview.today.deposits) + "đ",
          subtext: `${overview.today.count} giao dịch`,
          icon: ClockIcon,
          color: "text-blue-600 bg-blue-50",
        },
        {
          label: "Tuần này",
          value: formatCurrency(overview.thisWeek.deposits) + "đ",
          subtext: `${overview.thisWeek.count} giao dịch`,
          icon: ChartBarIcon,
          color: "text-emerald-600 bg-emerald-50",
        },
        {
          label: "Tháng này",
          value: formatCurrency(overview.thisMonth.deposits) + "đ",
          subtext: `${overview.thisMonth.count} giao dịch`,
          icon: CurrencyDollarIcon,
          color: "text-purple-600 bg-purple-50",
          trend: overview.growth.revenue,
        },
        {
          label: "Chi tiêu nội dung",
          value: formatCurrency(overview.thisMonth.contentSpending) + " xu",
          subtext: `Tác giả: ${formatCurrency(overview.thisMonth.authorPayments)} xu`,
          icon: BanknotesIcon,
          color: "text-amber-600 bg-amber-50",
        },
        {
          label: "Chờ duyệt",
          value: overview.pending.deposits + overview.pending.withdrawals,
          subtext: `Nạp: ${overview.pending.deposits} | Rút: ${overview.pending.withdrawals}`,
          icon: ClockIcon,
          color: "text-orange-600 bg-orange-50",
        },
        {
          label: "Tổng chi tiêu (all time)",
          value: formatCurrency(overview.allTime.contentSpending) + " xu",
          subtext: `Platform: ${formatCurrency(overview.allTime.platformRevenue)} xu`,
          icon: BuildingOfficeIcon,
          color: "text-indigo-600 bg-indigo-50",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading-md font-bold text-gray-900">Dashboard Doanh Thu</h2>
          <p className="mt-1 text-body-sm text-gray-500">Theo dõi và phân tích doanh thu nền tảng</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={() => handleExport("json")}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-2 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              {card.trend !== undefined && (
                <div className={`flex items-center gap-1 text-body-xs font-medium ${card.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {card.trend >= 0 ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
                  {formatPercent(card.trend)}
                </div>
              )}
            </div>
            <p className="mt-3 text-caption text-gray-500">{card.label}</p>
            <p className="mt-1 text-heading-sm font-bold text-gray-900">{card.value}</p>
            <p className="mt-0.5 text-caption text-gray-400">{card.subtext}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-heading-sm font-semibold text-gray-900">Biểu đồ Doanh Thu</h3>
            <p className="text-caption text-gray-500">Doanh thu theo thời gian</p>
          </div>
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly", "yearly"] as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-body-xs font-medium transition-colors ${
                  period === p ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p === "daily" ? "Ngày" : p === "weekly" ? "Tuần" : p === "monthly" ? "Tháng" : "Năm"}
              </button>
            ))}
          </div>
        </div>

        {chartData && chartData.data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData.data}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
              />
              <Legend />
              <Area type="monotone" dataKey="total" name="Tổng" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" />
              <Bar type="monotone" dataKey="deposits" name="Nạp tiền" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="purchases" name="Mua chương" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="tips" name="Tặng tác giả" stroke="#ec4899" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] items-center justify-center text-gray-400">
            Chưa có dữ liệu doanh thu
          </div>
        )}

        {/* Chart Summary */}
        {chartData && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-caption text-gray-500">Tổng nạp tiền</p>
              <p className="mt-1 text-heading-sm font-bold text-green-600">
                {formatCurrency(chartData.summary.totalDeposits)}đ
              </p>
            </div>
            <div className="text-center">
              <p className="text-caption text-gray-500">Mua chương</p>
              <p className="mt-1 text-heading-sm font-bold text-amber-600">
                {formatCurrency(chartData.summary.totalPurchases)} xu
              </p>
            </div>
            <div className="text-center">
              <p className="text-caption text-gray-500">Tặng tác giả</p>
              <p className="mt-1 text-heading-sm font-bold text-pink-600">
                {formatCurrency(chartData.summary.totalTips)} xu
              </p>
            </div>
            <div className="text-center">
              <p className="text-caption text-gray-500">Tổng doanh thu</p>
              <p className="mt-1 text-heading-sm font-bold text-blue-600">
                {formatCurrency(chartData.summary.totalRevenue)} xu
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Revenue by Type & Author Earnings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by Type */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-heading-sm font-semibold text-gray-900">Phân tích theo Loại</h3>
              <p className="text-caption text-gray-500">Doanh thu theo nguồn</p>
            </div>
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value as RevenuePeriod)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-body-xs focus:border-red-500 focus:outline-none"
            >
              <option value="30d">30 ngày</option>
              <option value="90d">90 ngày</option>
              <option value="365d">365 ngày</option>
              <option value="all">Tất cả</option>
            </select>
          </div>

          {revenueByType && (
            <>
              <div className="mb-6 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={revenueByType.byType.filter((t) => t.gross > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="gross"
                      nameKey="label"
                    >
                      {revenueByType.byType.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {revenueByType.byType.map((type, idx) => (
                  <div key={type.type} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <div>
                        <p className="text-body-sm font-medium text-gray-900">{type.label}</p>
                        <p className="text-caption text-gray-500">{type.count} giao dịch</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-body-sm font-semibold text-gray-900">{formatCurrency(type.gross)} xu</p>
                      {type.percentage > 0 && (
                        <p className="text-caption text-gray-400">{type.percentage}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption text-gray-500">Tổng nạp xu</p>
                    <p className="text-body-sm font-semibold text-gray-900">
                      {formatCurrency(revenueByType.summary.totalDepositsAmount)}đ
                    </p>
                    <p className="text-caption text-gray-400">
                      {formatCurrency(revenueByType.summary.totalDepositsCoins)} xu
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-gray-500">Chi tiêu nội dung</p>
                    <p className="text-body-sm font-semibold text-gray-900">
                      {formatCurrency(revenueByType.summary.totalContentSpending)} xu
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-gray-500">Thu nhập tác giả</p>
                    <p className="text-body-sm font-semibold text-green-600">
                      {formatCurrency(revenueByType.summary.totalAuthorEarnings)} xu
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-gray-500">Doanh thu platform</p>
                    <p className="text-body-sm font-semibold text-blue-600">
                      {formatCurrency(revenueByType.summary.totalPlatformRevenue)} xu
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Top Authors */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-heading-sm font-semibold text-gray-900">Thu nhập Tác giả</h3>
              <p className="text-caption text-gray-500">Top tác giả theo doanh thu</p>
            </div>
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value as RevenuePeriod)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-body-xs focus:border-red-500 focus:outline-none"
            >
              <option value="30d">30 ngày</option>
              <option value="90d">90 ngày</option>
              <option value="365d">365 ngày</option>
              <option value="all">Tất cả</option>
            </select>
          </div>

          {authorEarnings && (
            <>
              <div className="space-y-3">
                {authorEarnings.authors.slice(0, 10).map((author, idx) => (
                  <div key={author.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-body-xs font-bold text-red-600">
                      {idx + 1}
                    </div>
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                      {author.image ? (
                        <img src={author.image} alt={author.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <UserGroupIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-gray-900">{author.name}</p>
                      <p className="text-caption text-gray-500">{author.storyCount} truyện</p>
                    </div>
                    <div className="text-right">
                      <p className="text-body-sm font-semibold text-green-600">
                        {formatCurrency(author.earnings.total)} xu
                      </p>
                      <div className="flex gap-2 text-caption text-gray-400">
                        <span title="Mua chương">
                          <CurrencyDollarIcon className="inline h-3 w-3" /> {formatCurrency(author.earnings.purchases)}
                        </span>
                        <span title="Tặng">
                          <GiftIcon className="inline h-3 w-3" /> {formatCurrency(author.earnings.tips)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {authorEarnings.authors.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <UserGroupIcon className="h-12 w-12" />
                  <p className="mt-2 text-body-sm">Chưa có dữ liệu thu nhập tác giả</p>
                </div>
              )}

              {/* Pagination */}
              {authorEarnings.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <p className="text-caption text-gray-500">
                    Trang {authorEarnings.page} / {authorEarnings.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAuthorPage((p) => Math.max(1, p - 1))}
                      disabled={authorPage === 1}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-body-xs disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setAuthorPage((p) => Math.min(authorEarnings.totalPages, p + 1))}
                      disabled={authorPage === authorEarnings.totalPages}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-body-xs disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detailed Revenue Table */}
      {authorEarnings && authorEarnings.authors.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-heading-sm font-semibold text-gray-900">Bảng chi tiết Thu nhập Tác giả</h3>
          <p className="mt-1 text-caption text-gray-500">Danh sách đầy đủ thu nhập theo tác giả</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-body-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Tác giả</th>
                  <th className="pb-3 font-medium text-right">Mua chương</th>
                  <th className="pb-3 font-medium text-right">Tặng</th>
                  <th className="pb-3 font-medium text-right">Lượt xem</th>
                  <th className="pb-3 font-medium text-right">Admin</th>
                  <th className="pb-3 font-medium text-right">Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {authorEarnings.authors.map((author, idx) => (
                  <tr key={author.id} className="hover:bg-gray-50">
                    <td className="py-3 text-gray-400">{(authorPage - 1) * 20 + idx + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                          {author.image ? (
                            <img src={author.image} alt={author.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <UserGroupIcon className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{author.name}</p>
                          <p className="text-caption text-gray-400">{author.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right text-green-600">{formatCurrency(author.earnings.purchases)}</td>
                    <td className="py-3 text-right text-pink-600">{formatCurrency(author.earnings.tips)}</td>
                    <td className="py-3 text-right text-blue-600">{formatCurrency(author.earnings.views)}</td>
                    <td className="py-3 text-right text-orange-600">{formatCurrency(author.earnings.admin)}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(author.earnings.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
