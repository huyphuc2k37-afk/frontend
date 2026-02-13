import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vstory.vn";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VStory – Đọc truyện online miễn phí",
    template: "%s | VStory",
  },
  description:
    "Đọc truyện chữ online đa thể loại: tiên hiệp, kiếm hiệp, ngôn tình, đô thị… Ủng hộ tác giả Việt. Nền tảng truyện dành cho người Việt.",
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
      "Đọc truyện chữ online đa thể loại. Ủng hộ tác giả Việt trên nền tảng VStory.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "VStory – Đọc truyện online miễn phí",
    description:
      "Đọc truyện chữ online đa thể loại. Ủng hộ tác giả Việt trên nền tảng VStory.",
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
      <body>
        <AuthProvider>
          <UserProfileProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </UserProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
