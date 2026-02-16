import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api";

const SITE_URL = "https://vstory.vn";

export const metadata: Metadata = {
  title: "Thể Loại Truyện - Đọc Truyện Online Miễn Phí Tại VStory",
  description:
    "Khám phá tất cả thể loại truyện trên VStory: ngôn tình, đam mỹ, xuyên không, tu tiên, kinh dị, học đường, huyền huyễn và nhiều hơn nữa. Đọc miễn phí.",
  keywords: [
    "thể loại truyện",
    "đọc truyện online",
    "truyện chữ",
    "truyện hay",
    "truyện ngôn tình",
    "truyện đam mỹ",
    "truyện xuyên không",
    "VStory",
  ],
  alternates: { canonical: `${SITE_URL}/the-loai` },
  openGraph: {
    title: "Thể Loại Truyện – VStory",
    description:
      "Khám phá tất cả thể loại truyện trên VStory. Đọc miễn phí hàng nghìn tác phẩm hay.",
    url: `${SITE_URL}/the-loai`,
    siteName: "VStory",
    type: "website",
    locale: "vi_VN",
  },
};

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  icon: string;
  color: string;
  displayOrder: number;
  _count: { stories: number };
}

async function getCategories(): Promise<ApiCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.categories || [];
  } catch {
    return [];
  }
}

export default async function GenreIndexPage() {
  const categories = await getCategories();

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="pb-4 pt-8 sm:pt-12">
          <div className="section-container">
            <h1 className="text-display-sm text-gray-900 sm:text-display-md">
              Thể Loại Truyện
            </h1>
            <p className="mt-3 max-w-2xl text-body-lg text-gray-600">
              Khám phá tất cả thể loại truyện trên VStory. Chọn thể loại bạn
              yêu thích để bắt đầu đọc miễn phí.
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="section-container">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/the-loai/${cat.slug}`}
                  className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <h2 className="text-heading-sm font-bold text-gray-900 transition-colors group-hover:text-primary-600">
                      {cat.name}
                    </h2>
                  </div>
                  <p className="mt-2 line-clamp-2 text-body-sm text-gray-500">
                    {cat.description || cat.seoDescription}
                  </p>
                  <p className="mt-2 text-caption text-gray-400">
                    {cat._count.stories} truyện
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SEO text block */}
        <section className="border-t border-gray-100 bg-gray-50/50 py-8">
          <div className="section-container max-w-3xl">
            <h2 className="mb-3 text-heading-sm font-bold text-gray-800">
              Đọc truyện online miễn phí trên VStory
            </h2>
            <p className="text-body-sm leading-relaxed text-gray-600">
              VStory là nền tảng đọc và viết truyện chữ dành cho người Việt. Với
              hàng nghìn tác phẩm thuộc đa dạng thể loại như ngôn tình, đam mỹ,
              xuyên không, tu tiên, kinh dị, học đường, huyền huyễn, trọng
              sinh... bạn luôn tìm được câu chuyện phù hợp. Tất cả truyện đều
              được cập nhật liên tục bởi các tác giả Việt Nam và hoàn toàn miễn
              phí.
            </p>
            <p className="mt-2 text-body-sm leading-relaxed text-gray-600">
              Ngoài việc đọc truyện, bạn còn có thể theo dõi truyện yêu thích,
              nhận thông báo chương mới, đánh giá và bình luận để xây dựng cộng
              đồng yêu truyện chữ lớn nhất Việt Nam.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
