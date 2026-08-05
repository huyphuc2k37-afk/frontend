"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type MaintenanceInfo = {
  active: boolean;
  message: string;
  eta: string;
  retryAfter: number;
};

const DEFAULT_INFO: MaintenanceInfo = {
  active: true,
  message: "Hệ thống đang được bảo trì. Vui lòng quay lại sau ít phút.",
  eta: "",
  retryAfter: 3600,
};

function formatEta(eta: string): string {
  if (!eta) return "";
  try {
    const d = new Date(eta);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch {
    return eta;
  }
}

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    if (!target) return null;
    const ms = new Date(target).getTime() - now;
    if (Number.isNaN(ms) || ms <= 0) return null;
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }, [target, now]);
}

export default function MaintenanceClient() {
  const [info, setInfo] = useState<MaintenanceInfo>(DEFAULT_INFO);
  const [autoReloadIn, setAutoReloadIn] = useState<number>(30);

  // Poll backend for live maintenance info (every 60s)
  useEffect(() => {
    let cancelled = false;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const endpoint = apiUrl ? `${apiUrl}/api/maintenance/status` : "/api/maintenance/status";

    const load = async () => {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as MaintenanceInfo;
        if (!cancelled) setInfo({ ...DEFAULT_INFO, ...data });
      } catch {
        /* offline or backend down — keep defaults */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // If backend reports maintenance is no longer active, bounce to homepage.
  useEffect(() => {
    if (info.active === false) {
      window.location.replace("/");
    }
  }, [info.active]);

  // Auto-retry countdown (reload page after 30s to try again)
  useEffect(() => {
    setAutoReloadIn(30);
    const id = setInterval(() => {
      setAutoReloadIn((s) => {
        if (s <= 1) {
          window.location.reload();
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const etaText = formatEta(info.eta);
  const countdown = useCountdown(info.eta);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl"
      />

      <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
        {/* Animated gear icon */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-lg ring-1 ring-primary-100">
          <svg
            className="h-14 w-14 animate-spin-slow text-primary-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </div>

        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.2em] text-primary-500">
          VStory · Hệ thống
        </p>
        <h1 className="text-heading-xl font-extrabold text-gray-900 sm:text-[40px]">
          Đang bảo trì & nâng cấp
        </h1>
        <p className="mt-4 max-w-xl text-body-md text-gray-600">
          {info.message}
        </p>

        {/* ETA card */}
        {(etaText || countdown) && (
          <div className="mt-8 w-full max-w-md rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-primary-100 backdrop-blur">
            {etaText && (
              <p className="text-caption font-medium uppercase tracking-wider text-gray-500">
                Dự kiến hoàn tất
              </p>
            )}
            {etaText && (
              <p className="mt-1 text-heading-md font-bold text-gray-900">{etaText}</p>
            )}
            {countdown && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { label: "Ngày", value: countdown.days },
                  { label: "Giờ", value: countdown.hours },
                  { label: "Phút", value: countdown.minutes },
                  { label: "Giây", value: countdown.seconds },
                ].map((u) => (
                  <div
                    key={u.label}
                    className="rounded-xl bg-primary-50 px-2 py-3 text-center ring-1 ring-primary-100"
                  >
                    <div className="text-heading-md font-extrabold text-primary-700">
                      {String(u.value).padStart(2, "0")}
                    </div>
                    <div className="text-caption text-primary-500">{u.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-primary-500 px-6 py-2.5 text-body-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
          >
            Thử lại ngay
          </button>
          <Link
            href="/"
            className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-body-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Về trang chủ
          </Link>
        </div>

        <p className="mt-4 text-caption text-gray-400">
          Tự động thử lại sau {autoReloadIn}s…
        </p>

        {/* Social links / contact */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-caption text-gray-500">
          <a
            href="https://facebook.com/vstoryvn"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-4 py-1.5 font-medium text-gray-600 shadow-sm ring-1 ring-gray-100 transition hover:text-primary-600"
          >
            Facebook
          </a>
          <a
            href="mailto:support@vstory.vn"
            className="rounded-full bg-white px-4 py-1.5 font-medium text-gray-600 shadow-sm ring-1 ring-gray-100 transition hover:text-primary-600"
          >
            support@vstory.vn
          </a>
          <a
            href="https://zalo.me/vstory"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-4 py-1.5 font-medium text-gray-600 shadow-sm ring-1 ring-gray-100 transition hover:text-primary-600"
          >
            Zalo OA
          </a>
        </div>

        <p className="mt-10 text-caption text-gray-400">
          Cảm ơn bạn đã kiên nhẫn. Chúng tôi đang nỗ lực để mang đến trải nghiệm tốt hơn.
        </p>
      </main>

      <style jsx>{`
        @keyframes spin-slow {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
