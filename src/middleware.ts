import { NextRequest, NextResponse } from "next/server";

const PRIMARY_HOST = "vstory.vn";
const WWW_HOST = "www.vstory.vn";

/**
 * 301 redirect map: old / alternative genre slugs → canonical category slugs.
 * Keeps SEO juice when old URLs are crawled or bookmarked.
 *
 * Canonical slugs (DO NOT add these as keys):
 *   tinh-cam, huyen-huyen, xuyen-khong, hoc-duong, kinh-di,
 *   dam-my, bach-hop, phieu-luu, ngon-tinh, light-novel, khoa-hoc, co-dai
 */
const GENRE_REDIRECTS: Record<string, string> = {
  // Legacy "broad" slugs from previous category scheme
  "gia-tuong-huyen-huyen": "huyen-huyen",
  "kinh-di-tam-linh": "kinh-di",
  "hoc-duong-do-thi": "hoc-duong",
  "fanfic-light-novel": "light-novel",
  "khoa-hoc-tuong-lai": "khoa-hoc",

  // Auto-generated slugs from old seed_tags.js
  "huyen-huyen-gia-tuong": "huyen-huyen",
  "xuyen-khong-chuyen-sinh": "xuyen-khong",
  "hoc-duong-doi-thuong": "hoc-duong",
  "kinh-di-linh-di": "kinh-di",
  "phieu-luu-hanh-dong": "phieu-luu",
  "light-novel-fanfic": "light-novel",
  "khoa-hoc-vien-tuong": "khoa-hoc",
  "co-dai-kiem-hiep": "co-dai",

  // Alternative / sub-genre slugs → parent category
  "tien-hiep": "huyen-huyen",
  "trong-sinh": "xuyen-khong",
  "do-thi": "hoc-duong",
  "mat-the": "phieu-luu",
  "ngot-sung": "tinh-cam",
  "fanfic": "light-novel",
  "khoa-hoc-vien-tuong-2": "khoa-hoc",
};

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const forwardedProto = (request.headers.get("x-forwarded-proto") || "").toLowerCase();
  const protocol = (forwardedProto || request.nextUrl.protocol.replace(":", "")).toLowerCase();

  const isPrimaryDomain = host === PRIMARY_HOST || host === WWW_HOST;

  if (!isPrimaryDomain) {
    return NextResponse.next();
  }

  if (host === WWW_HOST || protocol === "http") {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = PRIMARY_HOST;
    return NextResponse.redirect(url, 308);
  }

  // 301 redirect old genre slugs to new category slugs
  const pathname = request.nextUrl.pathname;
  const match = pathname.match(/^\/the-loai\/([a-z0-9-]+)$/);
  if (match) {
    const oldSlug = match[1];
    const newSlug = GENRE_REDIRECTS[oldSlug];
    if (newSlug) {
      const url = request.nextUrl.clone();
      url.pathname = `/the-loai/${newSlug}`;
      return NextResponse.redirect(url, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
