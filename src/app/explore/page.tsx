import type { Metadata } from "next";
import ExplorePage from "./ExplorePage";

export const metadata: Metadata = {
  title: "Khám Phá Truyện Hay - Đọc Truyện Online Miễn Phí | VStory",
  description:
    "Khám phá kho truyện chữ đa thể loại: ngôn tình, đam mỹ, xuyên không, tu tiên, kinh dị, học đường. Đọc truyện online miễn phí, cập nhật mới mỗi ngày tại VStory.",
  keywords: [
    "đọc truyện online",
    "truyện chữ",
    "truyện hay",
    "khám phá truyện",
    "đọc truyện miễn phí",
    "VStory",
  ],
  alternates: {
    canonical: "https://vstory.vn/explore",
  },
  openGraph: {
    title: "Khám Phá Truyện Hay - Đọc Online Miễn Phí",
    description:
      "Kho truyện chữ đa thể loại, đọc online miễn phí. Cập nhật mỗi ngày tại VStory.",
    url: "https://vstory.vn/explore",
    siteName: "VStory",
    type: "website",
  },
};

export default function Page() {
  return <ExplorePage />;
}
