import type { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

const SITE_URL = "https://vstory.vn";

type BackendSitemapResponse = {
  stories: { slug: string; updatedAt: string }[];
  chapters: { storySlug: string; chapterId: string; updatedAt: string }[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ranking`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/the-loai`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/author`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/author-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
  ];

  /* Genre landing pages — fetch from API, fallback to hardcoded */
  let genreUrls: MetadataRoute.Sitemap = [];
  try {
    const catRes = await fetch(`${API_BASE_URL}/api/categories`, { next: { revalidate: 86400 } });
    if (catRes.ok) {
      const catData = await catRes.json();
      genreUrls = (catData?.categories || []).map((c: any) => ({
        url: `${SITE_URL}/the-loai/${c.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
    }
  } catch {
    // Fallback — hardcoded category slugs (must match DB)
    const fallbackSlugs = [
      "tinh-cam", "huyen-huyen", "xuyen-khong", "hoc-duong",
      "kinh-di", "dam-my", "bach-hop", "phieu-luu",
      "ngon-tinh", "light-novel", "khoa-hoc", "co-dai",
    ];
    genreUrls = fallbackSlugs.map((slug) => ({
      url: `${SITE_URL}/the-loai/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/sitemap`, {
      // Cache on Next side; backend also sets Cache-Control.
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [...staticUrls, ...genreUrls];

    const data = (await res.json()) as BackendSitemapResponse;

    const storyUrls: MetadataRoute.Sitemap = data.stories.map((s) => ({
      url: `${SITE_URL}/story/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Google allows max 50,000 URLs per sitemap.
    // Reserve slots for static + genre pages, fill the rest with chapters.
    const reserved = staticUrls.length + genreUrls.length + storyUrls.length;
    const maxChapters = Math.max(0, 50000 - reserved);
    const chapterUrls: MetadataRoute.Sitemap = data.chapters
      .slice(0, maxChapters)
      .map((c) => ({
        url: `${SITE_URL}/story/${c.storySlug}/chapter/${c.chapterId}`,
        lastModified: c.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));

    return [...staticUrls, ...genreUrls, ...storyUrls, ...chapterUrls];
  } catch {
    return [...staticUrls, ...genreUrls];
  }
}
