"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FanRanking from "@/components/FanRanking";
import { API_BASE_URL, authFetch } from "@/lib/api";
import type { FanClub, FanClubMember, FanClubActivity } from "@/types";

interface FanClubData {
  club: FanClub;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Props {
  authorId: string;
  initialData: FanClubData | null;
}

const TIER_OPTIONS = [
  { value: 100, label: "100 xu", tier: "member" },
  { value: 500, label: "500 xu - VIP", tier: "vip" },
  { value: 1000, label: "1,000 xu", tier: "vip" },
  { value: 2000, label: "2,000 xu - SVIP", tier: "svip" },
  { value: 5000, label: "5,000 xu - SVIP", tier: "svip" },
];

const TIER_COLORS = {
  member: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", label: "Thành viên" },
  vip: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-400", label: "VIP" },
  svip: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-400", label: "SVIP" },
};

const ACTION_LABELS = {
  joined: "đã tham gia",
  upgraded: "đã lên tier",
  donated: "đã donate",
  milestone: "đã đạt mốc",
};

export default function FanClubClient({ authorId, initialData }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = (session as any)?.accessToken as string | undefined;

  const [club, setClub] = useState<FanClub | null>(initialData?.club || null);
  const [author, setAuthor] = useState(initialData?.author || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Membership state
  const [isMember, setIsMember] = useState(false);
  const [member, setMember] = useState<FanClubMember | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // Donation state
  const [donateAmount, setDonateAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donateError, setDonateError] = useState<string | null>(null);
  const [donateSuccess, setDonateSuccess] = useState<string | null>(null);
  const [donating, setDonating] = useState(false);

  // Activities state
  const [activities, setActivities] = useState<FanClubActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Fetch fan club data
  useEffect(() => {
    if (!authorId) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/fanclub/${authorId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClub(data.club);
          setAuthor(data.author);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải thông tin fan club");
        setLoading(false);
      });
  }, [authorId]);

  // Check membership status
  useEffect(() => {
    if (!token || !authorId) return;
    authFetch(`/api/fanclub/${authorId}/mystatus`, token)
      .then((r) => r.json())
      .then((data) => {
        setIsMember(data.isMember);
        setMember(data.member);
      })
      .catch(() => {});
  }, [token, authorId]);

  // Fetch recent activities
  useEffect(() => {
    if (!authorId) return;
    setActivitiesLoading(true);
    fetch(`${API_BASE_URL}/api/fanclub/${authorId}/activities?limit=10`)
      .then((r) => r.json())
      .then((data) => {
        setActivities(data.activities || []);
        setActivitiesLoading(false);
      })
      .catch(() => setActivitiesLoading(false));
  }, [authorId]);

  // Join fan club
  const handleJoin = async () => {
    if (!token) {
      router.push(`/login?callbackUrl=/fanclub/${encodeURIComponent(authorId)}`);
      return;
    }
    setMemberLoading(true);
    try {
      const res = await authFetch(`/api/fanclub/${authorId}/join`, token, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setIsMember(true);
        setMember(data.member);
        setClub(data.club);
      }
    } catch {}
    setMemberLoading(false);
  };

  // Leave fan club
  const handleLeave = async () => {
    if (!token) return;
    if (!confirm("Bạn có chắc muốn rời khỏi Fan Club này?")) return;
    setMemberLoading(true);
    try {
      const res = await authFetch(`/api/fanclub/${authorId}/leave`, token, {
        method: "POST",
      });
      if (res.ok) {
        setIsMember(false);
        setMember(null);
      }
    } catch {}
    setMemberLoading(false);
  };

  // Donate coins
  const handleDonate = async () => {
    setDonateError(null);
    setDonateSuccess(null);

    if (status !== "authenticated" || !token) {
      router.push(`/login?callbackUrl=/fanclub/${encodeURIComponent(authorId)}`);
      return;
    }

    // Get amount from custom input or selected option
    const amount = customAmount ? parseInt(customAmount, 10) : parseInt(donateAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      setDonateError("Vui lòng chọn hoặc nhập số xu hợp lệ");
      return;
    }

    setDonating(true);
    try {
      const res = await authFetch(`/api/fanclub/${authorId}/donate`, token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: amount }),
      });
      const data = await res.json();
      if (data.success) {
        setDonateSuccess(
          data.tierUpgraded
            ? `Donate thành công! Bạn đã lên tier ${data.newTier.toUpperCase()}! 🎉`
            : `Donate thành công! Cảm ơn sự ủng hộ của bạn!`
        );
        setMember(data.member);
        setDonateAmount("");
        setCustomAmount("");
      } else {
        setDonateError(data.error || "Donate thất bại");
      }
    } catch {
      setDonateError("Không thể kết nối server");
    }
    setDonating(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !club || !author) {
    return (
      <>
        <Header />
        <div className="section-container py-20">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="text-heading-md font-semibold text-red-700">
              {error || "Fan Club không tồn tại"}
            </p>
            <p className="mt-2 text-body-sm text-red-500">
              Tác giả này có thể chưa có Fan Club hoặc không tồn tại.
            </p>
            <Link href="/" className="mt-4 inline-block text-primary-600 hover:text-primary-500">
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const tierInfo = member ? TIER_COLORS[member.tier] : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-500">
          {club.bannerImage && (
            <Image src={club.bannerImage} alt="" fill className="object-cover opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="section-container absolute bottom-0 left-0 right-0 pb-6">
            <div className="flex items-end gap-4">
              {author.image ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                  <Image src={author.image} alt={author.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white text-display-md font-bold text-purple-600 shadow-lg">
                  {author.name[0]}
                </div>
              )}
              <div className="mb-1 text-white">
                <h1 className="text-heading-lg font-bold drop-shadow">{club.name}</h1>
                <p className="text-body-sm text-white/80">Tác giả: {author.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-container py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column - Info and actions */}
            <div className="space-y-6">
              {/* Stats card */}
              <div className="rounded-2xl bg-white p-6 shadow-card">
                <h2 className="text-heading-md font-bold text-gray-900">Thông tin Fan Club</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-display-md font-bold text-purple-600">{club.totalFans.toLocaleString("vi-VN")}</p>
                    <p className="text-caption text-gray-500">Fans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-display-md font-bold text-amber-600">{club.totalCoins.toLocaleString("vi-VN")}</p>
                    <p className="text-caption text-gray-500">Tổng xu donate</p>
                  </div>
                </div>
                {club.description && (
                  <p className="mt-4 text-body-sm text-gray-600">{club.description}</p>
                )}
              </div>

              {/* Member status */}
              <div className="rounded-2xl bg-white p-6 shadow-card">
                {member && tierInfo ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-body-md font-semibold text-gray-900">Trạng thái của bạn</h3>
                      <span className={`rounded-full px-3 py-1 text-caption font-semibold ${tierInfo.bg} ${tierInfo.text} border ${tierInfo.border}`}>
                        {tierInfo.label}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-caption text-gray-500">
                        <span>Đã donate</span>
                        <span>{member.tierCoins.toLocaleString("vi-VN")} xu</span>
                      </div>
                      {/* Tier progress */}
                      <div className="mt-2 space-y-1">
                        {["member", "vip", "svip"].map((tier, index) => {
                          const thresholds = [0, 500, 2000];
                          const current = member.tierCoins;
                          const next = thresholds[index + 1];
                          const prev = thresholds[index];
                          if (tier === member.tier) {
                            const progress = next ? Math.min(100, ((current - prev) / (next - prev)) * 100) : 100;
                            return (
                              <div key={tier}>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                  <div
                                    className={`h-full rounded-full ${TIER_COLORS[tier as keyof typeof TIER_COLORS].bg}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                {next && (
                                  <p className="mt-1 text-caption text-gray-400">
                                    {next - current > 0 ? `${(next - current).toLocaleString("vi-VN")} xu nữa để lên tier cao hơn` : "Đã đạt tier cao nhất!"}
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                    <button
                      onClick={handleLeave}
                      disabled={memberLoading}
                      className="mt-4 w-full rounded-xl border border-red-200 bg-white px-4 py-2 text-body-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      {memberLoading ? "Đang xử lý..." : "Rời Fan Club"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-body-md font-semibold text-gray-900">Tham gia Fan Club</h3>
                    <p className="mt-2 text-caption text-gray-500">
                      Trở thành fan chính thức của {author.name} và nhận nhiều đặc quyền!
                    </p>
                    <button
                      onClick={handleJoin}
                      disabled={memberLoading}
                      className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 text-body-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                    >
                      {memberLoading ? "Đang xử lý..." : "Tham gia ngay"}
                    </button>
                  </div>
                )}
              </div>

              {/* Donate section */}
              {isMember && (
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-card">
                  <h3 className="text-body-md font-semibold text-gray-900">Donate ủng hộ tác giả</h3>
                  <p className="mt-1 text-caption text-gray-500">Donate để lên tier và nhận badge đặc biệt!</p>

                  {/* Quick options */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {TIER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setDonateAmount(opt.value.toString());
                          setCustomAmount("");
                        }}
                        className={`rounded-lg border px-3 py-2 text-caption font-medium transition-all ${
                          donateAmount === opt.value.toString() && !customAmount
                            ? "border-amber-400 bg-amber-100 text-amber-800"
                            : "border-gray-200 bg-white text-gray-700 hover:border-amber-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <div className="mt-4">
                    <label className="text-caption text-gray-500">Hoặc nhập số xu tùy chỉnh:</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setDonateAmount("");
                        }}
                        placeholder="Ví dụ: 1000"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-body-sm focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-200"
                      />
                    </div>
                  </div>

                  {donateError && (
                    <p className="mt-2 text-caption text-red-500">{donateError}</p>
                  )}
                  {donateSuccess && (
                    <p className="mt-2 text-caption text-emerald-600">{donateSuccess}</p>
                  )}

                  <button
                    onClick={handleDonate}
                    disabled={donating || (!donateAmount && !customAmount)}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-body-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {donating ? "Đang xử lý..." : "Donate ngay"}
                  </button>

                  <Link href="/wallet" className="mt-2 inline-block w-full text-center text-caption text-primary-600 hover:text-primary-500">
                    Cần nạp thêm xu? →
                  </Link>
                </div>
              )}
            </div>

            {/* Right column - Ranking and activities */}
            <div className="lg:col-span-2 space-y-6">
              {/* Fan ranking */}
              <FanRanking authorId={authorId} currentMember={member} />

              {/* Recent activities */}
              <div className="rounded-2xl bg-white p-6 shadow-card">
                <h3 className="text-heading-md font-bold text-gray-900">Hoạt động gần đây</h3>
                {activitiesLoading ? (
                  <div className="mt-4 flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                  </div>
                ) : activities.length === 0 ? (
                  <p className="mt-4 text-body-sm text-gray-500">Chưa có hoạt động nào.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                        {activity.user?.image ? (
                          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                            <Image src={activity.user.image} alt="" fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-caption font-semibold text-purple-600">
                            {activity.user?.name?.[0] || "?"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm text-gray-700">
                            <span className="font-semibold">{activity.user?.name}</span>{" "}
                            {ACTION_LABELS[activity.action]}
                            {activity.coins > 0 && (
                              <span className="ml-1 font-semibold text-amber-600">
                                {activity.coins.toLocaleString("vi-VN")} xu
                              </span>
                            )}
                          </p>
                          <p className="text-caption text-gray-400">
                            {new Date(activity.createdAt).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {activity.action === "upgraded" && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-caption font-semibold text-purple-600">
                            UPGRADE!
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tier info */}
              <div className="rounded-2xl bg-white p-6 shadow-card">
                <h3 className="text-heading-md font-bold text-gray-900">Hệ thống Tier</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className={`rounded-xl border-2 p-4 ${TIER_COLORS.member.border}`}>
                    <div className={`inline-block rounded-full px-3 py-1 text-caption font-semibold ${TIER_COLORS.member.bg} ${TIER_COLORS.member.text}`}>
                      {TIER_COLORS.member.label}
                    </div>
                    <p className="mt-2 text-display-sm font-bold text-gray-700">0 xu</p>
                    <p className="text-caption text-gray-500">Thành viên cơ bản</p>
                  </div>
                  <div className={`rounded-xl border-2 p-4 ${TIER_COLORS.vip.border}`}>
                    <div className={`inline-block rounded-full px-3 py-1 text-caption font-semibold ${TIER_COLORS.vip.bg} ${TIER_COLORS.vip.text}`}>
                      {TIER_COLORS.vip.label}
                    </div>
                    <p className="mt-2 text-display-sm font-bold text-amber-700">500+ xu</p>
                    <p className="text-caption text-gray-500">Badge VIP đặc biệt</p>
                  </div>
                  <div className={`rounded-xl border-2 p-4 ${TIER_COLORS.svip.border}`}>
                    <div className={`inline-block rounded-full px-3 py-1 text-caption font-semibold ${TIER_COLORS.svip.bg} ${TIER_COLORS.svip.text}`}>
                      {TIER_COLORS.svip.label}
                    </div>
                    <p className="mt-2 text-display-sm font-bold text-purple-700">2,000+ xu</p>
                    <p className="text-caption text-gray-500">Badge SVIP cao cấp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
