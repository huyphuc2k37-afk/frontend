import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 – Không tìm thấy trang | VStory",
  description: "Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-[120px] font-extrabold leading-none text-primary-200 select-none">
        404
      </p>
      <h1 className="mt-2 text-heading-lg font-bold text-gray-900">
        Không tìm thấy trang
      </h1>
      <p className="mt-3 max-w-md text-body-md text-gray-500">
        Trang bạn tìm kiếm không tồn tại, đã bị xóa hoặc đường dẫn bị sai.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-primary-500 px-6 py-2.5 text-body-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
        >
          Về trang chủ
        </Link>
        <Link
          href="/explore"
          className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-body-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          Khám phá truyện
        </Link>
      </div>
    </div>
  );
}
