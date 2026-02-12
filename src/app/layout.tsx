import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

export const metadata: Metadata = {
  title: "VStory – Câu chuyện của người Việt",
  description:
    "Đọc truyện đa thể loại và ủng hộ tác giả. Nền tảng truyện dành cho người Việt.",
  keywords: ["truyện", "đọc truyện", "truyện chữ", "tiểu thuyết", "VStory"],
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
