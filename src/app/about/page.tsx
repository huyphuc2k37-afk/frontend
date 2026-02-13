import type { Metadata } from "next";
import AboutPage from "./AboutPage";

export const metadata: Metadata = {
  title: "Giới thiệu – VStory",
  description:
    "VStory là nền tảng đọc và viết truyện chữ dành cho người Việt. Được sáng lập bởi Nguyễn Huy Phúc.",
};

export default function Page() {
  return <AboutPage />;
}
