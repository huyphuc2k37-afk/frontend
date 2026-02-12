"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  PencilSquareIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  bio: string | null;
  createdAt: string;
  stories: {
    id: string;
    title: string;
    slug: string;
    views: number;
    likes: number;
    status: string;
    createdAt: string;
  }[];
  _count: { stories: number; bookmarks: number; comments: number };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      const token = (session as any).accessToken;
      fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          setEditName(data.name);
          setEditBio(data.bio || "");
          setEditImage(data.image || null);
          setLoading(false);
        });
    }
  }, [status, router]);

  const readFileAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSave = async () => {
    const token = (session as any).accessToken;
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName, bio: editBio, image: editImage }),
    });
    const updated = await res.json();
    setProfile((p) => (p ? { ...p, name: updated.name, bio: updated.bio, image: updated.image } : p));
    setEditing(false);
  };

  if (loading || !profile) {
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
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left — Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-6 shadow-card lg:col-span-1"
            >
              <div className="text-center">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt=""
                    width={96}
                    height={96}
                    className="mx-auto rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary">
                    <span className="text-display-sm font-bold text-white">
                      {profile.name[0]}
                    </span>
                  </div>
                )}

                {editing ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-col items-center gap-3">
                      {editImage ? (
                        <Image
                          src={editImage}
                          alt=""
                          width={96}
                          height={96}
                          className="rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary">
                          <span className="text-display-sm font-bold text-white">
                            {editName?.[0] || profile.name[0]}
                          </span>
                        </div>
                      )}

                      <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-body-sm text-gray-700 hover:bg-gray-50">
                        Tải ảnh đại diện
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setImageError(null);

                            if (file.size > 2 * 1024 * 1024) {
                              setImageError("Ảnh tối đa 2MB");
                              return;
                            }

                            try {
                              const dataUrl = await readFileAsDataURL(file);
                              setEditImage(dataUrl);
                            } catch {
                              setImageError("Không thể đọc file ảnh");
                            }
                          }}
                        />
                      </label>
                      {imageError ? <p className="text-caption text-red-500">{imageError}</p> : null}
                    </div>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-body-md"
                    />
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      placeholder="Giới thiệu bản thân..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-body-sm"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="btn-primary flex-1 py-2 text-sm">
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="mt-4 text-heading-md font-bold text-gray-900">
                      {profile.name}
                    </h1>
                    <p className="text-body-sm text-gray-500">{profile.email}</p>
                    {profile.bio && (
                      <p className="mt-3 text-body-sm text-gray-600">
                        {profile.bio}
                      </p>
                    )}
                    <span
                      className={`mt-3 inline-block rounded-full px-3 py-1 text-caption font-semibold ${
                        profile.role === "author"
                          ? "bg-primary-100 text-primary-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {profile.role === "author" ? "Tác giả" : "Độc giả"}
                    </span>
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-body-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Chỉnh sửa
                    </button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                {[
                  { icon: BookOpenIcon, label: "Truyện", value: profile._count.stories },
                  { icon: BookmarkIcon, label: "Đã lưu", value: profile._count.bookmarks },
                  { icon: ChatBubbleLeftIcon, label: "Bình luận", value: profile._count.comments },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <s.icon className="mx-auto h-5 w-5 text-gray-400" />
                    <p className="mt-1 text-heading-sm font-bold text-gray-900">
                      {s.value}
                    </p>
                    <p className="text-caption text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-center text-caption text-gray-400">
                Tham gia từ {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </motion.div>

            {/* Right — content */}
            <div className="lg:col-span-2">
              {/* My stories */}
              {profile.stories.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl bg-white p-6 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-heading-md font-bold text-gray-900">
                      Truyện của tôi
                    </h2>
                    <Link href="/write" className="text-body-sm font-medium text-primary-600 hover:text-primary-500">
                      Viết truyện mới →
                    </Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {profile.stories.map((story) => (
                      <Link
                        key={story.id}
                        href={`/story/${story.slug}`}
                        className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                      >
                        <div>
                          <h3 className="text-body-md font-semibold text-gray-900">
                            {story.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-4 text-caption text-gray-500">
                            <span className="flex items-center gap-1">
                              <EyeIcon className="h-3.5 w-3.5" />
                              {story.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <HeartIcon className="h-3.5 w-3.5" />
                              {story.likes.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-caption font-semibold ${
                            story.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {story.status === "completed" ? "Hoàn thành" : "Đang ra"}
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Quick actions */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 rounded-2xl bg-white p-6 shadow-card"
              >
                <h2 className="text-heading-md font-bold text-gray-900">
                  Hành động nhanh
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/bookshelf"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                  >
                    <BookmarkIcon className="h-6 w-6 text-primary-500" />
                    <span className="text-body-sm font-medium text-gray-700">
                      Tủ truyện
                    </span>
                  </Link>
                  <Link
                    href="/explore"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                  >
                    <BookOpenIcon className="h-6 w-6 text-accent-500" />
                    <span className="text-body-sm font-medium text-gray-700">
                      Khám phá
                    </span>
                  </Link>
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
