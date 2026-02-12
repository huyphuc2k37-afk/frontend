import type { Metadata } from "next";
import { Suspense } from "react";
import LoginPage from "./LoginPage";

export const metadata: Metadata = {
  title: "Đăng nhập – VStory",
  description: "Đăng nhập vào VStory để đọc truyện, theo dõi tác giả yêu thích và quản lý tủ truyện.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>}>
      <LoginPage />
    </Suspense>
  );
}
