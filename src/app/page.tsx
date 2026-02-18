import type { Metadata } from "next";
import Link from "next/link";
import HomePage from "./HomePage";
import ZaloChatWidget from "@/components/ZaloChatWidget";
import Footer from "@/components/Footer";
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
  /* WebSite JSON-LD — helps Google identify the homepage as the main site page */
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "VStory",
    alternateName: ["VStory.vn", "vstory", "V Story"],
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
      "@id": `${SITE_URL}/#organization`,
      name: "VStory",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
      sameAs: [],
    },
  };

  /* Organization JSON-LD — reinforces brand identity */
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "VStory",
    alternateName: "VStory.vn",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icons/icon-512x512.png`,
      width: 512,
      height: 512,
    },
    description:
      "VStory – Nền tảng đọc truyện chữ online miễn phí hàng đầu Việt Nam. Truyện ngôn tình, đam mỹ, xuyên không, tu tiên, kinh dị, học đường.",
  };

  return (
    <>
      {/* Structured data for sitelinks search box + organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <HomePage />

      {/* ── SSR SEO content ── */}
      <section className="border-t border-gray-100 bg-gray-50/50 py-10">
        <div className="section-container max-w-4xl">
          <h2 className="text-heading-md font-bold text-gray-800">
            VStory – Nền tảng đọc truyện chữ online dành cho người Việt
          </h2>
          <p className="mt-3 text-body-sm leading-relaxed text-gray-600">
            VStory là nền tảng đọc và viết truyện chữ hàng đầu dành cho người
            Việt. Hàng nghìn truyện thuộc đa dạng thể loại – ngôn tình, đam mỹ,
            xuyên không, tiên hiệp, kinh dị, học đường, huyền huyễn, trọng sinh
            – được cập nhật liên tục bởi cộng đồng tác giả Việt Nam.
          </p>

          {/* Highlights */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-body-sm font-semibold text-gray-800">📖 Đọc miễn phí</p>
              <p className="mt-1 text-caption text-gray-500">
                Hàng nghìn chương truyện miễn phí, không cần đăng ký tài khoản.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-body-sm font-semibold text-gray-800">🔐 Chương VIP</p>
              <p className="mt-1 text-caption text-gray-500">
                Một số chương được tác giả khóa trả phí bằng Xu. Đăng nhập và nạp Xu để mở khóa.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-body-sm font-semibold text-gray-800">🔔 Theo dõi & thông báo</p>
              <p className="mt-1 text-caption text-gray-500">
                Đăng nhập để theo dõi truyện yêu thích, nhận thông báo chương mới.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-body-sm font-semibold text-gray-800">📱 Mọi thiết bị</p>
              <p className="mt-1 text-caption text-gray-500">
                Đọc trên điện thoại, máy tính bảng, máy tính – mọi lúc, mọi nơi.
              </p>
            </div>
          </div>

          {/* Genre links */}
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
        </div>
      </section>

      <Footer />

      <ZaloChatWidget />
    </>
  );
}
