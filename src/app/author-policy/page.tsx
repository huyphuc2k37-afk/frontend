import type { Metadata } from "next";
import AuthorPolicyClient from "./AuthorPolicyClient";

export const metadata: Metadata = {
  title: "Chính sách Tác giả – VStory",
  description:
    "Chính sách dành cho Tác giả trên VStory. Điều khoản về đăng tác phẩm, chia sẻ doanh thu, và quyền lợi tác giả.",
  alternates: {
    canonical: "https://vstory.vn/author-policy",
  },
  openGraph: {
    title: "Chính sách Tác giả – VStory",
    description:
      "Điều khoản dành cho Tác giả trên VStory. Chia sẻ doanh thu và quyền lợi.",
    url: "https://vstory.vn/author-policy",
    siteName: "VStory",
    type: "website",
  },
};

export default function Page() {
  return <AuthorPolicyClient />;
}
