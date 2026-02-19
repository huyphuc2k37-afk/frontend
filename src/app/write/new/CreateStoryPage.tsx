"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  MapIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { API_BASE_URL } from "@/lib/api";
import { genreGroups } from "@/data/genres";

/* ────── Constants ────── */

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

interface ApiTag {
  id: string;
  name: string;
  slug: string;
  type: string;
}

const TAG_TYPE_LABELS: Record<string, string> = {
  genre: "Thể loại",
  setting: "Bối cảnh",
  tone: "Phong cách",
  relation: "Quan hệ",
  ending: "Kết cục",
  perspective: "Góc nhìn",
  content: "Nội dung",
  form: "Hình thức",
  mature: "Nội dung người lớn",
};

const tagCategories: Record<string, string[]> = {
  "Phân loại": ["Truyện sáng tác", "Fanfic", "Oneshot"],
  "Hình thức": ["Truyện chữ", "Light Novel", "Web Novel"],
};

const audienceOptions = [
  { value: "13-17", label: "13 – 17 tuổi" },
  { value: "18-25", label: "18 – 25 tuổi" },
  { value: "25+", label: "> 25 tuổi" },
];

const dayOptions = [
  { value: "mon", label: "Hai" },
  { value: "tue", label: "Ba" },
  { value: "wed", label: "Tư" },
  { value: "thu", label: "Năm" },
  { value: "fri", label: "Sáu" },
  { value: "sat", label: "Bảy" },
  { value: "sun", label: "CN" },
  { value: "none", label: "Không cố định" },
];

const tabs = [
  { id: "info", label: "Thông tin truyện", icon: BookOpenIcon },
  { id: "outline", label: "Đề cương", icon: MapIcon },
  { id: "settings", label: "Cài đặt", icon: Cog6ToothIcon },
];

interface Character {
  name: string;
  role: string;
  description: string;
}

interface PlotPoint {
  order: number;
  title: string;
  summary: string;
}

/* ────── Component ────── */

export default function CreateStoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tab 1: Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTagCat, setActiveTagCat] = useState("genre");
  // API-driven categories & tags
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [apiTags, setApiTags] = useState<ApiTag[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Tab 2: Outline
  const [theme, setTheme] = useState("");
  const [expectedChapters, setExpectedChapters] = useState("");
  const [worldBuilding, setWorldBuilding] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);

  // Tab 3: Settings
  const [targetAudience, setTargetAudience] = useState("");
  const [postSchedule, setPostSchedule] = useState<string[]>([]);
  const [isAdult, setIsAdult] = useState(false);
  const [storyStatus, setStoryStatus] = useState("ongoing");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/write/new");
  }, [status, router]);

  // Fetch categories & tags from API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => setApiCategories(data?.categories || []))
      .catch(() => {});
    fetch(`${API_BASE_URL}/api/tags`)
      .then((r) => r.json())
      .then((data) => {
        const grouped = data?.tags;
        if (grouped && typeof grouped === "object" && !Array.isArray(grouped)) {
          setApiTags(Object.values(grouped).flat() as ApiTag[]);
        } else {
          setApiTags(Array.isArray(grouped) ? grouped : []);
        }
      })
      .catch(() => {});
  }, []);

  const tagsByType = apiTags.reduce<Record<string, ApiTag[]>>((acc, t) => {
    (acc[t.type] = acc[t.type] || []).push(t);
    return acc;
  }, {});

  const toggleApiTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : prev.length < 20 ? [...prev, tagId] : prev
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleDay = (day: string) => {
    if (day === "none") {
      setPostSchedule(["none"]);
      return;
    }
    setPostSchedule((prev) => {
      const filtered = prev.filter((d) => d !== "none");
      return filtered.includes(day) ? filtered.filter((d) => d !== day) : [...filtered, day];
    });
  };

  const addCharacter = () => {
    setCharacters([...characters, { name: "", role: "", description: "" }]);
  };

  const updateCharacter = (i: number, field: keyof Character, value: string) => {
    const updated = [...characters];
    updated[i][field] = value;
    setCharacters(updated);
  };

  const removeCharacter = (i: number) => {
    setCharacters(characters.filter((_, idx) => idx !== i));
  };

  const addPlotPoint = () => {
    setPlotPoints([...plotPoints, { order: plotPoints.length + 1, title: "", summary: "" }]);
  };

  const updatePlotPoint = (i: number, field: keyof PlotPoint, value: string) => {
    const updated = [...plotPoints];
    if (field === "order") updated[i][field] = parseInt(value) || 0;
    else (updated[i] as any)[field] = value;
    setPlotPoints(updated);
  };

  const removePlotPoint = (i: number) => {
    setPlotPoints(plotPoints.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, order: idx + 1 })));
  };

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Vui lòng nhập tên truyện";
    if (!description.trim()) e.description = "Vui lòng nhập giới thiệu";
    if (genres.length === 0) e.genre = "Vui lòng chọn ít nhất 1 thể loại";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [title, description, genres]);

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!validate()) {
      setActiveTab("info");
      return;
    }

    setSaving(true);
    const token = (session as any)?.accessToken;
    const slug = generateSlug(title);

    const body = {
      title, slug, description, genre: genres.join(", "),
      categoryId: selectedCategoryId || undefined,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      coverImage: coverImage || undefined,
      tags: selectedTags.join(","),
      theme: theme || undefined,
      expectedChapters: expectedChapters || undefined,
      worldBuilding: worldBuilding || undefined,
      characters: characters.length ? JSON.stringify(characters) : undefined,
      plotOutline: plotPoints.length ? JSON.stringify(plotPoints) : undefined,
      targetAudience: targetAudience || undefined,
      postSchedule: postSchedule.length ? postSchedule.join(",") : undefined,
      isAdult: isAdult,
      status: storyStatus,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/manage/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/write/${data.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Có lỗi xảy ra");
      }
    } catch {
      alert("Không thể kết nối server");
    }
    setSaving(false);
  };

  const tabProgress = () => {
    let done = 0;
    if (title && description && genres.length > 0) done++;
    if (theme || worldBuilding || characters.length > 0) done++;
    if (targetAudience || postSchedule.length > 0) done++;
    return done;
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
          {/* Top bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/write" className="rounded-lg p-2 text-gray-400 hover:bg-gray-200">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-heading-lg font-bold text-gray-900">Tạo truyện mới</h1>
                <p className="text-body-sm text-gray-500">Hoàn thành {tabProgress()}/3 phần</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-50"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <CheckCircleIcon className="h-5 w-5" />
              )}
              {saving ? "Đang lưu..." : "Lưu truyện"}
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            {/* Sidebar tabs */}
            <nav className="space-y-1 lg:sticky lg:top-24 lg:self-start">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-body-md font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary-50 text-primary-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="h-5 w-5 flex-shrink-0" />
                  {tab.label}
                </button>
              ))}

              {/* Tip box */}
              <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                <SparklesIcon className="mb-2 h-5 w-5 text-primary-500" />
                <p className="text-caption text-primary-700">
                  <strong>Mẹo:</strong> Chỉ cần điền <em>Thông tin truyện</em> là đủ để bắt đầu. Đề cương & Cài đặt có thể bổ sung sau.
                </p>
              </div>
            </nav>

            {/* Content area */}
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                {/* ═══ TAB 1: Thông tin truyện ═══ */}
                {activeTab === "info" && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Cover + Title row */}
                    <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
                      {/* Cover */}
                      <div>
                        <label className="mb-2 block text-body-sm font-semibold text-gray-700">
                          Ảnh bìa
                        </label>
                        <label className="block cursor-pointer">
                          <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-primary-400 hover:bg-primary-50/50">
                            {coverImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                            ) : (
                              <div className="text-center">
                                <PhotoIcon className="mx-auto h-10 w-10 text-gray-300" />
                                <p className="mt-2 text-caption text-gray-400">Tải ảnh lên</p>
                                <p className="text-caption text-gray-300">3:4, tối đa 2MB</p>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setCoverError(null);
                              if (file.size > 2 * 1024 * 1024) {
                                setCoverError("Ảnh bìa tối đa 2MB");
                                return;
                              }
                              try {
                                const reader = new FileReader();
                                reader.onload = () => setCoverImage(String(reader.result));
                                reader.onerror = () => setCoverError("Không thể đọc file ảnh");
                                reader.readAsDataURL(file);
                              } catch {
                                setCoverError("Không thể đọc file ảnh");
                              }
                            }}
                          />
                        </label>
                        {coverError ? <p className="mt-2 text-caption text-red-500">{coverError}</p> : null}
                      </div>

                      {/* Title + Description */}
                      <div className="space-y-5">
                        <div>
                          <label className="mb-1.5 block text-body-sm font-semibold text-gray-700">
                            Tên truyện <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Thả vào đây một cái tên thật cách sẵn nào!"
                            className={`w-full rounded-xl border px-4 py-3 text-body-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                              errors.title ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-primary-500"
                            }`}
                          />
                          {errors.title && <p className="mt-1 text-caption text-red-500">{errors.title}</p>}
                        </div>

                        <div>
                          <label className="mb-1.5 block text-body-sm font-semibold text-gray-700">
                            Giới thiệu <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            placeholder="Tạo nội dung một chút để truyện trông thật thú vị..."
                            className={`w-full rounded-xl border px-4 py-3 text-body-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                              errors.description ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-primary-500"
                            }`}
                          />
                          {errors.description && <p className="mt-1 text-caption text-red-500">{errors.description}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <label className="mb-3 block text-body-sm font-semibold text-gray-700">
                        Danh mục <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {apiCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? "" : cat.id)}
                            className={`rounded-full px-4 py-2 text-body-sm font-medium transition-all ${
                              selectedCategoryId === cat.id
                                ? "bg-primary-600 text-white shadow-md ring-2 ring-primary-300"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {cat.icon} {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Genre (multi-select) */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <div className="mb-3 flex items-center justify-between">
                        <label className="text-body-sm font-semibold text-gray-700">
                          Thể loại chính <span className="text-red-500">*</span>
                        </label>
                        <span className="text-caption text-gray-400">Đã chọn {genres.length}/5</span>
                      </div>
                      {errors.genre && <p className="mb-2 text-caption text-red-500">{errors.genre}</p>}

                      {genres.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {genres.map((g) => (
                            <span key={g} className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-caption font-medium text-primary-700">
                              {g}
                              <button onClick={() => setGenres((prev) => prev.filter((x) => x !== g))} className="ml-0.5 hover:text-red-500">
                                <XMarkIcon className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                        {genreGroups.map((group) => (
                          <div key={group.label}>
                            <p className="mb-2 text-caption font-semibold text-gray-500">{group.label}</p>
                            <div className="flex flex-wrap gap-2">
                              {group.genres.map((g) => (
                                <button
                                  key={g}
                                  onClick={() => setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 5 ? [...prev, g] : prev)}
                                  className={`rounded-full px-4 py-2 text-body-sm font-medium transition-all ${
                                    genres.includes(g)
                                      ? "bg-primary-600 text-white shadow-md ring-2 ring-primary-300"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags (API-driven) */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <div className="mb-1 flex items-center justify-between">
                        <label className="text-body-sm font-semibold text-gray-700">Thẻ tag</label>
                        <span className="text-caption text-gray-400">Đã chọn {selectedTagIds.length}/20 thẻ</span>
                      </div>

                      {/* Selected tags */}
                      {selectedTagIds.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {selectedTagIds.map((tagId) => {
                            const tag = apiTags.find((t) => t.id === tagId);
                            if (!tag) return null;
                            return (
                              <span
                                key={tagId}
                                className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-caption font-medium text-primary-700"
                              >
                                {tag.name}
                                <button onClick={() => toggleApiTag(tagId)} className="ml-0.5 hover:text-red-500">
                                  <XMarkIcon className="h-3.5 w-3.5" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Category sidebar + tags */}
                      <div className="grid grid-cols-[160px_1fr] gap-4 rounded-xl border border-gray-100">
                        <div className="space-y-0.5 border-r border-gray-100 py-2">
                          {Object.keys(tagsByType).map((type) => (
                            <button
                              key={type}
                              onClick={() => setActiveTagCat(type)}
                              className={`w-full px-4 py-2 text-left text-body-sm transition-colors ${
                                activeTagCat === type
                                  ? "bg-primary-50 font-semibold text-primary-700"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {TAG_TYPE_LABELS[type] || type}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap content-start gap-2 p-4">
                          {(tagsByType[activeTagCat] || []).map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => toggleApiTag(tag.id)}
                              className={`rounded-lg border px-3 py-1.5 text-caption font-medium transition-all ${
                                selectedTagIds.includes(tag.id)
                                  ? "border-primary-400 bg-primary-50 text-primary-700"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Legacy tags (backward compat) */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <div className="mb-1 flex items-center justify-between">
                        <label className="text-body-sm font-semibold text-gray-700">Thẻ tag cũ (tùy chọn)</label>
                        <span className="text-caption text-gray-400">Đã chọn {selectedTags.length} thẻ</span>
                      </div>

                      {/* Selected tags */}
                      {selectedTags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {selectedTags.map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-caption font-medium text-primary-700"
                            >
                              {tag}
                              <button onClick={() => toggleTag(tag)} className="ml-0.5 hover:text-red-500">
                                <XMarkIcon className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Category sidebar + tags */}
                      <div className="grid grid-cols-[160px_1fr] gap-4 rounded-xl border border-gray-100">
                        <div className="space-y-0.5 border-r border-gray-100 py-2">
                          {Object.keys(tagCategories).map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setActiveTagCat(cat)}
                              className={`w-full px-4 py-2 text-left text-body-sm transition-colors ${
                                activeTagCat === cat
                                  ? "bg-primary-50 font-semibold text-primary-700"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap content-start gap-2 p-4">
                          {tagCategories[activeTagCat]?.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`rounded-lg border px-3 py-1.5 text-caption font-medium transition-all ${
                                selectedTags.includes(tag)
                                  ? "border-primary-400 bg-primary-50 text-primary-700"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══ TAB 2: Đề cương ═══ */}
                {activeTab === "outline" && (
                  <motion.div
                    key="outline"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Theme & Expected chapters */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-5 shadow-card">
                        <label className="mb-1.5 block text-body-sm font-semibold text-gray-700">Chủ đề</label>
                        <input
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          placeholder="Tình yêu, cái chết, sự sống... bất kỳ điều gì"
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-body-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                      <div className="rounded-2xl bg-white p-5 shadow-card">
                        <label className="mb-1.5 block text-body-sm font-semibold text-gray-700">Số chương dự kiến</label>
                        <input
                          type="number"
                          value={expectedChapters}
                          onChange={(e) => setExpectedChapters(e.target.value)}
                          placeholder="Điều kiện tiên quyết để mạch truyện được triển khai tốt"
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-body-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>

                    {/* World building */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <label className="mb-1.5 block text-body-sm font-semibold text-gray-700">
                        Thiết lập thế giới
                      </label>
                      <p className="mb-3 text-caption text-gray-400">
                        Tiểu thuyết cũng giống như đời thực, nhân vật cần có một thế giới hoàn chỉnh để tung hoành.
                      </p>
                      <textarea
                        value={worldBuilding}
                        onChange={(e) => setWorldBuilding(e.target.value)}
                        rows={5}
                        placeholder="Mô tả thế giới trong truyện: lịch sử, địa lý, phép thuật, hệ thống tu luyện..."
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-body-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>

                    {/* Characters */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <label className="text-body-sm font-semibold text-gray-700">Bảng nhân vật</label>
                          <p className="text-caption text-gray-400">Liệt kê các nhân vật chính trong truyện</p>
                        </div>
                        <button
                          onClick={addCharacter}
                          className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-caption font-semibold text-primary-600 hover:bg-primary-100"
                        >
                          <PlusIcon className="h-4 w-4" /> Thêm
                        </button>
                      </div>

                      {characters.length === 0 && (
                        <p className="py-6 text-center text-body-sm text-gray-400">
                          Chưa có nhân vật nào. Nhấn &quot;Thêm&quot; để bắt đầu.
                        </p>
                      )}

                      <div className="space-y-3">
                        {characters.map((char, i) => (
                          <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                            <input
                              value={char.name}
                              onChange={(e) => updateCharacter(i, "name", e.target.value)}
                              placeholder="Tên nhân vật"
                              className="rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-primary-500 focus:outline-none"
                            />
                            <input
                              value={char.role}
                              onChange={(e) => updateCharacter(i, "role", e.target.value)}
                              placeholder="Vai trò"
                              className="rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-primary-500 focus:outline-none"
                            />
                            <input
                              value={char.description}
                              onChange={(e) => updateCharacter(i, "description", e.target.value)}
                              placeholder="Mô tả ngắn"
                              className="rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-primary-500 focus:outline-none"
                            />
                            <button onClick={() => removeCharacter(i)} className="mt-1 p-1.5 text-gray-400 hover:text-red-500">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Plot outline */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <label className="text-body-sm font-semibold text-gray-700">Nội dung cốt truyện</label>
                          <p className="text-caption text-gray-400">Phác thảo các mốc quan trọng trong truyện</p>
                        </div>
                        <button
                          onClick={addPlotPoint}
                          className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-caption font-semibold text-primary-600 hover:bg-primary-100"
                        >
                          <PlusIcon className="h-4 w-4" /> Thêm mốc
                        </button>
                      </div>

                      {plotPoints.length === 0 && (
                        <p className="py-6 text-center text-body-sm text-gray-400">
                          Chưa có mốc nào. Nhấn &quot;Thêm mốc&quot; để phác thảo cốt truyện.
                        </p>
                      )}

                      <div className="space-y-3">
                        {plotPoints.map((point, i) => (
                          <div key={i} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-caption font-bold text-primary-600">
                              {point.order}
                            </div>
                            <div className="flex-1 space-y-2">
                              <input
                                value={point.title}
                                onChange={(e) => updatePlotPoint(i, "title", e.target.value)}
                                placeholder="Tên mốc (VD: Cuộc Sống Thủ, Lời Kêu Gọi Phiêu, ...)"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm font-medium focus:border-primary-500 focus:outline-none"
                              />
                              <textarea
                                value={point.summary}
                                onChange={(e) => updatePlotPoint(i, "summary", e.target.value)}
                                rows={2}
                                placeholder="Ghi chú / tóm tắt"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-primary-500 focus:outline-none"
                              />
                            </div>
                            <button onClick={() => removePlotPoint(i)} className="mt-1 p-1.5 text-gray-400 hover:text-red-500">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══ TAB 3: Cài đặt ═══ */}
                {activeTab === "settings" && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Adult content */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-body-sm font-semibold text-gray-700">
                            Truyện có cần phải &quot;che&quot; không?
                          </label>
                          <p className="mt-1 text-caption text-gray-400">
                            Chọn &quot;Có&quot; nếu truyện có bất kỳ tình tiết 18+ liên quan đến tình dục, bạo lực,...
                          </p>

                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsAdult(true)}
                            className={`rounded-lg px-5 py-2 text-body-sm font-medium transition-all ${
                              isAdult ? "bg-red-100 text-red-700 ring-2 ring-red-300" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            Có
                          </button>
                          <button
                            onClick={() => setIsAdult(false)}
                            className={`rounded-lg px-5 py-2 text-body-sm font-medium transition-all ${
                              !isAdult ? "bg-green-100 text-green-700 ring-2 ring-green-300" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            Không
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Target audience */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <label className="mb-3 block text-body-sm font-semibold text-gray-700">
                        Muốn chinh phục nhóm độc giả nào?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {audienceOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setTargetAudience(opt.value)}
                            className={`rounded-lg border px-5 py-2.5 text-body-sm font-medium transition-all ${
                              targetAudience === opt.value
                                ? "border-primary-400 bg-primary-50 text-primary-700 ring-2 ring-primary-200"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Post schedule */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <label className="mb-1 block text-body-sm font-semibold text-gray-700">
                        Mỗi tuần nhắm đăng được mấy ngày?
                      </label>
                      <p className="mb-4 text-caption text-gray-400">Giúp độc giả biết lịch ra chương</p>
                      <div className="flex flex-wrap gap-2">
                        {dayOptions.map((d) => (
                          <button
                            key={d.value}
                            onClick={() => toggleDay(d.value)}
                            className={`rounded-lg border px-4 py-2.5 text-body-sm font-medium transition-all ${
                              postSchedule.includes(d.value)
                                ? "border-primary-400 bg-primary-50 text-primary-700 ring-2 ring-primary-200"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Story status */}
                    <div className="rounded-2xl bg-white p-6 shadow-card">
                      <label className="mb-3 block text-body-sm font-semibold text-gray-700">
                        Đăng tới đâu rồi?
                      </label>
                      <div className="flex gap-2">
                        {[
                          { value: "ongoing", label: "Đang ra" },
                          { value: "completed", label: "Hoàn thành" },
                          { value: "paused", label: "Tạm ngưng" },
                        ].map((s) => (
                          <button
                            key={s.value}
                            onClick={() => setStoryStatus(s.value)}
                            className={`rounded-lg border px-5 py-2.5 text-body-sm font-medium transition-all ${
                              storyStatus === s.value
                                ? "border-primary-400 bg-primary-50 text-primary-700 ring-2 ring-primary-200"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
    </div>
  );
}
