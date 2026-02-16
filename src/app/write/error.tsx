"use client";

import { useEffect } from "react";

export default function WriteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Write page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="mb-2 text-heading-md font-bold text-red-700">
          Đã xảy ra lỗi
        </h2>
        <p className="mb-1 text-body-sm text-red-600">
          {error.message || "Không thể tải trang"}
        </p>
        {error.digest && (
          <p className="mb-4 text-caption text-red-400">
            Mã lỗi: {error.digest}
          </p>
        )}
        <pre className="mb-4 max-h-40 overflow-auto rounded-lg bg-red-100 p-3 text-left text-[11px] text-red-800">
          {error.stack || String(error)}
        </pre>
        <button
          onClick={reset}
          className="rounded-xl bg-red-600 px-6 py-2.5 text-body-sm font-semibold text-white hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
