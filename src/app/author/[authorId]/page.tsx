"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_BASE_URL, authFetch } from "@/lib/api";

export default function AuthorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const authorId = params.authorId as string;
  const token = (session as any)?.accessToken as string | undefined;

  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);

  const [giftCoins, setGiftCoins] = useState<string>("");
  const [giftError, setGiftError] = useState<string | null>(null);
  const [gifting, setGifting] = useState(false);
  const [giftDone, setGiftDone] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const StoryCoverThumb = ({ storyId, title }: { storyId: string; title: string }) => {
    const [visible, setVisible] = useState(true);
    return (
      <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {visible ? (
          <Image
            src={`${API_BASE_URL}/api/stories/${storyId}/cover`}
            alt={title}
            width={64}
            height={80}
            className="h-full w-full object-cover"
            unoptimized
            onError={() => setVisible(false)}
          />
        ) : null}
      </div>
    );
  };

  useEffect(() => {
    if (!authorId) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/authors/${authorId}`)
      .then((r) => r.json())
      .then((data) => {
        setAuthor(data.author);
        setStories(Array.isArray(data.stories) ? data.stories : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authorId]);

  // Follower count (public)
  useEffect(() => {
    if (!authorId) return;
    fetch(`${API_BASE_URL}/api/follows/count?authorId=${authorId}`)
      .then((r) => r.json())
      .then((data) => setFollowerCount(data.count || 0))
      .catch(() => {});
  }, [authorId]);

  // Check follow status
  useEffect(() => {
    if (!token || !authorId) return;
    authFetch(`/api/follows/check?authorId=${authorId}`, token)
      .then((r) => r.json())
      .then((data) => setIsFollowing(data.following === true))
      .catch(() => {});
  }, [token, authorId]);

  const toggleFollow = async () => {
    if (!token) {
      router.push(`/login?callbackUrl=/author/${encodeURIComponent(authorId)}`);
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await authFetch(`/api/follows/${authorId}`, token, { method: "DELETE" });
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      } else {
        await authFetch("/api/follows", token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorId }),
        });
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    } catch {}
    setFollowLoading(false);
  };

  const handleGift = async () => {
    setGiftError(null);
    setGiftDone(null);

    if (status !== "authenticated" || !token) {
      router.push(`/login?callbackUrl=/author/${encodeURIComponent(authorId)}`);
      return;
    }

    const coins = parseInt(giftCoins, 10);
    if (!Number.isFinite(coins) || !Number.isInteger(coins) || coins <= 0) {
      setGiftError("Số xu phải là số nguyên dương");
      return;
    }

    setGifting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/authors/${authorId}/gift`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coins }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGiftError(data?.error || "Không thể tặng xu");
      } else {
        setGiftDone("Đã tặng xu thành công");
        setGiftCoins("");
      }
    } catch {
      setGiftError("Không thể kết nối server");
    }
    setGifting(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="section-container py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : !author ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
              <p className="text-body-md font-semibold text-gray-900">Không tìm thấy tác giả</p>
              <p className="mt-1 text-body-sm text-gray-500">Tác giả không tồn tại hoặc chưa đăng ký.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-1">
                <div className="text-center">
                  {author.image ? (
                    <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-gray-100">
                      <Image src={author.image} alt="" width={96} height={96} className="h-full w-full object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary">
                      <span className="text-display-sm font-bold text-white">{String(author.name || "T")[0]}</span>
                    </div>
                  )}

                  <h1 className="mt-4 text-heading-md font-bold text-gray-900">{author.name}</h1>
                  {author.bio ? <p className="mt-2 text-body-sm text-gray-600">{author.bio}</p> : null}

                  <p className="mt-2 text-caption text-gray-500">{followerCount} người theo dõi</p>

                  {author.referralCode && (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary-50 px-3 py-2">
                      <span className="text-body-sm font-medium text-primary-600">CODE:</span>
                      <span className="text-body-sm font-bold tracking-wider text-primary-700">{author.referralCode}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(author.referralCode);
                        }}
                        className="ml-1 rounded p-1 text-primary-400 hover:bg-primary-100 hover:text-primary-600"
                        title="Sao chép mã mời"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className={`mt-3 w-full rounded-xl px-5 py-2.5 text-body-sm font-semibold transition-colors ${
                      isFollowing
                        ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        : "bg-primary-500 text-white hover:bg-primary-600"
                    } disabled:opacity-60`}
                  >
                    {followLoading ? "Đang xử lý..." : isFollowing ? "Đang theo dõi ✓" : "Theo dõi"}
                  </button>

                  <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left">
                    <p className="text-body-sm font-semibold text-gray-900">Tặng xu ủng hộ tác giả</p>
                    <p className="mt-0.5 text-caption text-gray-500">Xu sẽ được cộng trực tiếp vào ví của tác giả.</p>

                    <div className="mt-3 flex gap-2">
                      <input
                        value={giftCoins}
                        onChange={(e) => setGiftCoins(e.target.value)}
                        placeholder="Ví dụ: 50"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-body-sm focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                      />
                      <button
                        onClick={handleGift}
                        disabled={gifting}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-body-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                      >
                        {gifting ? "Đang gửi..." : "Tặng"}
                      </button>
                    </div>

                    {giftError ? <p className="mt-2 text-caption text-red-500">{giftError}</p> : null}
                    {giftDone ? <p className="mt-2 text-caption text-emerald-600">{giftDone}</p> : null}

                    <Link href="/wallet" className="mt-3 inline-block text-caption font-medium text-primary-600 hover:text-primary-500">
                      Cần nạp thêm xu? →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="rounded-2xl bg-white p-6 shadow-card">
                  <h2 className="text-heading-md font-bold text-gray-900">Tác phẩm</h2>
                  {stories.length === 0 ? (
                    <p className="mt-3 text-body-sm text-gray-500">Chưa có truyện nào.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {stories.map((s) => (
                        <Link
                          key={s.id}
                          href={`/story/${s.slug}`}
                          className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50"
                        >
                          <StoryCoverThumb storyId={s.id} title={s.title} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-body-md font-semibold text-gray-900">{s.title}</p>
                            <p className="mt-1 text-caption text-gray-500">{s.genre} · {s.status === "completed" ? "Hoàn thành" : s.status === "paused" ? "Tạm ngưng" : "Đang ra"}</p>
                          </div>
                          <span className="text-caption text-gray-400">{(s.views || 0).toLocaleString("vi-VN")} lượt đọc</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
