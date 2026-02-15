import type { Metadata } from "next";
import Link from "next/link";
import HomePage from "./HomePage";
import ZaloChatWidget from "@/components/ZaloChatWidget";
import { genreSEOPages } from "@/data/genreSlugs";

const SITE_URL = "https://vstory.vn";

export const metadata: Metadata = {
  title: "VStory – Đọc Truyện Chữ Online Miễn Phí | Truyện Hay Mỗi Ngày",
  description:
    "VStory – Nền tảng đọc truyện chữ online miễn phí hàng đầu Việt Nam. Truyện ngôn tình, đam mỹ, xuyên không, tu tiên, kinh dị, học đường. Cập nhật chương mới mỗi ngày.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "VStory – Đọc Truyện Chữ Online Miễn Phí",
    description:
      "Nền tảng đọc truyện chữ online miễn phí hàng đầu Việt Nam. Hàng nghìn truyện hay cập nhật mỗi ngày.",
    url: SITE_URL,
    siteName: "VStory",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "VStory – Đọc Truyện Chữ Online Miễn Phí",
    description:
      "Nền tảng đọc truyện chữ online miễn phí hàng đầu Việt Nam. Hàng nghìn truyện hay cập nhật mỗi ngày.",
  },
};

export default function Page() {
  /* WebSite + Organization JSON-LD */
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VStory",
    alternateName: "VStory.vn",
    url: SITE_URL,
    description:
      "Nền tảng đọc và viết truyện chữ online miễn phí dành cho người Việt",
    inLanguage: "vi",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "VStory",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.ico`,
      },
    },
  };

  return (
    <>
      {/* Structured data for sitelinks search box */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <HomePage />

      {/* ── SSR SEO content — visible to Google, below the fold ── */}
      <section className="border-t border-gray-100 bg-gray-50/50 py-10">
        <div className="section-container max-w-4xl">
          <h2 className="text-heading-md font-bold text-gray-800">
            Đọc truyện chữ online miễn phí tại VStory
          </h2>
          <p className="mt-3 text-body-sm leading-relaxed text-gray-600">
            VStory là nền tảng đọc và viết truyện chữ hàng đầu dành cho người
            Việt. Tại đây, bạn có thể đọc hàng nghìn truyện hay thuộc đa dạng
            thể loại hoàn toàn miễn phí. Từ truyện ngôn tình, đam mỹ, xuyên
            không, tiên hiệp, kinh dị đến truyện học đường, huyền huyễn, trọng
            sinh – tất cả đều được cập nhật liên tục bởi cộng đồng tác giả Việt
            Nam.
          </p>
          <p className="mt-2 text-body-sm leading-relaxed text-gray-600">
            Ngoài việc đọc truyện online miễn phí, bạn còn có thể theo dõi
            truyện yêu thích, nhận thông báo khi có chương mới, đánh giá và
            bình luận truyện. VStory hỗ trợ đọc truyện trên điện thoại, máy
            tính bảng và máy tính – mọi lúc, mọi nơi.
          </p>

          <h3 className="mt-6 text-heading-sm font-bold text-gray-800">
            Thể loại truyện phổ biến
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {genreSEOPages.map((g) => (
              <Link
                key={g.slug}
                href={`/the-loai/${g.slug}`}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-body-sm text-gray-700 transition-colors hover:border-primary-300 hover:text-primary-700"
              >
                {g.name}
              </Link>
            ))}
          </div>

          <h3 className="mt-6 text-heading-sm font-bold text-gray-800">
            Tại sao chọn VStory?
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-body-sm text-gray-600">
            <li>
              <strong>Miễn phí hoàn toàn</strong> – Đọc truyện không giới hạn,
              không cần đăng ký
            </li>
            <li>
              <strong>Cập nhật nhanh</strong> – Chương mới được đăng mỗi ngày
              bởi tác giả Việt
            </li>
            <li>
              <strong>Đa thể loại</strong> – Ngôn tình, đam mỹ, xuyên không,
              kinh dị, học đường...
            </li>
            <li>
              <strong>Giao diện thân thiện</strong> – Tối ưu trải nghiệm đọc
              trên mọi thiết bị
            </li>
            <li>
              <strong>Cộng đồng sôi nổi</strong> – Bình luận, đánh giá, theo
              dõi tác giả yêu thích
            </li>
          </ul>
        </div>
      </section>

      <ZaloChatWidget />
    </>
  );
}
