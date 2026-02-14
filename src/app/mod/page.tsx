"use client";

import { useState, useEffect } from "react";
import { useMod } from "@/components/ModLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface ModStats {
  pending: number;
  approved: number;
  rejected: number;
  todayReviewed: number;
  chapterPending: number;
}

export default function ModDashboard() {
  const { token } = useMod();
  const [stats, setStats] = useState<ModStats | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/mod/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats({ pending: 0, approved: 0, rejected: 0, todayReviewed: 0, chapterPending: 0, _error: true } as any));
  }, [token]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const cards = [
    {
      label: "Chờ duyệt",
      value: stats.pending,
      icon: ClockIcon,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      iconColor: "text-amber-500",
      href: "/mod/stories?status=pending",
    },
    {
      label: "Đã duyệt",
      value: stats.approved,
      icon: CheckCircleIcon,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-500",
      href: "/mod/stories?status=approved",
    },
    {
      label: "Từ chối",
      value: stats.rejected,
      icon: XCircleIcon,
      color: "text-red-600 bg-red-50 border-red-200",
      iconColor: "text-red-500",
      href: "/mod/stories?status=rejected",
    },
    {
      label: "Đã duyệt hôm nay",
      value: stats.todayReviewed,
      icon: DocumentCheckIcon,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      iconColor: "text-indigo-500",
      href: null,
    },
    {
      label: "Chương chờ duyệt",
      value: stats.chapterPending,
      icon: DocumentTextIcon,
      color: "text-violet-600 bg-violet-50 border-violet-200",
      iconColor: "text-violet-500",
      href: "/mod/chapters?status=pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-bold text-gray-900">Tổng quan kiểm duyệt</h2>
        <p className="mt-1 text-body-sm text-gray-500">
          Quản lý và kiểm duyệt truyện trên hệ thống VStory
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const content = (
            <div
              key={card.label}
              className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-xs font-medium opacity-80">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold">{card.value}</p>
                </div>
                <card.icon className={`h-10 w-10 ${card.iconColor} opacity-50`} />
              </div>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* Pending alert */}
      {stats.pending > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-6 w-6 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">
                  Có {stats.pending} truyện đang chờ kiểm duyệt
                </p>
                <p className="text-body-sm text-amber-600">
                  Vui lòng kiểm tra và duyệt các truyện mới đăng.
                </p>
              </div>
            </div>
            <Link
              href="/mod/stories?status=pending"
              className="rounded-xl bg-amber-600 px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-amber-700"
            >
              Duyệt ngay
            </Link>
          </div>
        </div>
      )}

      {/* Chapter pending alert */}
      {stats.chapterPending > 0 && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="h-6 w-6 text-violet-600" />
              <div>
                <p className="font-semibold text-violet-800">
                  Có {stats.chapterPending} chương đang chờ kiểm duyệt
                </p>
                <p className="text-body-sm text-violet-600">
                  Vui lòng kiểm tra và duyệt các chương mới đăng.
                </p>
              </div>
            </div>
            <Link
              href="/mod/chapters?status=pending"
              className="rounded-xl bg-violet-600 px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              Duyệt ngay
            </Link>
          </div>
        </div>
      )}

      {/* Quick guide */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-body-lg font-semibold text-gray-900">Hướng dẫn kiểm duyệt</h3>
        <ul className="mt-3 space-y-2 text-body-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
            Khi tác giả đăng truyện mới, truyện sẽ ở trạng thái <strong>&quot;Chờ duyệt&quot;</strong> và chưa hiển thị công khai.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
            Kiểm tra nội dung truyện (tiêu đề, mô tả, thể loại, tag) để đảm bảo phù hợp với quy định.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
            <strong>Duyệt</strong> nếu truyện đạt yêu cầu — truyện sẽ hiển thị công khai.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
            <strong>Từ chối</strong> nếu truyện vi phạm — bắt buộc nhập lý do để tác giả biết cần sửa gì.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
            Tác giả sẽ nhận được thông báo về kết quả kiểm duyệt qua hệ thống thông báo.
          </li>
        </ul>
      </div>
    </div>
  );
}
