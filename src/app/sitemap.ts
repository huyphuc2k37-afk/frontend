import type { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/api";

const SITE_URL = "https://vstory.vn";

type BackendSitemapResponse = {
  stories: { slug: string; updatedAt: string }[];
  chapters: { storySlug: string; chapterId: string; updatedAt: string }[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/ranking`, lastModified: new Date() },
    { url: `${SITE_URL}/privacy`, lastModified: new Date() },
    { url: `${SITE_URL}/terms`, lastModified: new Date() },
  ];

  try {
    const res = await fetch(`${API_BASE_URL}/api/sitemap`, {
      // Cache on Next side; backend also sets Cache-Control.
      next: { revalidate: 3600 },
    });

    if (!res.ok) return staticUrls;

    const data = (await res.json()) as BackendSitemapResponse;

    const storyUrls: MetadataRoute.Sitemap = data.stories.map((s) => ({
      url: `${SITE_URL}/story/${s.slug}`,
      lastModified: s.updatedAt,
    }));

    const chapterUrls: MetadataRoute.Sitemap = data.chapters.map((c) => ({
      url: `${SITE_URL}/story/${c.storySlug}/chapter/${c.chapterId}`,
      lastModified: c.updatedAt,
    }));

    return [...staticUrls, ...storyUrls, ...chapterUrls];
  } catch {
    return staticUrls;
  }
}
