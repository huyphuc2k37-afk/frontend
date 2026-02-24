"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  BookOpenIcon,
  EyeIcon,
  HeartIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
  StarIcon,
  ShareIcon,
  LinkIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon, HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";
import AdSenseSlot from "@/components/ads/AdSenseSlot";
import { API_BASE_URL, authFetch } from "@/lib/api";

interface Chapter {
  id: string;
  title: string;
  number: number;
  wordCount: number;
  isLocked: boolean;
  price: number;
  createdAt: string;
}

interface StoryDetail {
  id: string;
  title: string;
  slug: string;
  updatedAt: string;
  description: string;
  genre: string;
  tags: string | null;
  status: string;
  views: number;
  likes: number;
  averageRating: number;
  ratingCount: number;
  author: { id: string; name: string; image: string | null; bio: string | null };
  chapters: Chapter[];
  _count: { bookmarks: number; comments: number; storyLikes: number };
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
}

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: session, status } = useSession();

  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const token = (session as any)?.accessToken as string | undefined;

  // Close share menu when clicking outside
  useEffect(() => {
    if (!showShareMenu) return;
    const handler = () => setShowShareMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showShareMenu]);

  // No login redirect — story pages are public. Auth is only needed for interactions (like, rate, bookmark).

  useEffect(() => {
    if (!slug) return;
    setShowCover(true);
    fetch(`${API_BASE_URL}/api/stories/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setStory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Check bookmark status
  useEffect(() => {
    if (!session || !story || !token) return;
    authFetch(`/api/bookmarks/check?storyId=${story.id}`, token)
      .then((r) => r.json())
      .then((data) => {
        setIsBookmarked(data.bookmarked === true);
      })
      .catch(() => {});
  }, [session, story, token]);

  const toggleBookmark = async () => {
    if (!session || !story || bookmarking) return;
    setBookmarking(true);
    try {
      if (isBookmarked) {
        await authFetch(`/api/bookmarks/${story.id}`, token!, { method: "DELETE" });
        setIsBookmarked(false);
      } else {
        await authFetch("/api/bookmarks", token!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyId: story.id }),
        });
        setIsBookmarked(true);
      }
    } catch {}
    setBookmarking(false);
  };

  // Check like status
  useEffect(() => {
    if (!session || !story || !token) return;
    authFetch(`/api/stories/${story.id}/like`, token)
      .then((r) => r.json())
      .then((data) => setIsLiked(data.liked === true))
      .catch(() => {});
  }, [session, story, token]);

  // Check user rating
  useEffect(() => {
    if (!session || !story || !token) return;
    authFetch(`/api/stories/${story.id}/rate`, token)
      .then((r) => r.json())
      .then((data) => setUserRating(data.userScore || 0))
      .catch(() => {});
  }, [session, story, token]);

  const toggleLike = async () => {
    if (!session || !story || liking || !token) return;
    setLiking(true);
    try {
      const res = await authFetch(`/api/stories/${story.id}/like`, token, { method: "POST" });
      const data = await res.json();
      setIsLiked(data.liked);
      setStory((prev) => prev ? { ...prev, likes: prev.likes + (data.liked ? 1 : -1) } : prev);
    } catch {}
    setLiking(false);
  };

  const submitRating = async (score: number) => {
    if (!session || !story || ratingLoading || !token) return;
    setRatingLoading(true);
    try {
      const res = await authFetch(`/api/stories/${story.id}/rate`, token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserRating(data.userScore);
        setStory((prev) => prev ? { ...prev, averageRating: data.averageRating, ratingCount: data.ratingCount } : prev);
      }
    } catch {}
    setRatingLoading(false);
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

  if (!story) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <BookOpenIcon className="h-16 w-16 text-gray-300" />
            <h2 className="text-heading-md font-bold text-gray-600">Không tìm thấy truyện</h2>
            <Link href="/explore" className="text-primary-600 hover:underline">
              Khám phá truyện khác
            </Link>
          </div>
        </main>
      </>
    );
  }

  const totalWords = story.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  // Format description into styled paragraphs
  const renderDescription = (text: string) => {
    const lines = text.split(/\n/).map((l) => l.trimEnd());
    const paragraphs: { type: "narration" | "dialogue" | "ellipsis"; text: string }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      // Dialogue lines start with – — - 「 or quotation marks
      if (/^[–—\-「]/.test(trimmed) || /^[""]/.test(trimmed)) {
        paragraphs.push({ type: "dialogue", text: trimmed });
      } else if (/^\.{2,}$|^…+$/.test(trimmed)) {
        paragraphs.push({ type: "ellipsis", text: trimmed });
      } else {
        paragraphs.push({ type: "narration", text: trimmed });
      }
    }

    return paragraphs.map((p, i) => {
      if (p.type === "dialogue") {
        return (
          <p key={i} className="pl-4 border-l-2 border-primary-300/50 text-gray-700 italic">
            {p.text}
          </p>
        );
      }
      if (p.type === "ellipsis") {
        return (
          <p key={i} className="text-center text-gray-400 tracking-widest select-none">
            {p.text}
          </p>
        );
      }
      return (
        <p key={i} className="text-gray-600 text-justify">
          {p.text}
        </p>
      );
    });
  };

  const descriptionLong = (story.description?.length ?? 0) > 500;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="section-container py-8">
            <div className="flex flex-col gap-8 md:flex-row">
              {/* Cover */}
              <div className="flex-shrink-0">
                <div className="relative mx-auto h-72 w-48 overflow-hidden rounded-2xl shadow-2xl md:mx-0 md:h-80 md:w-56 bg-gray-700">
                  {showCover && (
                    <Image
                      src={`${API_BASE_URL}/api/stories/${story.id}/cover?v=${encodeURIComponent(story.updatedAt || "2")}`}
                      alt={story.title}
                      fill
                      sizes="224px"
                      className="object-cover"
                      unoptimized
                      onError={() => setShowCover(false)}
                    />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-white">
                <h1 className="text-display-sm font-bold">{story.title}</h1>
                <Link
                  href={`/author/${story.author.id}`}
                  className="mt-2 inline-flex items-center gap-2 text-body-md text-gray-300 hover:text-white"
                >
                  {story.author.image && (
                    <Image
                      src={story.author.image}
                      alt={story.author.name}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full object-cover"
                      unoptimized
                    />
                  )}
                  {story.author.name}
                </Link>

                {/* Stats */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-body-sm text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <EyeIcon className="h-4 w-4" />
                    {story.views.toLocaleString()} lượt đọc
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HeartIcon className="h-4 w-4" />
                    {story.likes.toLocaleString()} yêu thích
                  </span>
                  {story.ratingCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      {story.averageRating}/5 ({story.ratingCount} đánh giá)
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <BookOpenIcon className="h-4 w-4" />
                    {story.chapters.length} chương
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    {story._count.comments} bình luận
                  </span>
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {story.genre && story.genre.split(", ").filter(Boolean).map((g) => (
                    <span key={g} className="rounded-full bg-primary-600/30 px-3 py-1 text-caption font-medium text-primary-200">
                      {g}
                    </span>
                  ))}
                  <span
                    className={`rounded-full px-3 py-1 text-caption font-medium ${
                      story.status === "completed"
                        ? "bg-green-600/30 text-green-200"
                        : "bg-amber-600/30 text-amber-200"
                    }`}
                  >
                    {story.status === "completed" ? "Hoàn thành" : "Đang ra"}
                  </span>
                  {story.tags && story.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-700/50 px-3 py-1 text-caption text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {story.chapters.length > 0 && (
                    <Link
                      href={`/story/${story.slug}/chapter/${story.chapters[0].id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-body-sm font-semibold text-white shadow-lg hover:bg-primary-600"
                    >
                      <BookOpenIcon className="h-5 w-5" />
                      Đọc từ đầu
                    </Link>
                  )}
                  {session && (
                    <button
                      onClick={toggleBookmark}
                      disabled={bookmarking}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-body-sm font-semibold transition-colors ${
                        isBookmarked
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {isBookmarked ? (
                        <BookmarkSolidIcon className="h-5 w-5" />
                      ) : (
                        <BookmarkIcon className="h-5 w-5" />
                      )}
                      {isBookmarked ? "Đã lưu" : "Lưu truyện"}
                    </button>
                  )}
                  {session && (
                    <button
                      onClick={toggleLike}
                      disabled={liking}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-body-sm font-semibold transition-colors ${
                        isLiked
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {isLiked ? (
                        <HeartSolidIcon className="h-5 w-5" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                      {isLiked ? "Đã thích" : "Thích"}
                    </button>
                  )}

                  {/* Share / Copy link */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-body-sm font-semibold text-white transition-colors hover:bg-white/20"
                    >
                      <ShareIcon className="h-5 w-5" />
                      Chia sẻ
                    </button>
                    {showShareMenu && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                        <button
                          onClick={() => {
                            const url = `https://vstory.vn/story/${story.slug}`;
                            navigator.clipboard.writeText(url).then(() => {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            });
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50"
                        >
                          {copied ? <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
                          {copied ? "Đã sao chép!" : "Sao chép liên kết"}
                        </button>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://vstory.vn/story/${story.slug}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          Facebook
                        </a>
                        <a
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://vstory.vn/story/${story.slug}`)}&text=${encodeURIComponent(`Đọc truyện "${story.title}" trên VStory`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          X (Twitter)
                        </a>
                        <a
                          href={`https://telegram.me/share/url?url=${encodeURIComponent(`https://vstory.vn/story/${story.slug}`)}&text=${encodeURIComponent(`Đọc truyện "${story.title}" trên VStory`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="h-4 w-4 text-sky-500" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                          Telegram
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="section-container py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-heading-sm font-bold text-gray-900">
                  <BookOpenIcon className="h-5 w-5 text-primary-500" />
                  Giới thiệu
                </h2>
                <div
                  className={`relative space-y-3 text-[15px] leading-[1.8] transition-all duration-300 ${
                    !descExpanded && descriptionLong ? "max-h-[280px] overflow-hidden" : ""
                  }`}
                >
                  {renderDescription(story.description || "")}
                  {!descExpanded && descriptionLong && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
                  )}
                </div>
                {descriptionLong && (
                  <button
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="mt-3 inline-flex items-center gap-1 text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {descExpanded ? "Thu gọn" : "Xem thêm"}
                    <svg
                      className={`h-4 w-4 transition-transform ${descExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Chapter list */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-heading-sm font-bold text-gray-900">
                    Danh sách chương ({story.chapters.length})
                  </h2>
                  <span className="text-caption text-gray-400">
                    {totalWords.toLocaleString()} chữ
                  </span>
                </div>

                {story.chapters.length === 0 ? (
                  <p className="py-8 text-center text-body-md text-gray-400">
                    Truyện chưa có chương nào
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {story.chapters.map((ch) => (
                      <Link
                        key={ch.id}
                        href={`/story/${story.slug}/chapter/${ch.id}`}
                        className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50 px-3 -mx-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex-shrink-0 text-caption font-bold text-gray-400 w-8">
                            {ch.number}
                          </span>
                          <span className="text-body-sm font-medium text-gray-800 truncate">
                            {ch.title.replace(/^Chương\s*\d+\s*[:：]\s*/i, '')}
                          </span>
                          {ch.isLocked && (
                            <LockClosedIcon className="h-4 w-4 flex-shrink-0 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-3 text-caption text-gray-400">
                          {ch.isLocked && (
                            <span className="text-amber-600 font-medium">{ch.price} xu</span>
                          )}
                          <span>{ch.wordCount.toLocaleString()} chữ</span>
                          <span className="hidden sm:inline">
                            {new Date(ch.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating section */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-heading-sm font-bold text-gray-900">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  Đánh giá truyện
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-display-sm font-bold text-gray-900">{story.averageRating || "—"}</p>
                    <p className="text-caption text-gray-500">{story.ratingCount} đánh giá</p>
                  </div>
                  {session && (
                    <div className="flex-1">
                      <p className="mb-2 text-body-sm text-gray-600">
                        {userRating > 0 ? `Bạn đã đánh giá ${userRating}/5` : "Đánh giá truyện này"}
                      </p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => submitRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            disabled={ratingLoading}
                            className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
                          >
                            {(hoverRating || userRating) >= star ? (
                              <StarSolidIcon className="h-7 w-7 text-yellow-400" />
                            ) : (
                              <StarIcon className="h-7 w-7 text-gray-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments section */}
              <CommentSection
                storyId={story.id}
                session={session}
                token={token}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author card */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-body-sm font-semibold text-gray-700">Tác giả</h3>
                <Link
                  href={`/author/${story.author.id}`}
                  className="flex items-center gap-3 rounded-xl p-2 -m-2 transition-colors hover:bg-gray-50"
                >
                  {story.author.image ? (
                    <Image
                      src={story.author.image}
                      alt={story.author.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-heading-sm font-bold text-primary-600">
                      {story.author.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-body-sm font-semibold text-gray-900">{story.author.name}</p>
                    {story.author.bio && (
                      <p className="mt-0.5 text-caption text-gray-500 line-clamp-2">
                        {story.author.bio}
                      </p>
                    )}
                  </div>
                </Link>
              </div>

              {/* Story stats */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-body-sm font-semibold text-gray-700">Thông tin</h3>
                <div className="space-y-3 text-body-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Thể loại</span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {story.genre?.split(",").map((g) => g.trim()).filter(Boolean).map((g) => (
                        <span key={g} className="rounded bg-gray-100 px-1.5 py-0.5 text-caption font-medium text-gray-800">{g}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trạng thái</span>
                    <span className="font-medium text-gray-800">
                      {story.status === "completed" ? "Hoàn thành" : "Đang ra"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số chương</span>
                    <span className="font-medium text-gray-800">{story.chapters.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tổng chữ</span>
                    <span className="font-medium text-gray-800">
                      {totalWords.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lượt đọc</span>
                    <span className="font-medium text-gray-800">
                      {story.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Đánh giá</span>
                    <span className="font-medium text-gray-800">
                      {story.ratingCount > 0 ? `${story.averageRating}/5 (${story.ratingCount})` : "Chưa có"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Đã lưu</span>
                    <span className="font-medium text-gray-800">
                      {story._count.bookmarks}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar ad */}
              <div className="py-2">
                <AdSenseSlot slot="1336707630" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
