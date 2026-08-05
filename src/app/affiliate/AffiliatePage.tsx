"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authFetch } from "@/lib/api";
import {
  LinkIcon,
  CursorArrowRaysIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TrophyIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

interface AffiliateLink {
  id: string;
  code: string;
  destination: string;
  targetId: string | null;
  targetTitle: string | null;
  clickCount: number;
  conversionCount: number;
  isActive: boolean;
  createdAt: string;
}

interface AffiliateEarning {
  id: string;
  action: string;
  commission: number;
  description: string | null;
  createdAt: string;
  referralUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  link: {
    code: string;
    destination: string;
    targetTitle: string | null;
  } | null;
}

interface AffiliateStats {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  totalLinks: number;
  totalReferrals: number;
  conversionRate: string;
  dailyEarnings: Record<string, number>;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  totalEarnings: number;
  totalActions: number;
}

type TabType = "dashboard" | "links" | "earnings" | "leaderboard";

export default function AffiliatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = (session as any)?.accessToken as string | undefined;

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ destination: "story", targetId: "" });
  const [creating, setCreating] = useState(false);

  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch("/api/affiliate/stats", token);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, [token]);

  const fetchLinks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch("/api/affiliate/links", token);
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error("Error fetching links:", err);
    }
  }, [token]);

  const fetchEarnings = useCallback(async (page = 1) => {
    if (!token) return;
    try {
      const res = await authFetch(`/api/affiliate/earnings?page=${page}&limit=20`, token);
      if (res.ok) {
        const data = await res.json();
        setEarnings(data.earnings || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch (err) {
      console.error("Error fetching earnings:", err);
    }
  }, [token]);

  const fetchLeaderboard = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch("/api/affiliate/leaderboard?limit=10", token);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  }, [token]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchLinks(), fetchEarnings(), fetchLeaderboard()]);
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchLinks, fetchEarnings, fetchLeaderboard]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (token) fetchAllData();
  }, [token, status, router, fetchAllData]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCreateLink = async () => {
    if (!token) return;
    if (createForm.destination === "story" && !createForm.targetId) {
      setToast({ text: "Vui lòng nhập ID truyện", type: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await authFetch("/api/affiliate/create-link", token, {
        method: "POST",
        body: JSON.stringify({
          destination: createForm.destination,
          targetId: createForm.targetId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ text: "Tạo liên kết thành công!", type: "success" });
        setShowCreateModal(false);
        setCreateForm({ destination: "story", targetId: "" });
        fetchLinks();
        fetchStats();
      } else {
        setToast({ text: data.error || "Không thể tạo liên kết", type: "error" });
      }
    } catch {
      setToast({ text: "Lỗi kết nối server", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!token) return;
    if (!confirm("Bạn có chắc muốn xóa liên kết này?")) return;
    try {
      const res = await authFetch(`/api/affiliate/link/${linkId}`, token, { method: "DELETE" });
      if (res.ok) {
        setToast({ text: "Đã xóa liên kết", type: "success" });
        fetchLinks();
        fetchStats();
      } else {
        const data = await res.json();
        setToast({ text: data.error || "Không thể xóa liên kết", type: "error" });
      }
    } catch {
      setToast({ text: "Lỗi kết nối server", type: "error" });
    }
  };

  const copyToClipboard = async (code: string) => {
    const url = `${window.location.origin}/api/affiliate/track/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(code);
      setToast({ text: "Đã copy liên kết!", type: "success" });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setToast({ text: "Không thể copy", type: "error" });
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      signup: "Đăng ký",
      first_purchase: "Nạp xu đầu",
      view_milestone: "Mốc xem",
      referral_read: "Đọc chương",
    };
    return labels[action] || action;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Tổng quan", icon: ChartBarIcon },
    { id: "links", label: "Liên kết", icon: LinkIcon },
    { id: "earnings", label: "Thu nhập", icon: CurrencyDollarIcon },
    { id: "leaderboard", label: "Bảng xếp hạng", icon: TrophyIcon },
  ];

  // Loading state
  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <main className="section-container min-h-screen py-8">
          <div className="mx-auto max-w-5xl">
            <div className="animate-pulse space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-gray-200" />
              <div className="mx-auto h-8 w-48 rounded-lg bg-gray-200" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-gray-200" />
                ))}
              </div>
              <div className="h-64 rounded-2xl bg-gray-200" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="section-container min-h-screen py-8">
        <div className="mx-auto max-w-5xl">
          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${
                  toast.type === "success"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircleSolid className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 flex-shrink-0 text-red-500" />
                )}
                <span
                  className={`text-body-sm font-medium ${
                    toast.type === "success" ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {toast.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200/50">
              <LinkIcon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-heading-lg font-bold text-gray-900">Affiliate</h1>
            <p className="mt-1 text-body-sm text-gray-500">
              Kiếm xu bằng cách giới thiệu bạn bè đến VStory
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl bg-gray-100 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-body-sm font-medium transition-all sm:flex-none ${
                    activeTab === tab.id
                      ? "bg-white shadow-sm text-violet-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && stats && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Stats Cards */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={CursorArrowRaysIcon}
                  label="Tổng clicks"
                  value={stats.totalClicks.toLocaleString()}
                  gradient="from-blue-500 to-cyan-500"
                />
                <StatCard
                  icon={UsersIcon}
                  label="Người giới thiệu"
                  value={stats.totalReferrals.toLocaleString()}
                  gradient="from-emerald-500 to-teal-500"
                />
                <StatCard
                  icon={CurrencyDollarIcon}
                  label="Tổng thu nhập"
                  value={stats.totalEarnings.toLocaleString()}
                  gradient="from-amber-500 to-orange-500"
                />
                <StatCard
                  icon={ArrowTrendingUpIcon}
                  label="Tháng này"
                  value={stats.thisMonthEarnings.toLocaleString()}
                  gradient="from-violet-500 to-purple-600"
                />
              </div>

              {/* Quick Stats */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-body-sm font-bold text-gray-900">Thống kê nhanh</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <QuickStat label="Tổng liên kết" value={stats.totalLinks} />
                  <QuickStat label="Tổng chuyển đổi" value={stats.totalConversions} />
                  <QuickStat label="Tỷ lệ chuyển đổi" value={`${stats.conversionRate}%`} />
                  <QuickStat label="Giá trị/Click" value={`${stats.totalClicks > 0 ? Math.round(stats.totalEarnings / stats.totalClicks * 100) / 100 : 0}`} />
                </div>
              </div>

              {/* Info Card */}
              <div className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 p-6">
                <h3 className="mb-3 flex items-center gap-2 text-body-sm font-bold text-violet-900">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Cách kiếm xu
                </h3>
                <ul className="space-y-2 text-caption text-violet-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                    <span><strong>Đăng ký:</strong> Nhận 10 xu khi người được giới thiệu đăng ký tài khoản mới</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                    <span><strong>Nạp xu đầu:</strong> Nhận 50 xu khi người được giới thiệu nạp xu lần đầu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                    <span><strong>Mốc xem:</strong> Nhận 5 xu mỗi khi người được giới thiệu đạt 10 lượt xem truyện</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Links Tab */}
          {activeTab === "links" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Create Button */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 text-body-sm font-bold text-white shadow-lg shadow-violet-200/50 transition-all hover:from-violet-600 hover:to-purple-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  Tạo liên kết mới
                </button>
              </div>

              {/* Links List */}
              {links.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                  <LinkIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-body-sm font-bold text-gray-700">Chưa có liên kết nào</h3>
                  <p className="mt-1 text-caption text-gray-500">Tạo liên kết affiliate đầu tiên của bạn</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-100 px-4 py-2 text-body-sm font-medium text-violet-700 hover:bg-violet-200"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Tạo liên kết
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((link, idx) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-violet-100 px-3 py-1 text-caption font-bold text-violet-700">
                              {link.code}
                            </span>
                            {link.isActive ? (
                              <span className="flex items-center gap-1 text-caption text-emerald-600">
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                Hoạt động
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-caption text-gray-400">
                                <XCircleIcon className="h-3.5 w-3.5" />
                                Đã tắt
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-caption text-gray-500">
                            <span className="flex items-center gap-1">
                              <EyeIcon className="h-3.5 w-3.5" />
                              {link.clickCount} clicks
                            </span>
                            <span className="flex items-center gap-1">
                              <UsersIcon className="h-3.5 w-3.5" />
                              {link.conversionCount} chuyển đổi
                            </span>
                            <span>{link.targetTitle || link.destination}</span>
                            <span>{formatDate(link.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(link.code)}
                            className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-caption font-medium text-gray-700 hover:bg-gray-200"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                            {copiedCode === link.code ? "Đã copy!" : "Copy link"}
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-caption font-medium text-red-600 hover:bg-red-100"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {earnings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                  <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-body-sm font-bold text-gray-700">Chưa có thu nhập nào</h3>
                  <p className="mt-1 text-caption text-gray-500">Bắt đầu giới thiệu bạn bè để kiếm xu</p>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-caption font-bold text-gray-500">Thời gian</th>
                          <th className="px-4 py-3 text-left text-caption font-bold text-gray-500">Hành động</th>
                          <th className="px-4 py-3 text-left text-caption font-bold text-gray-500">Người được giới thiệu</th>
                          <th className="px-4 py-3 text-right text-caption font-bold text-gray-500">Xu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {earnings.map((earning) => (
                          <tr key={earning.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-4 py-3 text-caption text-gray-600">
                              {formatDate(earning.createdAt)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-caption font-medium text-violet-700">
                                {getActionLabel(earning.action)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-caption text-gray-600">
                              {earning.referralUser?.name || earning.description || "-"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right">
                              <span className="font-bold text-amber-600">+{earning.commission}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-caption text-gray-500">
                        Trang {pagination.page} / {pagination.totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchEarnings(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-caption font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Trước
                        </button>
                        <button
                          onClick={() => fetchEarnings(pagination.page + 1)}
                          disabled={pagination.page >= pagination.totalPages}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-caption font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {leaderboard.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                  <TrophyIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-body-sm font-bold text-gray-700">Chưa có dữ liệu</h3>
                  <p className="mt-1 text-caption text-gray-500">Hãy là người đầu tiên trong bảng xếp hạng!</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="divide-y divide-gray-100">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-4 p-4 ${
                          entry.rank <= 3 ? "bg-gradient-to-r from-amber-50 to-orange-50" : ""
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                            entry.rank === 1
                              ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-200"
                              : entry.rank === 2
                              ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                              : entry.rank === 3
                              ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {entry.rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{entry.name}</p>
                          <p className="text-caption text-gray-500">
                            {entry.totalActions} hành động
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="flex items-center gap-1 font-bold text-amber-600">
                            <CurrencyDollarIcon className="h-4 w-4" />
                            {entry.totalEarnings.toLocaleString()}
                          </p>
                          <p className="text-caption text-gray-500">xu</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Create Link Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-heading-sm font-bold text-gray-900">Tạo liên kết Affiliate</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-caption font-medium text-gray-700">Loại đích</label>
                  <select
                    value={createForm.destination}
                    onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-body-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  >
                    <option value="story">Truyện</option>
                    <option value="author">Tác giả</option>
                    <option value="campaign">Chiến dịch</option>
                    <option value="page">Trang</option>
                  </select>
                </div>

                {createForm.destination === "story" && (
                  <div>
                    <label className="mb-1.5 block text-caption font-medium text-gray-700">ID Truyện</label>
                    <input
                      type="text"
                      value={createForm.targetId}
                      onChange={(e) => setCreateForm({ ...createForm, targetId: e.target.value })}
                      placeholder="Nhập ID truyện"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-body-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                )}

                {createForm.destination === "author" && (
                  <div>
                    <label className="mb-1.5 block text-caption font-medium text-gray-700">ID Tác giả</label>
                    <input
                      type="text"
                      value={createForm.targetId}
                      onChange={(e) => setCreateForm({ ...createForm, targetId: e.target.value })}
                      placeholder="Nhập ID tác giả"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-body-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                )}

                <div className="rounded-lg bg-gray-50 p-3 text-caption text-gray-600">
                  <p><strong>Liên kết dạng:</strong> /api/affiliate/track/CODE</p>
                  <p>Khi người khác click, họ sẽ được chuyển hướng đến trang đích và bạn sẽ nhận hoa hồng.</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateLink}
                  disabled={creating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-body-sm font-bold text-white disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4" />
                      Tạo liên kết
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className={`p-5 bg-gradient-to-r ${gradient}`}>
        <Icon className="h-7 w-7 text-white/90" />
      </div>
      <div className="p-4">
        <p className="text-caption font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-heading-sm font-extrabold text-violet-600">{value}</p>
      <p className="text-caption text-gray-500">{label}</p>
    </div>
  );
}
