import type { Metadata } from "next";
import AuthorPage from "./AuthorPage";

export const metadata: Metadata = {
  title: "Trở thành tác giả – VStory",
  description:
    "Chia sẻ câu chuyện của bạn với hàng triệu độc giả. Nhận 70% doanh thu, công cụ viết chuyên nghiệp, và cộng đồng hỗ trợ.",
  alternates: {
    canonical: "https://vstory.vn/author",
  },
};

export default function Page() {
  return <AuthorPage />;
}
