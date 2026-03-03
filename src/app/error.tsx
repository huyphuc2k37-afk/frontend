"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-red-50 p-8">
        <p className="text-[64px] leading-none select-none">⚠️</p>
        <h2 className="mt-4 text-heading-md font-bold text-red-700">
          Đã xảy ra lỗi
        </h2>
        <p className="mt-2 text-body-sm text-red-600">
          {error.message || "Không thể tải trang. Vui lòng thử lại."}
        </p>
        {error.digest && (
          <p className="mt-1 text-caption text-red-400">Mã lỗi: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-red-600 px-6 py-2.5 text-body-sm font-semibold text-white transition hover:bg-red-700"
          >
            Thử lại
          </button>
          <a
            href="/"
            className="rounded-xl border border-red-200 bg-white px-6 py-2.5 text-body-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
