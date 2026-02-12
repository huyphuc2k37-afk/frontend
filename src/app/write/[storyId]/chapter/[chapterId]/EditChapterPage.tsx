"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  LockClosedIcon,
  LockOpenIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useStudio } from "@/components/StudioLayout";
import { API_BASE_URL } from "@/lib/api";

interface ChapterData {
  id: string;
  title: string;
  number: number;
  content: string;
  wordCount: number;
  authorNote: string | null;
  isLocked: boolean;
  price: number;
  story: { id: string; title: string; slug: string };
}

export default function EditChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useStudio();
  const storyId = params.storyId as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorNote, setAuthorNote] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [price, setPrice] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (!token || !chapterId) return;
    fetch(`${API_BASE_URL}/api/manage/chapters/${chapterId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data: ChapterData) => {
        setChapter(data);
        setTitle(data.title);
        setContent(data.content);
        setAuthorNote(data.authorNote || "");
        setIsLocked(data.isLocked);
        setPrice(data.price);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push(`/write/${storyId}`);
      });
  }, [token, chapterId, storyId, router]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề chương");
      return;
    }
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung chương");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manage/chapters/${chapterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          authorNote: authorNote.trim() || null,
          isLocked,
          price: isLocked ? price : 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Không thể lưu chương");
        setSaving(false);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Lỗi kết nối server");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/write/${storyId}`}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-heading-md font-bold text-gray-900">
              Chỉnh sửa chương {chapter.number}
            </h2>
            <p className="text-caption text-gray-500">
              {chapter.story.title} · {wordCount} chữ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-caption font-medium text-emerald-600">Đã lưu ✓</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {saving ? "Đang lưu..." : "Lưu chương"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-600">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-body-sm font-semibold text-gray-700">Tiêu đề chương</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-body-md focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-body-sm font-semibold text-gray-700">Nội dung</label>
          <span className="flex items-center gap-1 text-caption text-gray-400">
            <DocumentTextIcon className="h-3.5 w-3.5" />
            {wordCount} chữ
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={24}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-body-sm leading-relaxed focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Author note */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-body-sm font-semibold text-gray-700">
          Lời tác giả <span className="font-normal text-gray-400">(không bắt buộc)</span>
        </label>
        <textarea
          value={authorNote}
          onChange={(e) => setAuthorNote(e.target.value)}
          rows={3}
          placeholder="Chia sẻ cảm nghĩ hoặc ghi chú với độc giả..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-body-sm leading-relaxed focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Lock settings */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-body-sm font-semibold text-gray-700">Cài đặt chương</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLocked ? (
              <LockClosedIcon className="h-5 w-5 text-amber-500" />
            ) : (
              <LockOpenIcon className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="text-body-sm font-medium text-gray-800">Chương trả phí</p>
              <p className="text-caption text-gray-400">Độc giả cần trả xu để đọc chương này</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              isLocked ? "bg-primary-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                isLocked ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
        {isLocked && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <label className="mb-1 block text-caption font-medium text-gray-600">Giá (xu)</label>
            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="flex justify-end gap-3 pb-8">
        <Link
          href={`/write/${storyId}`}
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-body-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Quay lại
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600 disabled:opacity-50"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
          {saving ? "Đang lưu..." : "Lưu chương"}
        </button>
      </div>
    </div>
  );
}
