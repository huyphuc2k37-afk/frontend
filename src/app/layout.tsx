import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

const SITE_URL = "https://vstory.vn";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VStory – Đọc truyện online miễn phí",
    template: "%s | VStory",
  },
  description:
    "Khám phá hàng nghìn truyện hay của tác giả Việt trên VStory. Đọc miễn phí, theo dõi truyện yêu thích và cập nhật chương mới mỗi ngày.",
  keywords: [
    "đọc truyện",
    "truyện chữ",
    "truyện online",
    "tiểu thuyết",
    "VStory",
    "truyện tiên hiệp",
    "truyện ngôn tình",
    "truyện kiếm hiệp",
    "truyện đô thị",
    "light novel",
  ],
  icons: {
    icon: "/favicon.ico?v=20260212",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "VStory",
    title: "VStory – Đọc truyện online miễn phí",
    description:
      "Khám phá hàng nghìn truyện hay của tác giả Việt trên VStory. Đọc miễn phí, theo dõi truyện yêu thích và cập nhật chương mới mỗi ngày.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "VStory – Đọc truyện online miễn phí",
    description:
      "Khám phá hàng nghìn truyện hay của tác giả Việt trên VStory. Đọc miễn phí, theo dõi truyện yêu thích và cập nhật chương mới mỗi ngày.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5262734754559750"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthProvider>
          <UserProfileProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </UserProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
