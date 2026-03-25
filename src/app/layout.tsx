import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
// ads disabled
// import AdsterraPopunder from "@/components/ads/AdsterraPopunder";
// import AdsterraSocialBar from "@/components/ads/AdsterraSocialBar";

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
        {/* monetag disabled */}
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://backend-4nfb.onrender.com" />
        <link rel="dns-prefetch" href="https://backend-4nfb.onrender.com" />
        <link rel="preconnect" href="https://ydmkavspdccylpnskfsg.supabase.co" />
        <link rel="dns-prefetch" href="https://ydmkavspdccylpnskfsg.supabase.co" />



        {/* Auto-reload on chunk load failure (deploy cache mismatch) */}
        <Script id="chunk-error-recovery" strategy="beforeInteractive">{`
          (function(){
            function isChunkError(msg) {
              if (!msg) return false;
              return msg.indexOf('ChunkLoadError') !== -1
                || msg.indexOf('Loading chunk') !== -1
                || msg.indexOf('Loading CSS chunk') !== -1
                || msg.indexOf('Failed to fetch dynamically imported') !== -1
                || msg.indexOf('error loading dynamically imported module') !== -1;
            }
            function buildCacheBustUrl() {
              try {
                var url = new URL(window.location.href);
                // Use a short param name to avoid URL length issues
                url.searchParams.set('__r', String(Date.now()));
                return url.toString();
              } catch (_) {
                // Fallback for older browsers
                var sep = window.location.href.indexOf('?') === -1 ? '?' : '&';
                return window.location.href + sep + '__r=' + Date.now();
              }
            }
            function clearCaches() {
              if (!('caches' in window)) return Promise.resolve();
              return caches.keys().then(function(names) {
                return Promise.all(names.map(function(name) { return caches.delete(name); }));
              }).catch(function(){});
            }
            function unregisterServiceWorkers() {
              if (!('serviceWorker' in navigator)) return Promise.resolve();
              return navigator.serviceWorker.getRegistrations().then(function(regs) {
                return Promise.all(regs.map(function(r) { return r.unregister(); }));
              }).catch(function(){});
            }
            function recover() {
              if (sessionStorage.getItem('chunk_reload')) return;
              sessionStorage.setItem('chunk_reload', '1');
              // 1) Drop SW + caches 2) Navigate to URL with query-bust
              Promise.all([clearCaches(), unregisterServiceWorkers()]).finally(function() {
                try {
                  window.location.replace(buildCacheBustUrl());
                } catch (_) {
                  window.location.href = buildCacheBustUrl();
                }
              });
            }
            window.addEventListener('error', function(e) { if (isChunkError(e.message)) recover(); });
            window.addEventListener('unhandledrejection', function(e) {
              var msg = e.reason ? (e.reason.message || String(e.reason)) : '';
              if (isChunkError(msg)) recover();
            });
            // Clear flag on successful page load
            window.addEventListener('load', function() { sessionStorage.removeItem('chunk_reload'); });
          })();
        `}</Script>
        {/* monetag scripts disabled */}
      </head>
      <body>
        <AuthProvider>
          <UserProfileProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </UserProfileProvider>
        </AuthProvider>
        {/* ads disabled */}
      </body>
    </html>
  );
}
