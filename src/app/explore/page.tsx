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
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khám Phá Truyện Hay - Đọc Online Miễn Phí | VStory",
    description:
      "Kho truyện chữ đa thể loại, đọc online miễn phí. Cập nhật mỗi ngày tại VStory.",
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Khám Phá Truyện Hay - Đọc Truyện Online Miễn Phí",
    description:
      "Khám phá kho truyện chữ đa thể loại: ngôn tình, đam mỹ, xuyên không, kinh dị, học đường. Đọc miễn phí tại VStory.",
    url: "https://vstory.vn/explore",
    isPartOf: {
      "@type": "WebSite",
      name: "VStory",
      url: "https://vstory.vn",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://vstory.vn/explore?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExplorePage />
    </>
  );
}
