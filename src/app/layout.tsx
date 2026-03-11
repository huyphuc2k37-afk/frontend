import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "optional",
  variable: "--font-jakarta",
});

const SITE_URL = "https://vstory.vn";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VStory – Đọc Truyện Chữ Online Miễn Phí",
    template: "%s | VStory",
  },
  description:
    "VStory – Nền tảng đọc truyện chữ online miễn phí hàng đầu Việt Nam. Truyện ngôn tình, đam mỹ, xuyên không, tu tiên, kinh dị, học đường. Cập nhật chương mới mỗi ngày.",
  keywords: [
    "đọc truyện",
    "truyện chữ",
    "truyện online",
    "đọc truyện online miễn phí",
    "truyện hay",
    "tiểu thuyết",
    "VStory",
    "truyện ngôn tình",
    "truyện đam mỹ",
    "truyện xuyên không",
    "truyện tiên hiệp",
    "truyện kinh dị",
    "truyện học đường",
    "truyện huyền huyễn",
    "light novel",
    "web truyện",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "VStory",
    title: "VStory – Đọc Truyện Chữ Online Miễn Phí",
    description:
      "VStory – Nền tảng đọc truyện chữ online miễn phí hàng đầu Việt Nam. Hàng nghìn truyện hay cập nhật mỗi ngày.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "VStory – Đọc Truyện Chữ Online Miễn Phí",
    description:
      "VStory – Nền tảng đọc truyện chữ online miễn phí hàng đầu Việt Nam. Hàng nghìn truyện hay cập nhật mỗi ngày.",
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
    <html lang="vi" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://backend-4nfb.onrender.com" />
        <link rel="dns-prefetch" href="https://backend-4nfb.onrender.com" />
        <link rel="preconnect" href="https://ydmkavspdccylpnskfsg.supabase.co" />
        <link rel="dns-prefetch" href="https://ydmkavspdccylpnskfsg.supabase.co" />
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
