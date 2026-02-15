import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { genreSEOPages, getGenreSEOBySlug } from "@/data/genreSlugs";
import GenreLandingClient from "./GenreLandingClient";

const SITE_URL = "https://vstory.vn";

type Props = { params: { slug: string } };

/** Pre-generate all genre pages at build time */
export function generateStaticParams() {
  return genreSEOPages.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const genre = getGenreSEOBySlug(params.slug);
  if (!genre) return { title: "Thể loại không tồn tại – VStory" };

  return {
    title: genre.title,
    description: genre.description,
    keywords: [
      genre.name,
      `truyện ${genre.name.toLowerCase()}`,
      `đọc truyện ${genre.name.toLowerCase()}`,
      "đọc truyện online",
      "truyện chữ",
      "truyện hay",
      "VStory",
    ],
    alternates: {
      canonical: `${SITE_URL}/the-loai/${genre.slug}`,
    },
    openGraph: {
      title: genre.title,
      description: genre.description,
      url: `${SITE_URL}/the-loai/${genre.slug}`,
      siteName: "VStory",
      type: "website",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title: genre.title,
      description: genre.description,
    },
  };
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
}

async function getStoriesByGenre(genreName: string): Promise<ApiStory[]> {
  try {
    const params = new URLSearchParams({
      genre: genreName,
      limit: "30",
      sort: "updatedAt",
    });
    const res = await fetch(`${API_BASE_URL}/api/stories?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.stories || [];
  } catch {
    return [];
  }
}

export default async function GenrePage({ params }: Props) {
  const genre = getGenreSEOBySlug(params.slug);
  if (!genre) notFound();

  const stories = await getStoriesByGenre(genre.name);

  /* JSON-LD CollectionPage */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: genre.heading,
    description: genre.description,
    url: `${SITE_URL}/the-loai/${genre.slug}`,
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
          name: genre.heading,
          item: `${SITE_URL}/the-loai/${genre.slug}`,
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
          genre: s.genre,
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
      <GenreLandingClient genre={genre} initialStories={stories} />
    </>
  );
}
