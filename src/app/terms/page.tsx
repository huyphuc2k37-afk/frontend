import type { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng – VStory",
  description:
    "Điều khoản sử dụng của VStory. Quy định về quyền và nghĩa vụ của người dùng khi sử dụng nền tảng.",
  alternates: {
    canonical: "https://vstory.vn/terms",
  },
  openGraph: {
    title: "Điều khoản sử dụng – VStory",
    description:
      "Điều khoản sử dụng của VStory. Quy định về quyền và nghĩa vụ của người dùng.",
    url: "https://vstory.vn/terms",
    siteName: "VStory",
    locale: "vi_VN",
    type: "website",
  },
};

export default function Page() {
  return <TermsClient />;
}
