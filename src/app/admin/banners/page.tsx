"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAdmin } from "@/components/AdminLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  MegaphoneIcon,
  PhotoIcon,
  LinkIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusCircleIcon,
  XMarkIcon,
  CursorArrowRaysIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  PlusIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

interface Banner {
  id: string;
  location: string;
  adNetwork: string;
  isActive: boolean;
  customImageUrl: string | null;
  customImageMobileUrl: string | null;
  customVideoUrl: string | null;
  clickUrl: string | null;
  advertiserName: string | null;
  advertiserPhone: string | null;
  advertiserEmail: string | null;
  monthlyPrice: number | null;
  startDate: string | null;
  endDate: string | null;
  paidUntil: string | null;
  clickCount: number;
  impressionCount: number;
  isOpenNewTab: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const LOCATIONS = [
  { value: "banner_top", label: "Top Banner (đầu trang)", icon: "🖼️" },
  { value: "banner_sidebar", label: "Sidebar (thanh bên)", icon: "📐" },
  { value: "banner_footer", label: "Footer (chân trang)", icon: "⬇️" },
];

const locationLabel = (loc: string) =>
  LOCATIONS.find((l) => l.value === loc)?.label || loc;

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const formatVND = (n: number | null) =>
  n ? new Intl.NumberFormat("vi-VN").format(n) + "đ" : "—";

export default function AdminBannersPage() {
  const { token } = useAdmin();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Form state
  const [expandedLoc, setExpandedLoc] = useState<string | null>(null);
  const [form, setForm] = useState({
    customImageUrl: "",
    customImageMobileUrl: "",
    clickUrl: "",
    advertiserName: "",
    advertiserPhone: "",
    advertiserEmail: "",
    monthlyPrice: "",
    startDate: "",
    endDate: "",
    paidUntil: "",
    isOpenNewTab: true,
    isActive: true,
  });

  // File upload state (base64 preview)
  const [pcPreview, setPcPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [uploadingPc, setUploadingPc] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const fetchBanners = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ads/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const getBanner = (loc: string) => banners.find((b) => b.location === loc);

  // Reset preview when form closes
  useEffect(() => {
    if (!expandedLoc) {
      setPcPreview(null);
      setMobilePreview(null);
    }
  }, [expandedLoc]);

  const uploadBannerImage = async (file: File, variant: "pc" | "mobile") => {
    if (!token || !expandedLoc) return;
    const setter = variant === "pc" ? setUploadingPc : setUploadingMobile;
    setter(true);
    try {
      // Convert to base64
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(`${API_BASE_URL}/api/admin/ads/banners/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ location: expandedLoc, variant, imageData: dataUrl }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (variant === "pc") {
          setForm((f) => ({ ...f, customImageUrl: data.url }));
          setPcPreview(data.url);
        } else {
          setForm((f) => ({ ...f, customImageMobileUrl: data.url }));
          setMobilePreview(data.url);
        }
      } else {
        alert(data.error || "Upload thất bại");
      }
    } catch {
      alert("Upload thất bại");
    } finally {
      setter(false);
    }
  };

  const openForm = (loc: string) => {
    const existing = getBanner(loc);
    if (existing) {
      setForm({
        customImageUrl: existing.customImageUrl || "",
        customImageMobileUrl: existing.customImageMobileUrl || "",
        clickUrl: existing.clickUrl || "",
        advertiserName: existing.advertiserName || "",
        advertiserPhone: existing.advertiserPhone || "",
        advertiserEmail: existing.advertiserEmail || "",
        monthlyPrice: existing.monthlyPrice ? String(existing.monthlyPrice) : "",
        startDate: existing.startDate ? existing.startDate.split("T")[0] : "",
        endDate: existing.endDate ? existing.endDate.split("T")[0] : "",
        paidUntil: existing.paidUntil ? existing.paidUntil.split("T")[0] : "",
        isOpenNewTab: existing.isOpenNewTab,
        isActive: existing.isActive,
      });
      setPcPreview(existing.customImageUrl || null);
      setMobilePreview(existing.customImageMobileUrl || null);
    } else {
      setForm({
        customImageUrl: "",
        customImageMobileUrl: "",
        clickUrl: "",
        advertiserName: "",
        advertiserPhone: "",
        advertiserEmail: "",
        monthlyPrice: "",
        startDate: "",
        endDate: "",
        paidUntil: "",
        isOpenNewTab: true,
        isActive: true,
      });
      setPcPreview(null);
      setMobilePreview(null);
    }
    setExpandedLoc(loc);
    setResult(null);
  };

  const saveBanner = async () => {
    if (!token || !expandedLoc) return;
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ads/banners/${expandedLoc}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customImageUrl: form.customImageUrl.trim() || null,
          customImageMobileUrl: form.customImageMobileUrl.trim() || null,
          clickUrl: form.clickUrl.trim() || null,
          advertiserName: form.advertiserName.trim() || null,
          advertiserPhone: form.advertiserPhone.trim() || null,
          advertiserEmail: form.advertiserEmail.trim() || null,
          monthlyPrice: form.monthlyPrice ? parseInt(form.monthlyPrice) : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          paidUntil: form.paidUntil || null,
          isOpenNewTab: form.isOpenNewTab,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: "success", msg: "Lưu banner thành công!" });
        fetchBanners();
        setExpandedLoc(null);
      } else {
        setResult({ type: "error", msg: data.error || "Lỗi khi lưu banner" });
      }
    } catch {
      setResult({ type: "error", msg: "Lỗi kết nối server" });
    }
    setSaving(false);
  };

  const deleteBanner = async (loc: string) => {
    if (!token) return;
    if (!confirm(`Gỡ banner "${locationLabel(loc)}"? Hệ thống sẽ quay về quảng cáo mạng.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ads/banners/${loc}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchBanners();
        if (expandedLoc === loc) setExpandedLoc(null);
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-bold text-gray-900">Quản lý Banner Quảng Cáo</h2>
        <p className="mt-1 text-body-sm text-gray-500">
          Đăng banner quảng cáo hình ảnh tùy chỉnh. Mỗi vị trí có 1 banner. Hỗ trợ ảnh riêng cho PC và Mobile.
        </p>
      </div>

      {result && (
        <div className={`rounded-xl p-4 text-body-sm font-medium ${
          result.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {result.msg}
        </div>
      )}

      <div className="space-y-4">
        {LOCATIONS.map((loc) => {
          const banner = getBanner(loc.value);
          const isExpanded = expandedLoc === loc.value;
          const isCustom = banner?.status === "custom";
          const hasImage = !!(banner?.customImageUrl || banner?.customImageMobileUrl);
          const isPaid = banner?.paidUntil ? new Date(banner.paidUntil) >= new Date() : false;

          return (
            <div key={loc.value} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-4 px-5 py-4">
                <span className="text-2xl">{loc.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-gray-900">{loc.label}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {isCustom ? (
                      <>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          hasImage && isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {hasImage && isPaid ? "✅ Đang hiển thị" : hasImage ? "⏸️ Hết hạn" : "⚙️ Cấu hình rỗng"}
                        </span>
                        {banner?.advertiserName && (
                          <span className="text-caption text-gray-400">{banner.advertiserName}</span>
                        )}
                        {banner?.paidUntil && (
                          <span className="text-caption text-gray-400">
                            Paid đến: {formatDate(banner.paidUntil)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        🌐 Dùng ad network mặc định
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                {isCustom && (
                  <div className="hidden sm:flex items-center gap-4 text-caption text-gray-500">
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{banner?.clickCount?.toLocaleString() || 0}</p>
                      <p>Lượt click</p>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{banner?.impressionCount?.toLocaleString() || 0}</p>
                      <p>Hiển thị</p>
                    </div>
                  </div>
                )}

                {/* Preview thumbnails */}
                {isCustom && (
                  <div className="flex items-center gap-2">
                    {(pcPreview || banner?.customImageUrl) && (
                      <div className="relative h-12 w-16 overflow-hidden rounded-lg border border-gray-200">
                        <Image src={pcPreview || banner!.customImageUrl!} alt="PC" fill className="object-cover" unoptimized />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[9px] text-white">PC</span>
                      </div>
                    )}
                    {(mobilePreview || banner?.customImageMobileUrl) && (
                      <div className="relative h-12 w-7 overflow-hidden rounded-lg border border-gray-200">
                        <Image src={mobilePreview || banner!.customImageMobileUrl!} alt="Mobile" fill className="object-cover" unoptimized />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[8px] text-white">M</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openForm(loc.value)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-caption font-semibold text-white hover:bg-blue-600 transition-colors"
                  >
                    {isCustom ? <PencilSquareIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                    {isCustom ? "Sửa" : "Thêm"}
                  </button>
                  {isCustom && (
                    <button
                      onClick={() => deleteBanner(loc.value)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-caption font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Gỡ
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setExpandedLoc(isExpanded ? null : loc.value)}
                  className={`p-1.5 rounded-lg transition-colors ${isExpanded ? "bg-gray-100 rotate-180" : "hover:bg-gray-50"}`}
                >
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Expanded form */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                  {/* Image previews */}
                  {(form.customImageUrl || form.customImageMobileUrl) && (
                    <div className="flex gap-3 mb-4">
                      {form.customImageUrl && (
                        <div className="relative group">
                          <div className="relative h-20 w-40 overflow-hidden rounded-lg border-2 border-blue-200">
                            <Image src={form.customImageUrl} alt="PC Preview" fill className="object-cover" unoptimized />
                          </div>
                          <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-center text-[9px] text-white rounded">PC</span>
                        </div>
                      )}
                      {form.customImageMobileUrl && (
                        <div className="relative group">
                          <div className="relative h-20 w-11 overflow-hidden rounded-lg border-2 border-purple-200">
                            <Image src={form.customImageMobileUrl} alt="Mobile Preview" fill className="object-cover" unoptimized />
                          </div>
                          <span className="absolute bottom-0.5 left-0.5 right-0.5 bg-black/60 text-center text-[8px] text-white rounded">M</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* PC Image Upload */}
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-caption font-semibold text-gray-600">
                        <ComputerDesktopIcon className="h-4 w-4" />
                        Ảnh Banner PC <span className="text-red-400 text-[10px]">Khuyến nghị 728×90</span>
                      </label>
                      <div className="relative flex items-center justify-center w-full">
                        {pcPreview ? (
                          <div className="relative group w-full">
                            <div className="relative h-20 w-full overflow-hidden rounded-lg border-2 border-blue-200 bg-gray-100">
                              <Image src={pcPreview} alt="PC Preview" fill className="object-contain" unoptimized />
                              <button
                                onClick={() => { setPcPreview(null); setForm((f) => ({ ...f, customImageUrl: "" })); }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </div>
                            <label className="mt-1 flex items-center justify-center gap-1 rounded border border-gray-200 bg-white py-1 text-caption text-gray-500 hover:bg-gray-50 cursor-pointer">
                              <PencilSquareIcon className="h-3 w-3" />
                              {uploadingPc ? "Đang tải..." : "Đổi ảnh"}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingPc}
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBannerImage(f, "pc"); }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                            {uploadingPc ? (
                              <div className="flex items-center gap-2 text-blue-500 text-caption">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                Đang tải...
                              </div>
                            ) : (
                              <>
                                <PhotoIcon className="h-6 w-6 text-gray-400 mb-1" />
                                <span className="text-caption text-gray-400">Tải ảnh lên (PC)</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingPc}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBannerImage(f, "pc"); }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Mobile Image Upload */}
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-caption font-semibold text-gray-600">
                        <DevicePhoneMobileIcon className="h-4 w-4" />
                        Ảnh Banner Mobile <span className="text-red-400 text-[10px]">Khuyến nghị 320×100</span>
                      </label>
                      <div className="relative flex items-center justify-center w-full">
                        {mobilePreview ? (
                          <div className="relative group w-full">
                            <div className="relative h-20 w-full overflow-hidden rounded-lg border-2 border-purple-200 bg-gray-100 flex items-center justify-center">
                              <Image src={mobilePreview} alt="Mobile Preview" fill className="object-contain" unoptimized />
                              <button
                                onClick={() => { setMobilePreview(null); setForm((f) => ({ ...f, customImageMobileUrl: "" })); }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </div>
                            <label className="mt-1 flex items-center justify-center gap-1 rounded border border-gray-200 bg-white py-1 text-caption text-gray-500 hover:bg-gray-50 cursor-pointer">
                              <PencilSquareIcon className="h-3 w-3" />
                              {uploadingMobile ? "Đang tải..." : "Đổi ảnh"}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingMobile}
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBannerImage(f, "mobile"); }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                            {uploadingMobile ? (
                              <div className="flex items-center gap-2 text-purple-500 text-caption">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                                Đang tải...
                              </div>
                            ) : (
                              <>
                                <PhotoIcon className="h-6 w-6 text-gray-400 mb-1" />
                                <span className="text-caption text-gray-400">Tải ảnh lên (Mobile)</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingMobile}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBannerImage(f, "mobile"); }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Click URL */}
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-caption font-semibold text-gray-600">
                        <LinkIcon className="h-4 w-4" />
                        Link đích <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="url"
                        value={form.clickUrl}
                        onChange={(e) => setForm({ ...form, clickUrl: e.target.value })}
                        placeholder="https://shop.example.com/..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100"
                      />
                    </div>

                    {/* Advertiser */}
                    <div>
                      <label className="mb-1 block text-caption font-semibold text-gray-600">Tên nhà quảng cáo</label>
                      <input
                        type="text"
                        value={form.advertiserName}
                        onChange={(e) => setForm({ ...form, advertiserName: e.target.value })}
                        placeholder="VD: Shop ABC"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-1 block text-caption font-semibold text-gray-600">SĐT liên hệ</label>
                      <input
                        type="tel"
                        value={form.advertiserPhone}
                        onChange={(e) => setForm({ ...form, advertiserPhone: e.target.value })}
                        placeholder="VD: 0901234567"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1 block text-caption font-semibold text-gray-600">Email liên hệ</label>
                      <input
                        type="email"
                        value={form.advertiserEmail}
                        onChange={(e) => setForm({ ...form, advertiserEmail: e.target.value })}
                        placeholder="VD: advertiser@example.com"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="mb-1 block text-caption font-semibold text-gray-600">Giá tháng (VNĐ)</label>
                      <input
                        type="number"
                        value={form.monthlyPrice}
                        onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
                        placeholder="VD: 500000"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    {/* Paid until */}
                    <div>
                      <label className="mb-1 block text-caption font-semibold text-gray-600">Đã thanh toán đến ngày</label>
                      <input
                        type="date"
                        value={form.paidUntil}
                        onChange={(e) => setForm({ ...form, paidUntil: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    {/* Start / End date */}
                    <div>
                      <label className="mb-1 block text-caption font-semibold text-gray-600">Ngày bắt đầu</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-caption font-semibold text-gray-600">Ngày kết thúc</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="mt-4 flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isOpenNewTab}
                        onChange={(e) => setForm({ ...form, isOpenNewTab: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-body-sm text-gray-700">Mở link tab mới</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-body-sm text-gray-700">Đang bật</span>
                    </label>
                  </div>

                  {/* Form actions */}
                  <div className="mt-5 flex items-center gap-3 border-t border-gray-200 pt-4">
                    <button
                      onClick={saveBanner}
                      disabled={saving || (!form.customImageUrl && !form.customImageMobileUrl)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-body-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <PhotoIcon className="h-4 w-4" />
                      )}
                      {saving ? "Đang lưu..." : "Lưu Banner"}
                    </button>
                    <button
                      onClick={() => setExpandedLoc(null)}
                      className="rounded-lg border border-gray-200 px-4 py-2.5 text-body-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Đóng
                    </button>
                    <p className="text-caption text-gray-400 ml-auto">
                      Cần ít nhất 1 ảnh PC hoặc Mobile
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-body-sm text-amber-700 font-medium">Lưu ý</p>
        <ul className="mt-1 space-y-0.5 text-caption text-amber-600">
          <li>• Kích thước khuyến nghị: PC 728×90px, Mobile 320×100px</li>
          <li>• Banner sẽ tự động ẩn khi đến ngày hết hạn thanh toán (paidUntil)</li>
          <li>• Dùng dịch vụ Cloudinary hoặc lưu trữ ảnh đáng tin cậy để đảm bảo tốc độ tải</li>
          <li>• Kích thước ảnh càng nhẹ càng tốt (nên dùng WebP hoặc nén JPEG)</li>
        </ul>
      </div>
    </div>
  );
}

// Re-export PencilSquareIcon (already in heroicons imports above)
