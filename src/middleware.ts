import { NextRequest, NextResponse } from "next/server";

const PRIMARY_HOST = "vstory.vn";
const WWW_HOST = "www.vstory.vn";

/**
 * 301 redirect map: old genre slugs → new category slugs.
 * Keeps SEO juice when old URLs are crawled or bookmarked.
 */
const GENRE_REDIRECTS: Record<string, string> = {
  "ngon-tinh": "tinh-cam",
  "dam-my": "tinh-cam",
  "bach-hop": "tinh-cam",
  "ngot-sung": "tinh-cam",
  "tien-hiep": "gia-tuong-huyen-huyen",
  "huyen-huyen": "gia-tuong-huyen-huyen",
  "khoa-hoc-vien-tuong": "khoa-hoc-tuong-lai",
  "trong-sinh": "xuyen-khong",
  "kinh-di": "kinh-di-tam-linh",
  "hoc-duong": "hoc-duong-do-thi",
  "co-dai": "hoc-duong-do-thi",
  "do-thi": "hoc-duong-do-thi",
  "mat-the": "hoc-duong-do-thi",
  "light-novel": "fanfic-light-novel",
  "fanfic": "fanfic-light-novel",
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
