import type { Metadata } from "next";
import { API_BASE_URL } from "@/lib/api";
import AuthorProfileClient from "./AuthorProfileClient";

const SITE_URL = "https://vstory.vn";

type Props = { params: { authorId: string } };

async function getAuthor(authorId: string) {
  try {
    const res = await fetch(API_BASE_URL + "/api/authors/" + authorId, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getAuthor(params.authorId);

  if (!data?.author) {
    return { title: "Tác giả không tồn tại – VStory" };
  }

  const author = data.author;
  const storyCount = Array.isArray(data.stories) ? data.stories.length : 0;
  const description =
    author.bio?.slice(0, 160) ||
    "Đọc " + storyCount + " tác phẩm của " + author.name + " trên VStory.";

  return {
    title: author.name + " – Tác giả trên VStory",
    description,
    alternates: {
      canonical: SITE_URL + "/author/" + params.authorId,
    },
    openGraph: {
      title: author.name + " – Tác giả trên VStory",
      description,
      url: SITE_URL + "/author/" + params.authorId,
      siteName: "VStory",
      type: "profile",
      ...(author.image
        ? { images: [{ url: author.image, width: 200, height: 200, alt: author.name }] }
        : {}),
    },
    twitter: {
      card: "summary",
      title: author.name + " – Tác giả trên VStory",
      description,
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const data = await getAuthor(params.authorId);

  const jsonLd = data?.author
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: data.author.name,
        url: SITE_URL + "/author/" + params.authorId,
        ...(data.author.image ? { image: data.author.image } : {}),
        ...(data.author.bio ? { description: data.author.bio.slice(0, 300) } : {}),
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
      <AuthorProfileClient />
    </>
  );
}
