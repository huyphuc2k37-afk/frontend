import { Metadata } from "next";
import RankingsPage from "./RankingsPage";

export const metadata: Metadata = {
  title: "Bảng Xếp Hạng Mở Rộng - Top Truyện, Tác Giả, Độc Giả | VStory",
  description:
    "Khám phá bảng xếp hạng mở rộng của VStory: top truyện hay nhất, tác giả xuất sắc và độc giả tích cực. Xếp hạng theo tuần, tháng và mọi thời gian.",
  keywords: [
    "bảng xếp hạng truyện",
    "bảng xếp hạng tác giả",
    "bảng xếp hạng độc giả",
    "truyện hot",
    "top truyện hay",
    "tác giả xuất sắc",
    "VStory",
  ],
  alternates: {
    canonical: "https://vstory.vn/rankings",
  },
  openGraph: {
    title: "Bảng Xếp Hạng Mở Rộng – VStory",
    description:
      "Top truyện hay nhất, tác giả xuất sắc và độc giả tích cực trên VStory.",
    url: "https://vstory.vn/rankings",
    siteName: "VStory",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bảng Xếp Hạng Mở Rộng – VStory",
    description:
      "Top truyện hay nhất, tác giả xuất sắc và độc giả tích cực trên VStory.",
  },
};

export default function Page() {
  return <RankingsPage />;
}
