import type { Metadata } from "next";
import { API_BASE_URL } from "@/lib/api";
import StoryDetailClient from "./StoryDetailClient";

const SITE_URL = "https://vstory.vn";

type Props = { params: { slug: string } };

async function getStory(slug: string) {
  try {
    const res = await fetch(API_BASE_URL + "/api/stories/" + slug, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await getStory(params.slug);

  if (!story) {
    return { title: "Truyện không tồn tại – VStory" };
  }

  const description =
    story.description?.slice(0, 160).replace(/\n/g, " ") ||
    "Đọc truyện " + story.title + " trên VStory";

  const visibleTags = story.tags
    ? story.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)
    : [];

  return {
    title: story.title + " – VStory",
    description,
    keywords: [
      story.title,
      ...(story.genre ? story.genre.split(",").map((g: string) => g.trim()).filter(Boolean) : []),
      "đọc truyện",
      "truyện chữ",
      ...visibleTags,
    ],
    alternates: {
      canonical: SITE_URL + "/story/" + story.slug,
    },
    openGraph: {
      title: story.title,
      description,
      url: SITE_URL + "/story/" + story.slug,
      siteName: "VStory",
      locale: "vi_VN",
      type: "book" as any,
      images: story.id
        ? [
            {
              url: API_BASE_URL + "/api/stories/" + story.id + "/cover",
              width: 400,
              height: 600,
              alt: story.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const story = await getStory(params.slug);

  const jsonLd = story
    ? [
        {
          "@context": "https://schema.org",
          "@type": "Book",
          name: story.title,
          description: story.description?.slice(0, 300),
          url: SITE_URL + "/story/" + story.slug,
          image: API_BASE_URL + "/api/stories/" + story.id + "/cover",
          author: {
            "@type": "Person",
            name: story.author?.name,
          },
          genre: story.genre ? story.genre.split(",").map((g: string) => g.trim()).filter(Boolean) : undefined,
          inLanguage: "vi",
          ...(story.ratingCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: story.averageRating,
                  ratingCount: story.ratingCount,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
          numberOfPages: story.chapters?.length || 0,
        },
        {
          "@context": "https://schema.org",
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
              name: story.category?.name || story.genre?.split(",")[0]?.trim() || "Thể loại",
              item: story.category?.slug
                ? SITE_URL + "/the-loai/" + story.category.slug
                : SITE_URL + "/the-loai",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: story.title,
              item: SITE_URL + "/story/" + story.slug,
            },
          ],
        },
      ]
    : null;

  return (
    <>
      {jsonLd && jsonLd.map((ld: any, i: number) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <StoryDetailClient />
    </>
  );
}
