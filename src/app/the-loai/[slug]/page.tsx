import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import GenreLandingClient from "./GenreLandingClient";

const SITE_URL = "https://vstory.vn";

export const dynamicParams = true;

type Props = { params: { slug: string } };

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  icon: string;
  color: string;
}

interface ApiStory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string;
  status: string;
  views: number;
  likes: number;
  updatedAt: string;
  author: { id: string; name: string; image: string | null };
  _count: { chapters: number; bookmarks: number };
  category?: { name: string; slug: string } | null;
}

async function getCategoryBySlug(slug: string): Promise<{ category: ApiCategory; stories: ApiStory[]; total: number } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories/${slug}?pageSize=30&sort=updated`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getAllCategorySlugs(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.categories || []).map((c: any) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

/** Pre-generate all category pages at build time */
export async function generateStaticParams() {
  return await getAllCategorySlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getCategoryBySlug(params.slug);
  if (!data) return { title: "Thể loại không tồn tại – VStory" };

  const cat = data.category;
  const title = cat.seoTitle || `Truyện ${cat.name} Hay Nhất - Đọc Online Miễn Phí`;
  const description = cat.seoDescription || `Đọc truyện ${cat.name.toLowerCase()} hay nhất online miễn phí tại VStory.`;

  return {
    title,
    description,
    keywords: [
      cat.name,
      `truyện ${cat.name.toLowerCase()}`,
      `đọc truyện ${cat.name.toLowerCase()}`,
      "đọc truyện online",
      "truyện chữ",
      "truyện hay",
      "VStory",
    ],
    alternates: {
      canonical: `${SITE_URL}/the-loai/${cat.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/the-loai/${cat.slug}`,
      siteName: "VStory",
      type: "website",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function GenrePage({ params }: Props) {
  const data = await getCategoryBySlug(params.slug);
  if (!data) notFound();

  const { category, stories } = data;
  const heading = `Truyện ${category.name}`;

  /* JSON-LD CollectionPage */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: heading,
    description: category.seoDescription || category.description,
    url: `${SITE_URL}/the-loai/${category.slug}`,
    inLanguage: "vi",
    isPartOf: {
      "@type": "WebSite",
      name: "VStory",
      url: SITE_URL,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Trang chủ",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Thể loại",
          item: `${SITE_URL}/the-loai`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: heading,
          item: `${SITE_URL}/the-loai/${category.slug}`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: stories.length,
      itemListElement: stories.slice(0, 10).map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Book",
          name: s.title,
          url: `${SITE_URL}/story/${s.slug}`,
          author: { "@type": "Person", name: s.author?.name },
          genre: category.name,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GenreLandingClient category={category} initialStories={stories} />
    </>
  );
}
