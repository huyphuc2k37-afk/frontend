import { Metadata } from "next";
import RankingPage from "./RankingPage";

export const metadata: Metadata = {
  title: "Bảng Xếp Hạng Truyện Hay Nhất - Top Truyện Hot | VStory",
  description:
    "Xếp hạng truyện hay nhất trên VStory theo lượt đọc, yêu thích và đánh giá. Khám phá top truyện hot, truyện được yêu thích nhất.",
  keywords: [
    "bảng xếp hạng truyện",
    "truyện hot",
    "top truyện hay",
    "truyện được đọc nhiều nhất",
    "VStory",
  ],
  alternates: {
    canonical: "https://vstory.vn/ranking",
  },
  openGraph: {
    title: "Bảng Xếp Hạng Truyện Hay Nhất – VStory",
    description:
      "Top truyện hay nhất, được đọc nhiều nhất trên VStory.",
    url: "https://vstory.vn/ranking",
    siteName: "VStory",
    locale: "vi_VN",
    type: "website",
  },
};

export default function Page() {
  return <RankingPage />;
}
