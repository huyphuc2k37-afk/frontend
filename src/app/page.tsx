import type { Metadata } from "next";
import HomePage from "./HomePage";
import ZaloChatWidget from "@/components/ZaloChatWidget";

const SITE_URL = "https://vstory.vn";

export const metadata: Metadata = {
  title: "VStory – Đọc truyện online miễn phí",
  description:
    "Khám phá hàng nghìn truyện hay của tác giả Việt trên VStory. Đọc miễn phí, theo dõi truyện yêu thích và cập nhật chương mới mỗi ngày.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "VStory – Đọc truyện online miễn phí",
    description:
      "Khám phá hàng nghìn truyện hay của tác giả Việt trên VStory. Đọc miễn phí, theo dõi truyện yêu thích và cập nhật chương mới mỗi ngày.",
    url: SITE_URL,
    siteName: "VStory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VStory – Đọc truyện online miễn phí",
    description:
      "Khám phá hàng nghìn truyện hay của tác giả Việt trên VStory. Đọc miễn phí, theo dõi truyện yêu thích và cập nhật chương mới mỗi ngày.",
  },
};

export default function Page() {
  return (
    <>
      <HomePage />
      <ZaloChatWidget />
    </>
  );
}
