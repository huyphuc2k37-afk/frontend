import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

export const metadata: Metadata = {
  title: "VStory � C�u chuy?n c?a ngu?i Vi?t",
  description:
    "�?c truy?n da th? lo?i v� ?ng h? t�c gi?. N?n t?ng truy?n d�nh cho ngu?i Vi?t.",
  keywords: ["truy?n", "d?c truy?n", "truy?n ch?", "ti?u thuy?t", "VStory"],
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
