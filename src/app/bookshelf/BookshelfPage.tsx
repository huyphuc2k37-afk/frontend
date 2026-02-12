"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpenIcon,
  BookmarkIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api";

interface BookmarkItem {
  id: string;
  createdAt: string;
  story: {
    id: string;
    title: string;
    slug: string;
    genre: string;
    status: string;
    views: number;
    author: { name: string; image: string | null };
    _count: { chapters: number };
  };
}

export default function BookshelfPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      const token = (session as any).accessToken;
      fetch(`${API_BASE_URL}/api/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setBookmarks(data);
          setLoading(false);
        });
    }
  }, [status, router]);

  const handleRemove = async (storyId: string) => {
    const token = (session as any).accessToken;
    await fetch(`${API_BASE_URL}/api/bookmarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ storyId }),
    });
    setBookmarks((prev) => prev.filter((b) => b.story.id !== storyId));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="section-container py-8">
          <div>
            <div className="flex items-center gap-3">
              <BookmarkIcon className="h-8 w-8 text-primary-500" />
              <h1 className="text-display-sm font-bold text-gray-900">
                Tủ truyện
              </h1>
            </div>
            <p className="mt-2 text-body-md text-gray-500">
              {bookmarks.length} truyện đã lưu
            </p>
          </div>

          {bookmarks.length === 0 ? (
            <div
              className="mt-16 text-center"
            >
              <BookOpenIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h2 className="mt-4 text-heading-md font-semibold text-gray-500">
                Tủ truyện trống
              </h2>
              <p className="mt-2 text-body-md text-gray-400">
                Hãy khám phá và lưu những truyện yêu thích!
              </p>
              <Link href="/explore" className="btn-primary mt-6 inline-block">
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    <Link href={`/story/${bm.story.slug}`} className="flex gap-4 p-4">
                      <div className="relative h-32 w-22 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img
                          src={`${API_BASE_URL}/api/stories/${bm.story.id}/cover`}
                          alt={bm.story.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-body-md font-semibold text-gray-900 line-clamp-2">
                          {bm.story.title}
                        </h3>
                        <p className="mt-1 text-caption text-gray-500">
                          {bm.story.author.name}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-caption text-primary-700">
                            {bm.story.genre}
                          </span>
                          <span className="flex items-center gap-1 text-caption text-gray-400">
                            <BookOpenIcon className="h-3 w-3" />
                            {bm.story._count.chapters} chương
                          </span>
                          <span className="flex items-center gap-1 text-caption text-gray-400">
                            <EyeIcon className="h-3 w-3" />
                            {bm.story.views.toLocaleString()}
                          </span>
                        </div>
                        <span
                          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-caption font-medium ${
                            bm.story.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {bm.story.status === "completed" ? "Hoàn thành" : "Đang ra"}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemove(bm.story.id)}
                      className="absolute right-2 top-2 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      title="Bỏ lưu"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
