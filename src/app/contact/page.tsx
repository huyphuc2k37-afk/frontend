import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Liên hệ – VStory",
  description:
    "Trang liên hệ chính thức của VStory. Hỗ trợ tài khoản, báo lỗi nội dung, khiếu nại và hợp tác.",
  alternates: {
    canonical: "https://vstory.vn/contact",
  },
  openGraph: {
    title: "Liên hệ – VStory",
    description:
      "Kênh liên hệ chính thức của VStory cho hỗ trợ, báo lỗi và hợp tác.",
    url: "https://vstory.vn/contact",
    siteName: "VStory",
    locale: "vi_VN",
    type: "website",
  },
};

export default function Page() {
  return <ContactClient />;
}
