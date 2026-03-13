import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import TagPageClient from "./TagPageClient";

const SITE_URL = "https://vstory.vn";

export const revalidate = 3600; // ISR — regenerate at most every 1 hour
export const dynamicParams = true;

type Props = { params: { slug: string } };

interface ApiTag {
  id: string;
  name: string;
  slug: string;
  type: string;
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
  coverUrl?: string | null;
  isAdult?: boolean;
  author: { id: string; name: string; image: string | null };
  category?: { name: string; slug: string } | null;
  _count: { chapters: number; bookmarks: number };
  tags?: { name: string; slug: string; type: string }[];
}

async function getTagBySlug(
  slug: string,
): Promise<{ tag: ApiTag; stories: ApiStory[]; pagination: any } | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tags/${slug}?pageSize=30&sort=updated`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      if (attempt === 1) return null;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getTagBySlug(params.slug);
  if (!data) return { title: "Tag không tồn tại – VStory" };

  const tag = data.tag;
  const title = `Truyện ${tag.name} - Đọc Online Miễn Phí | VStory`;
  const description = `Danh sách truyện có tag "${tag.name}" hay nhất – đọc trực tuyến miễn phí tại VStory.vn.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/tag/${tag.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/tag/${tag.slug}`,
      siteName: "VStory",
      type: "website",
    },
  };
}

export default async function TagPage({ params }: Props) {
  const data = await getTagBySlug(params.slug);
  if (!data) notFound();

  return (
    <TagPageClient
      tag={data.tag}
      initialStories={data.stories}
      pagination={data.pagination}
    />
  );
}
