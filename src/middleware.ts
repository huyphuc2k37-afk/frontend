import { NextRequest, NextResponse } from "next/server";

const PRIMARY_HOST = "vstory.vn";
const WWW_HOST = "www.vstory.vn";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
