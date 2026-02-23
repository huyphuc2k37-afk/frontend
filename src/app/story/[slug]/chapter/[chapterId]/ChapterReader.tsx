"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import { sanitizeHtml } from "@/lib/sanitize";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";
import ParagraphCommentDrawer from "@/components/ParagraphCommentDrawer";
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
  story: { id: string; title: string; slug: string; authorId: string; genre: string; tags?: string | null };
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
  const contentRef = useRef<HTMLDivElement>(null);
  const token = (session as any)?.accessToken as string | undefined;

  // ─── Inline paragraph comment state ───
  const [paragraphDrawerOpen, setParagraphDrawerOpen] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(0);
  const [activeParagraphText, setActiveParagraphText] = useState("");
  const [paragraphCounts, setParagraphCounts] = useState<Record<number, number>>({});

  // Split chapter content into paragraphs for inline commenting
  const paragraphs = useMemo(() => {
    if (!chapter?.content) return [];
    const html = sanitizeHtml(chapter.content);
    // Try to split by <p> tags first
    const pMatch = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
    if (pMatch && pMatch.length > 1) return pMatch;
    // Fallback: split by double newline (plain text content)
    const parts = html.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    return parts;
  }, [chapter?.content]);

  // Fetch paragraph comment counts
  useEffect(() => {
    if (!chapterId || !chapter || paragraphs.length === 0) return;
    fetch(`${API_BASE_URL}/api/comments/paragraph-counts?chapterId=${chapterId}`)
      .then((r) => r.json())
      .then((data) => setParagraphCounts(data.counts || {}))
      .catch(() => {});
  }, [chapterId, chapter, paragraphs.length]);

  const openParagraphDrawer = (index: number, text: string) => {
    setActiveParagraphIndex(index);
    setActiveParagraphText(text);
    setParagraphDrawerOpen(true);
  };

  const closeParagraphDrawer = () => {
    setParagraphDrawerOpen(false);
    // Refresh counts after closing
    fetch(`${API_BASE_URL}/api/comments/paragraph-counts?chapterId=${chapterId}`)
      .then((r) => r.json())
      .then((data) => setParagraphCounts(data.counts || {}))
      .catch(() => {});
  };

  // ─── Copy protection for chapter content ───
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const prevent = (e: Event) => e.preventDefault();

    // Block right-click, copy, cut, select on content area
    el.addEventListener("contextmenu", prevent);
    el.addEventListener("copy", prevent);
    el.addEventListener("cut", prevent);
    el.addEventListener("selectstart", prevent);

    // Block Ctrl+C, Ctrl+A, Ctrl+U, Ctrl+S, PrintScreen
    const handleKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "a", "u", "s", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      // Block PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      el.removeEventListener("contextmenu", prevent);
      el.removeEventListener("copy", prevent);
      el.removeEventListener("cut", prevent);
      el.removeEventListener("selectstart", prevent);
      document.removeEventListener("keydown", handleKey);
    };
  }, [chapter]);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("reader-dark-mode");
    if (saved === "true") setDarkMode(true);
  }, []);

  // Track reading time for daily quest (1 minute intervals)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      authFetch("/api/quests/read", token, {
        method: "POST",
        body: JSON.stringify({ minutes: 1 }),
      }).catch(() => {});
    }, 60_000); // every 1 minute
    return () => clearInterval(interval);
  }, [token]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("reader-dark-mode", String(!prev));
      return !prev;
    });
  };

  // Re-fetch chapter data helper (used by useEffect and after purchase)
  const fetchChapterData = useCallback(async (authToken?: string, signal?: AbortSignal) => {
    const fetchChapter = authToken
      ? authFetch(`/api/chapters/${chapterId}`, authToken, { signal }).then((r) => {
          if (!r.ok) throw new Error("Not found");
          return r.json();
        })
      : fetch(`${API_BASE_URL}/api/chapters/${chapterId}`, { signal }).then((r) => {
          if (!r.ok) throw new Error("Not found");
          return r.json();
        });

    const data: ChapterData & { requiresLogin?: boolean; requiresPurchase?: boolean } = await fetchChapter;
    return data;
  }, [chapterId]);

  useEffect(() => {
    if (!chapterId) return;
    let cancelled = false;
    const abortController = new AbortController();

    setLoading(true);
    setNeedsPurchase(false);
    setPurchaseError("");

    fetchChapterData(token, abortController.signal)
      .then(async (data) => {
        if (cancelled) return;
        setChapter(data);

        // Backend already strips content for unauthorized access
        if (data.requiresLogin || data.requiresPurchase) {
          setNeedsPurchase(true);
          // Fetch balance for purchase UI if logged in
          if (token) {
            try {
              const walletRes = await authFetch(`/api/wallet`, token);
              const wallet = await walletRes.json();
              if (!cancelled) setUserBalance(wallet.coinBalance || wallet.balance || 0);
            } catch { /* ignore */ }
          }
        }
        if (!cancelled) setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [chapterId, fetchChapterData, session, token]);

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
        // If already purchased, re-fetch chapter content directly
        if (data.error === "Already purchased") {
          try {
            const chapterData = await fetchChapterData(token);
            setChapter(chapterData);
            setNeedsPurchase(false);
          } catch { /* ignore */ }
        }
        setPurchasing(false);
        return;
      }
      // Purchase success — re-fetch chapter content directly (no page reload)
      setUserBalance(data.newBalance);
      try {
        const chapterData = await fetchChapterData(token);
        setChapter(chapterData);
        setNeedsPurchase(false);
      } catch { /* ignore */ }
      setPurchasing(false);
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
              <div
                ref={contentRef}
                className={`rounded-2xl border p-8 shadow-sm md:p-12 transition-colors duration-300 select-none ${darkMode ? 'border-gray-700 bg-[#1e2746]' : 'border-gray-100 bg-white'}`}
                style={{ WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", userSelect: "none" } as React.CSSProperties}
              >
                <div className="prose prose-lg max-w-none">
                  {/* Paragraph-by-paragraph rendering with inline comment badges */}
                  {paragraphs.map((para, idx) => {
                    // Extract plain text for the drawer
                    const plainText = para.replace(/<[^>]+>/g, "").trim();
                    if (!plainText) return null;
                    const count = paragraphCounts[idx] || 0;

                    return (
                      <div key={idx} className="group/para relative">
                        <div className="flex items-start gap-0">
                          {/* Paragraph content */}
                          <div
                            className={`flex-1 whitespace-pre-line text-body-md leading-[1.9] transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                            dangerouslySetInnerHTML={{ __html: para }}
                          />

                          {/* Comment badge — always visible if has comments, otherwise show on hover */}
                          <button
                            onClick={() => openParagraphDrawer(idx, plainText)}
                            className={`flex-shrink-0 ml-2 mt-1 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium transition-all duration-200 ${
                              count > 0
                                ? darkMode
                                  ? 'bg-primary-900/50 text-primary-300 hover:bg-primary-800/60'
                                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                : `opacity-0 group-hover/para:opacity-100 ${
                                    darkMode
                                      ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'
                                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                  }`
                            }`}
                            title="Bình luận đoạn này"
                          >
                            <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
                            {count > 0 && <span>{count}</span>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
            <div className="mt-8">
              <AdSenseSlot slot="1336707630" />
            </div>

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

      {/* Paragraph comment drawer */}
      <ParagraphCommentDrawer
        isOpen={paragraphDrawerOpen}
        onClose={closeParagraphDrawer}
        chapterId={chapterId}
        paragraphIndex={activeParagraphIndex}
        paragraphText={activeParagraphText}
        session={session}
        token={token}
      />
    </>
  );
}
