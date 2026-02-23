"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  TrashIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useStudio } from "@/components/StudioLayout";
import { API_BASE_URL } from "@/lib/api";

interface ParsedChapter {
  id: string;
  title: string;
  content: string;
  isLocked: boolean;
  price: number;
}

// Common chapter title patterns in Vietnamese stories
const CHAPTER_PATTERNS = [
  /^Chương\s+\d+/im,
  /^CHƯƠNG\s+\d+/m,
  /^Chapter\s+\d+/im,
  /^Hồi\s+\d+/im,
  /^Phần\s+\d+/im,
  /^Quyển\s+\d+/im,
];

function detectAndSplitChapters(text: string): ParsedChapter[] {
  // Try each pattern to find the best split
  for (const pattern of CHAPTER_PATTERNS) {
    const globalPattern = new RegExp(pattern.source, "gim");
    const matches = [...text.matchAll(globalPattern)];
    if (matches.length >= 2) {
      return splitByMatches(text, matches);
    }
  }

  // Fallback: try splitting by "---" or "***" separators
  const separatorPattern = /^[\s]*(?:---+|===+|\*\*\*+)[\s]*$/gm;
  const sepMatches = [...text.matchAll(separatorPattern)];
  if (sepMatches.length >= 1) {
    return splitBySeparators(text, sepMatches);
  }

  // No pattern found — return entire text as single chapter
  return [
    {
      id: crypto.randomUUID(),
      title: "Chương 1",
      content: text.trim(),
      isLocked: false,
      price: 0,
    },
  ];
}

function splitByMatches(
  text: string,
  matches: RegExpMatchArray[]
): ParsedChapter[] {
  const chapters: ParsedChapter[] = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const chunk = text.slice(start, end).trim();

    // First line = title, rest = content
    const firstNewline = chunk.indexOf("\n");
    let title: string;
    let content: string;
    if (firstNewline === -1) {
      title = chunk;
      content = "";
    } else {
      title = chunk.slice(0, firstNewline).trim();
      content = chunk.slice(firstNewline + 1).trim();
    }

    // Clean title — remove trailing colons, dashes etc.
    title = title.replace(/[:：\-–—]+\s*$/, "").trim();

    chapters.push({
      id: crypto.randomUUID(),
      title,
      content,
      isLocked: false,
      price: 0,
    });
  }

  return chapters;
}

function splitBySeparators(
  text: string,
  separators: RegExpMatchArray[]
): ParsedChapter[] {
  const chapters: ParsedChapter[] = [];
  let lastEnd = 0;

  for (let i = 0; i <= separators.length; i++) {
    const start = lastEnd;
    const end =
      i < separators.length ? separators[i].index! : text.length;
    const chunk = text.slice(start, end).trim();
    if (i < separators.length) {
      lastEnd = separators[i].index! + separators[i][0].length;
    }

    if (!chunk) continue;

    // Try to extract title from first line
    const firstNewline = chunk.indexOf("\n");
    let title: string;
    let content: string;
    if (firstNewline === -1) {
      title = `Chương ${chapters.length + 1}`;
      content = chunk;
    } else {
      const firstLine = chunk.slice(0, firstNewline).trim();
      // If first line looks like a title (short, no period)
      if (firstLine.length < 100 && !firstLine.endsWith(".")) {
        title = firstLine;
        content = chunk.slice(firstNewline + 1).trim();
      } else {
        title = `Chương ${chapters.length + 1}`;
        content = chunk;
      }
    }

    chapters.push({
      id: crypto.randomUUID(),
      title,
      content,
      isLocked: false,
      price: 0,
    });
  }

  return chapters;
}

function wordCount(text: string): number {
  return text
    .replace(/<[^>]*>/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
}

export default function BulkChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useStudio();
  const storyId = params.storyId as string;

  const [chapters, setChapters] = useState<ParsedChapter[]>([]);
  const [storyTitle, setStoryTitle] = useState("");
  const [existingCount, setExistingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ count: number; firstNumber: number; lastNumber: number } | null>(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [defaultLocked, setDefaultLocked] = useState(false);
  const [defaultPrice, setDefaultPrice] = useState(200);
  const [parseMode, setParseMode] = useState<"paste" | "file">("paste");
  const [rawText, setRawText] = useState("");

  // Fetch story info
  useEffect(() => {
    if (!token || !storyId) return;
    fetch(`${API_BASE_URL}/api/manage/stories/${storyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setStoryTitle(data.title);
        setExistingCount(data.chapters?.length || 0);
        setLoading(false);
      })
      .catch(() => {
        router.push("/write/stories");
      });
  }, [token, storyId, router]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (!text?.trim()) {
          setError("File rỗng");
          return;
        }
        setRawText(text);
        const parsed = detectAndSplitChapters(text);
        setChapters(parsed);
        setError("");
      };
      reader.readAsText(file);
    },
    []
  );

  const handleParse = useCallback(() => {
    if (!rawText.trim()) {
      setError("Vui lòng dán nội dung truyện");
      return;
    }
    const parsed = detectAndSplitChapters(rawText);
    setChapters(parsed);
    setError("");
  }, [rawText]);

  const updateChapter = (id: string, updates: Partial<ParsedChapter>) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch))
    );
  };

  const removeChapter = (id: string) => {
    setChapters((prev) => prev.filter((ch) => ch.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const moveChapter = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= chapters.length) return;
    setChapters((prev) => {
      const arr = [...prev];
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  };

  const applyLockSettings = () => {
    setChapters((prev) =>
      prev.map((ch, i) => {
        const chapterNumber = existingCount + i + 1;
        if (chapterNumber <= 10) return { ...ch, isLocked: false, price: 0 };
        return { ...ch, isLocked: defaultLocked, price: defaultLocked ? defaultPrice : 0 };
      })
    );
  };

  const handleSubmit = async () => {
    if (chapters.length === 0) {
      setError("Chưa có chương nào để đăng");
      return;
    }

    const emptyChapters = chapters.filter((ch) => !ch.content.trim());
    if (emptyChapters.length > 0) {
      setError(`Có ${emptyChapters.length} chương chưa có nội dung`);
      return;
    }

    setUploading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/manage/stories/${storyId}/chapters/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chapters: chapters.map((ch) => ({
              title: ch.title,
              content: ch.content,
              isLocked: ch.isLocked,
              price: ch.price,
            })),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể đăng chương");
        setUploading(false);
        return;
      }

      setResult(data);
    } catch {
      setError("Lỗi kết nối server");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // Success screen
  if (result) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-500" />
        <h2 className="mt-4 text-heading-md font-bold text-gray-900">
          Đăng thành công!
        </h2>
        <p className="mt-2 text-body-sm text-gray-600">
          Đã tạo <strong>{result.count}</strong> chương (Chương {result.firstNumber}–{result.lastNumber}) cho truyện <strong>{storyTitle}</strong>.
        </p>
        <p className="mt-1 text-caption text-gray-500">
          Các chương đang chờ kiểm duyệt viên phê duyệt.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/write/${storyId}`}
            className="rounded-xl bg-primary-500 px-6 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600"
          >
            Xem danh sách chương
          </Link>
          <Link
            href="/write/stories"
            className="rounded-xl border border-gray-200 px-6 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Quay lại truyện
          </Link>
        </div>
      </div>
    );
  }

  const totalWords = chapters.reduce((acc, ch) => acc + wordCount(ch.content), 0);

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
            <h1 className="text-heading-md font-bold text-gray-900">
              Đăng nhiều chương
            </h1>
            <p className="text-caption text-gray-500">
              {storyTitle} • Hiện có {existingCount} chương
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Input */}
      {chapters.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-body-lg font-semibold text-gray-900 mb-4">
            Bước 1: Nhập nội dung truyện
          </h3>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setParseMode("paste")}
              className={`rounded-lg px-4 py-2 text-body-sm font-medium transition-colors ${
                parseMode === "paste"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <DocumentTextIcon className="mr-1.5 inline h-4 w-4" />
              Dán văn bản
            </button>
            <button
              onClick={() => setParseMode("file")}
              className={`rounded-lg px-4 py-2 text-body-sm font-medium transition-colors ${
                parseMode === "file"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ArrowUpTrayIcon className="mr-1.5 inline h-4 w-4" />
              Tải file lên
            </button>
          </div>

          {parseMode === "paste" ? (
            <>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Dán toàn bộ nội dung truyện vào đây...\n\nHệ thống sẽ tự động nhận diện các chương theo format:\n\nChương 1: Tiêu đề chương\nNội dung chương 1...\n\nChương 2: Tiêu đề chương\nNội dung chương 2...\n\nHoặc dùng dấu --- để ngăn cách các chương.`}
                className="h-80 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-body-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none font-mono"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-caption text-gray-400">
                  {rawText.length > 0 ? `${rawText.length.toLocaleString()} ký tự` : ""}
                </span>
                <button
                  onClick={handleParse}
                  disabled={!rawText.trim()}
                  className="rounded-xl bg-primary-500 px-6 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600 disabled:opacity-50"
                >
                  Tách chương tự động
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12">
              <ArrowUpTrayIcon className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-body-sm text-gray-500">
                Chọn file <strong>.txt</strong> chứa toàn bộ nội dung truyện
              </p>
              <label className="mt-4 cursor-pointer rounded-xl bg-primary-500 px-6 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600">
                Chọn file
                <input
                  type="file"
                  accept=".txt,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="mt-2 text-[11px] text-gray-400">
                Hỗ trợ file .txt (UTF-8)
              </p>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <p className="text-caption text-blue-700 font-medium mb-1">💡 Mẹo tách chương</p>
            <ul className="text-[11px] text-blue-600 space-y-0.5 list-disc list-inside">
              <li>Đặt tiêu đề chương trên một dòng riêng: <code className="bg-blue-100 px-1 rounded">Chương 1: Khởi đầu</code></li>
              <li>Hoặc dùng dấu <code className="bg-blue-100 px-1 rounded">---</code> để ngăn cách các chương</li>
              <li>Hỗ trợ: &quot;Chương X&quot;, &quot;Chapter X&quot;, &quot;Hồi X&quot;, &quot;Phần X&quot;, &quot;Quyển X&quot;</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 2: Review & Edit */}
      {chapters.length > 0 && (
        <>
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <div className="flex-1">
              <span className="text-body-lg font-bold text-gray-900">
                {chapters.length} chương
              </span>
              <span className="ml-2 text-body-sm text-gray-500">
                • {totalWords.toLocaleString()} chữ tổng cộng
              </span>
              <span className="ml-2 text-caption text-gray-400">
                (Chương {existingCount + 1}–{existingCount + chapters.length})
              </span>
            </div>
            <button
              onClick={() => {
                setChapters([]);
                setRawText("");
              }}
              className="rounded-lg px-3 py-1.5 text-caption font-medium text-gray-500 hover:bg-gray-100"
            >
              Nhập lại
            </button>
          </div>

          {/* Bulk lock settings */}
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <h4 className="text-body-sm font-semibold text-gray-900 mb-3">
              Cài đặt khóa chương hàng loạt
            </h4>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={defaultLocked}
                  onChange={(e) => setDefaultLocked(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                />
                <span className="text-body-sm text-gray-700">Khóa chương từ chương 11 trở đi</span>
              </label>
              {defaultLocked && (
                <div className="flex items-center gap-2">
                  <span className="text-caption text-gray-500">Giá:</span>
                  <input
                    type="number"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Math.max(100, Math.min(5000, parseInt(e.target.value) || 100)))}
                    min={100}
                    max={5000}
                    step={50}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-body-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                  <span className="text-caption text-gray-500">xu/chương</span>
                </div>
              )}
              <button
                onClick={applyLockSettings}
                className="rounded-lg bg-gray-100 px-4 py-1.5 text-caption font-medium text-gray-700 hover:bg-gray-200"
              >
                Áp dụng
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              10 chương đầu tiên luôn miễn phí theo quy định.
            </p>
          </div>

          {/* Chapter list */}
          <div className="space-y-2">
            {chapters.map((ch, index) => {
              const chapterNumber = existingCount + index + 1;
              const words = wordCount(ch.content);
              const isExpanded = expandedId === ch.id;

              return (
                <div
                  key={ch.id}
                  className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
                >
                  {/* Chapter header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : ch.id)}
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-[11px] font-bold text-gray-500">
                      {chapterNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm font-medium text-gray-900 truncate">
                        {ch.title}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span>{words.toLocaleString()} chữ</span>
                        {ch.isLocked ? (
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <LockClosedIcon className="h-3 w-3" />
                            {ch.price} xu
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-emerald-500">
                            <LockOpenIcon className="h-3 w-3" />
                            Miễn phí
                          </span>
                        )}
                        {words === 0 && (
                          <span className="text-red-500 font-medium">⚠ Trống</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => moveChapter(index, -1)}
                        disabled={index === 0}
                        className="rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-30"
                        title="Di chuyển lên"
                      >
                        <ChevronUpIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveChapter(index, 1)}
                        disabled={index === chapters.length - 1}
                        className="rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-30"
                        title="Di chuyển xuống"
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeChapter(ch.id)}
                        className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
                        title="Xóa chương"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded editor */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-4 space-y-3 bg-gray-50/50">
                      <div>
                        <label className="text-caption font-medium text-gray-600 mb-1 block">
                          Tiêu đề
                        </label>
                        <input
                          type="text"
                          value={ch.title}
                          onChange={(e) => updateChapter(ch.id, { title: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-body-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                      <div>
                        <label className="text-caption font-medium text-gray-600 mb-1 block">
                          Nội dung ({words.toLocaleString()} chữ)
                        </label>
                        <textarea
                          value={ch.content}
                          onChange={(e) => updateChapter(ch.id, { content: e.target.value })}
                          rows={8}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-body-sm font-mono resize-none focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ch.isLocked}
                            disabled={chapterNumber <= 10}
                            onChange={(e) =>
                              updateChapter(ch.id, {
                                isLocked: e.target.checked,
                                price: e.target.checked ? (ch.price || 200) : 0,
                              })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                          />
                          <span className="text-body-sm text-gray-700">
                            Khóa chương
                          </span>
                        </label>
                        {ch.isLocked && (
                          <input
                            type="number"
                            value={ch.price}
                            onChange={(e) =>
                              updateChapter(ch.id, {
                                price: Math.max(100, Math.min(5000, parseInt(e.target.value) || 100)),
                              })
                            }
                            min={100}
                            max={5000}
                            step={50}
                            className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-body-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                          />
                        )}
                        {chapterNumber <= 10 && (
                          <span className="text-[11px] text-gray-400">
                            (10 chương đầu miễn phí)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-body-sm text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <p className="text-caption text-gray-500">
              Tất cả chương sẽ ở trạng thái &quot;Chờ duyệt&quot; sau khi đăng.
            </p>
            <button
              onClick={handleSubmit}
              disabled={uploading || chapters.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang đăng...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Đăng {chapters.length} chương
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Error (step 1) */}
      {chapters.length === 0 && error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-body-sm text-red-600">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
