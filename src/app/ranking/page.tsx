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
  twitter: {
    card: "summary_large_image",
    title: "Bảng Xếp Hạng Truyện Hay Nhất – VStory",
    description:
      "Top truyện hay nhất, được đọc nhiều nhất trên VStory.",
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Bảng Xếp Hạng Truyện Hay Nhất - VStory",
    description:
      "Xếp hạng truyện hay nhất trên VStory theo lượt đọc, yêu thích và đánh giá.",
    url: "https://vstory.vn/ranking",
    isPartOf: {
      "@type": "WebSite",
      name: "VStory",
      url: "https://vstory.vn",
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Top Truyện Hot",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: 50,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RankingPage />
    </>
  );
}
