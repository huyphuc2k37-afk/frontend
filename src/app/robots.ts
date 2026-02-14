import type { MetadataRoute } from "next";

const SITE_URL = "https://vstory.vn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/mod/",
          "/write/",
          "/login",
          "/register",
          "/author/register",
          "/profile",
          "/wallet",
          "/bookshelf",
        ],
      },
    ],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
