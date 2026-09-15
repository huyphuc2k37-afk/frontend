import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChapterReader from "./ChapterReader";

// Server components and metadata cannot use the browser-only relative API base.
// Keep client requests on /api (the Next.js rewrite), but use the backend URL
// directly while rendering chapter HTML on Vercel.
const SERVER_API_BASE_URL = (
  process.env.NEXT_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-production-05227.up.railway.app"
).replace(/\/+$/, "");

// Chapters are rendered on demand. Pre-rendering the full sitemap here made
// every deployment generate thousands of chapter pages and could exceed the
// deployment time limit.
export const dynamic = "force-dynamic";
export const dynamicParams = true;

const SITE_URL = "https://vstory.vn";

type Props = { params: { slug: string; chapterId: string } };

async function getChapter(chapterId: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // Do not cache a transient backend failure as a missing chapter.
      const res = await fetch(SERVER_API_BASE_URL + "/api/chapters/" + chapterId, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      if (attempt === 1) return null;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapter = await getChapter(params.chapterId);

  if (!chapter) {
    return { title: "Chương không tồn tại – VStory" };
  }

  const storyTitle = chapter.story?.title || "Truyện";
  const cleanTitle = chapter.title.replace(/^Chương\s*\d+\s*[:：]\s*/i, "");
  const chapterTitle = "Chương " + chapter.number + ": " + cleanTitle;
  const title = chapterTitle + " – " + storyTitle + " – VStory";
  const description =
    "Đọc " + chapterTitle + " của truyện " + storyTitle + " trên VStory. " +
    (chapter.wordCount || 0).toLocaleString() + " chữ.";

  return {
    title,
    description,
    alternates: {
      canonical: SITE_URL + "/truyen/" + params.slug + "/chapter/" + params.chapterId,
    },
    openGraph: {
      title: chapterTitle + " – " + storyTitle,
      description,
      url: SITE_URL + "/truyen/" + params.slug + "/chapter/" + params.chapterId,
      siteName: "VStory",
      type: "article",
      ...(chapter.story?.id
        ? {
            images: [
              {
                url: SERVER_API_BASE_URL + "/api/stories/" + chapter.story.id + "/cover",
                width: 400,
                height: 600,
                alt: storyTitle,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary",
      title: chapterTitle + " – " + storyTitle,
      description,
    },
  };
}

export default async function ChapterPage({ params }: Props) {
  const chapter = await getChapter(params.chapterId);
  if (!chapter) notFound();

  const jsonLd = chapter
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline:
          "Chương " +
          chapter.number +
          ": " +
          chapter.title.replace(/^Chương\s*\d+\s*[:：]\s*/i, ""),
        description:
          "Đọc Chương " +
          chapter.number +
          " của truyện " +
          (chapter.story?.title || "") +
          " trên VStory",
        url:
          SITE_URL +
          "/truyen/" +
          params.slug +
          "/chapter/" +
          params.chapterId,
        inLanguage: "vi",
        isPartOf: {
          "@type": "Book",
          name: chapter.story?.title,
          url: SITE_URL + "/truyen/" + params.slug,
        },
        wordCount: chapter.wordCount,
        datePublished: chapter.createdAt,
        dateModified: chapter.updatedAt || chapter.createdAt,
        publisher: {
          "@type": "Organization",
          name: "VStory",
          url: SITE_URL,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <ChapterReader />
    </>
  );
}
