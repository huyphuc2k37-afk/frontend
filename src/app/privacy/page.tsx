import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
  title: "Chính sách bảo mật – VStory",
  description:
    "Chính sách bảo mật của VStory. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.",
  alternates: {
    canonical: "https://vstory.vn/privacy",
  },
  openGraph: {
    title: "Chính sách bảo mật – VStory",
    description:
      "Chính sách bảo mật của VStory. Tìm hiểu cách chúng tôi bảo vệ dữ liệu của bạn.",
    url: "https://vstory.vn/privacy",
    siteName: "VStory",
    type: "website",
  },
};

export default function Page() {
  return <PrivacyClient />;
}
