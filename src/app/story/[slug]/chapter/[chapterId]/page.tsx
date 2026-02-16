import type { Metadata } from "next";
import { API_BASE_URL } from "@/lib/api";
import ChapterReader from "./ChapterReader";

const SITE_URL = "https://vstory.vn";

type Props = { params: { slug: string; chapterId: string } };

async function getChapter(chapterId: string) {
  try {
    const res = await fetch(API_BASE_URL + "/api/chapters/" + chapterId, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
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
      canonical: SITE_URL + "/story/" + params.slug + "/chapter/" + params.chapterId,
    },
    openGraph: {
      title: chapterTitle + " – " + storyTitle,
      description,
      url: SITE_URL + "/story/" + params.slug + "/chapter/" + params.chapterId,
      siteName: "VStory",
      type: "article",
      ...(chapter.story?.id
        ? {
            images: [
              {
                url: API_BASE_URL + "/api/stories/" + chapter.story.id + "/cover",
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
          "/story/" +
          params.slug +
          "/chapter/" +
          params.chapterId,
        inLanguage: "vi",
        isPartOf: {
          "@type": "Book",
          name: chapter.story?.title,
          url: SITE_URL + "/story/" + params.slug,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ChapterReader />
    </>
  );
}
