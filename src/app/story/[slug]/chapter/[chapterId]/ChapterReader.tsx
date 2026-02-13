"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  ListBulletIcon,
  GiftIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";
import AdSenseSlot from "@/components/ads/AdSenseSlot";
import { API_BASE_URL, authFetch } from "@/lib/api";

interface ChapterData {
  id: string;
  title: string;
  number: number;
  content: string;
  wordCount: number;
  authorNote: string | null;
  isLocked: boolean;
  price: number;
  createdAt: string;
  story: { id: string; title: string; slug: string; authorId: string };
  prev: { id: string; title: string; number: number } | null;
  next: { id: string; title: string; number: number } | null;
}

export default function ReadChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPurchase, setNeedsPurchase] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [tipAmount, setTipAmount] = useState(100);
  const [tipping, setTipping] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [tipError, setTipError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const token = (session as any)?.accessToken as string | undefined;
  const chapterBottomAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHAPTER_BOTTOM;

  // Load dark mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("reader-dark-mode");
    if (saved === "true") setDarkMode(true);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("reader-dark-mode", String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    if (!chapterId) return;
    setLoading(true);
    setNeedsPurchase(false);
    setPurchaseError("");

    fetch(`${API_BASE_URL}/api/chapters/${chapterId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data: ChapterData) => {
        if (data.isLocked) {
          // Check if user has purchased this chapter
          if (session && token) {
            authFetch(`/api/wallet`, token)
              .then((r) => r.json())
              .then((wallet) => {
                setUserBalance(wallet.coinBalance || wallet.balance || 0);
                // Check purchase status
                const purchasedIds: string[] = wallet.purchasedChapterIds || [];
                if (purchasedIds.includes(data.id) || data.story.authorId === wallet.userId) {
                  // Already purchased or is author
                  setChapter(data);
                  setNeedsPurchase(false);
                } else {
                  setChapter(data);
                  setNeedsPurchase(true);
                }
                setLoading(false);
              })
              .catch(() => {
                setChapter(data);
                setNeedsPurchase(true);
                setLoading(false);
              });
          } else {
            // Not logged in, show locked
            setChapter({ ...data, content: "" });
            setNeedsPurchase(true);
            setLoading(false);
          }
        } else {
          setChapter(data);
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [chapterId, session, token]);

  const handlePurchase = async () => {
    if (!session || !chapter || purchasing || !token) return;
    setPurchasing(true);
    setPurchaseError("");
    try {
      const res = await authFetch("/api/wallet/purchase", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPurchaseError(data.error === "Insufficient balance"
          ? `Không đủ xu. Bạn cần ${data.required} xu, hiện có ${data.balance} xu.`
          : data.error === "Already purchased"
          ? "Bạn đã mua chương này rồi."
          : data.error || "Không thể mua chương"
        );
        // If already purchased, reload to show content
        if (data.error === "Already purchased") {
          window.location.reload();
        }
        setPurchasing(false);
        return;
      }
      // Purchase success — reload chapter content
      setUserBalance(data.newBalance);
      window.location.reload();
    } catch {
      setPurchaseError("Lỗi kết nối server");
      setPurchasing(false);
    }
  };

  const handleTip = async () => {
    if (!session || !chapter || tipping || !token) return;
    setTipping(true);
    setTipError("");
    setTipSuccess(false);
    try {
      const res = await authFetch("/api/wallet/tip", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id, coins: tipAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTipError(data.error || "Không thể tặng xu");
        setTipping(false);
        return;
      }
      setUserBalance(data.newBalance);
      setTipSuccess(true);
      setTimeout(() => setTipSuccess(false), 4000);
    } catch {
      setTipError("Lỗi kết nối server");
    }
    setTipping(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        </main>
      </>
    );
  }

  if (!chapter) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <BookOpenIcon className="h-16 w-16 text-gray-300" />
            <h2 className="text-heading-md font-bold text-gray-600">Không tìm thấy chương</h2>
            <Link href={`/story/${slug}`} className="text-primary-600 hover:underline">
              ← Quay lại truyện
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'}`}>
        {/* Chapter header */}
        <div className={`border-b transition-colors duration-300 ${darkMode ? 'border-gray-700 bg-[#16213e]' : 'border-gray-200 bg-white'}`}>
          <div className="section-container flex items-center justify-between py-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={`/story/${slug}`}
                className={`flex-shrink-0 rounded-lg p-2 transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/story/${slug}`}
                  className={`block text-caption truncate ${darkMode ? 'text-gray-400 hover:text-primary-400' : 'text-gray-500 hover:text-primary-600'}`}
                >
                  {chapter.story.title}
                </Link>
                <h1 className={`text-body-md font-bold truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Chương {chapter.number}: {chapter.title.replace(/^Chương\s*\d+\s*[:：]\s*/i, '')}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-caption ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{chapter.wordCount.toLocaleString()} chữ</span>
              <button
                onClick={toggleDarkMode}
                className={`rounded-lg p-2 transition-all duration-300 ${darkMode ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="section-container py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl"
          >
            {needsPurchase ? (
              /* Locked chapter purchase prompt */
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
                <LockClosedIcon className="mx-auto h-16 w-16 text-amber-500" />
                <h2 className="mt-4 text-heading-md font-bold text-gray-900">
                  Chương trả phí
                </h2>
                <p className="mt-2 text-body-md text-gray-600">
                  Chương này cần <span className="font-bold text-amber-600">{chapter.price} xu</span> để đọc
                </p>

                {!session ? (
                  <div className="mt-6">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-body-sm font-semibold text-white hover:bg-primary-600"
                    >
                      Đăng nhập để mua chương
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <p className="text-body-sm text-gray-500">
                      Số dư hiện tại: <span className="font-semibold text-gray-700">{userBalance} xu</span>
                    </p>
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-body-sm font-semibold text-white shadow-lg hover:bg-amber-600 disabled:opacity-50"
                    >
                      <CurrencyDollarIcon className="h-5 w-5" />
                      {purchasing ? "Đang mua..." : `Mua chương (${chapter.price} xu)`}
                    </button>
                    {userBalance < chapter.price && (
                      <div className="mt-2">
                        <Link
                          href="/wallet"
                          className="text-body-sm text-primary-600 hover:underline"
                        >
                          Nạp thêm xu →
                        </Link>
                      </div>
                    )}
                    {purchaseError && (
                      <p className="text-body-sm text-red-600">{purchaseError}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Chapter content */
              <div className={`rounded-2xl border p-8 shadow-sm md:p-12 transition-colors duration-300 ${darkMode ? 'border-gray-700 bg-[#1e2746]' : 'border-gray-100 bg-white'}`}>
                <div className="prose prose-lg max-w-none">
                  <div className={`whitespace-pre-line text-body-md leading-[1.9] transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {chapter.content}
                  </div>
                </div>

                {/* Author note */}
                {chapter.authorNote && (
                  <div className={`mt-8 rounded-xl border p-5 transition-colors duration-300 ${darkMode ? 'border-primary-800 bg-primary-900/30' : 'border-primary-100 bg-primary-50'}`}>
                    <p className={`mb-2 text-caption font-semibold ${darkMode ? 'text-primary-400' : 'text-primary-700'}`}>Lời tác giả</p>
                    <p className={`whitespace-pre-line text-body-sm ${darkMode ? 'text-primary-200/80' : 'text-primary-900/80'}`}>
                      {chapter.authorNote}
                    </p>
                  </div>
                )}

                {/* Tip / Gift section */}
                {session && chapter.story.authorId !== (session.user as any)?.id && (
                  <div className="mt-8 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <GiftIcon className="h-5 w-5 text-amber-600" />
                      <p className="text-body-sm font-semibold text-amber-800">Ủng hộ tác giả</p>
                    </div>
                    <p className="text-caption text-amber-700 mb-3">
                      Tặng xu để ủng hộ tác giả tiếp tục sáng tác!
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {[100, 200, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setTipAmount(amt)}
                          className={`rounded-lg px-3 py-1.5 text-caption font-medium transition-colors ${
                            tipAmount === amt
                              ? "bg-amber-500 text-white"
                              : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          {amt} xu
                        </button>
                      ))}
                      <input
                        type="number"
                        min={100}
                        max={50000}
                        value={tipAmount}
                        onChange={(e) => setTipAmount(Math.max(100, Number(e.target.value)))}
                        className="w-24 rounded-lg border border-amber-200 px-2 py-1.5 text-caption text-center focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      />
                      <button
                        onClick={handleTip}
                        disabled={tipping}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-caption font-semibold text-white shadow hover:bg-amber-600 disabled:opacity-50"
                      >
                        <GiftIcon className="h-4 w-4" />
                        {tipping ? "Đang tặng..." : "Tặng xu"}
                      </button>
                    </div>
                    {tipSuccess && (
                      <p className="mt-2 text-caption font-medium text-emerald-600">
                        Tặng xu thành công! Cảm ơn bạn đã ủng hộ tác giả ❤️
                      </p>
                    )}
                    {tipError && (
                      <p className="mt-2 text-caption text-red-600">{tipError}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom-of-chapter ad */}
            {chapterBottomAdSlot && (
              <div className="mt-8">
                <AdSenseSlot slot={chapterBottomAdSlot} />
              </div>
            )}

            {/* Chapter comments */}
            {!needsPurchase && (
              <div className="mt-8">
                <CommentSection
                  chapterId={chapterId}
                  session={session}
                  token={token}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {chapter.prev ? (
                <Link
                  href={`/story/${slug}/chapter/${chapter.prev.id}`}
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-body-sm font-medium shadow-sm transition-colors duration-300 ${darkMode ? 'border-gray-700 bg-[#1e2746] text-gray-300 hover:bg-[#253054]' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Chương {chapter.prev.number}</span>
                  <span className="sm:hidden">Trước</span>
                </Link>
              ) : (
                <div />
              )}

              <Link
                href={`/story/${slug}`}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-body-sm font-medium shadow-sm transition-colors duration-300 ${darkMode ? 'border-gray-700 bg-[#1e2746] text-gray-300 hover:bg-[#253054]' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <ListBulletIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Mục lục</span>
              </Link>

              {chapter.next ? (
                <Link
                  href={`/story/${slug}/chapter/${chapter.next.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-body-sm font-semibold text-white shadow-lg hover:bg-primary-600"
                >
                  <span className="hidden sm:inline">Chương {chapter.next.number}</span>
                  <span className="sm:hidden">Tiếp</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              ) : (
                <div className={`rounded-xl border px-5 py-3 text-body-sm transition-colors duration-300 ${darkMode ? 'border-gray-700 bg-[#1e2746] text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                  Hết truyện
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
