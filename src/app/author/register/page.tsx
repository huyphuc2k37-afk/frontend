import { Metadata } from "next";
import RegisterPage from "./RegisterPage";

export const metadata: Metadata = {
  title: "Đăng ký tác giả | VStory",
  description: "Trở thành tác giả trên VStory – Chia sẻ câu chuyện và kiếm thu nhập từ đam mê viết lách.",
};

export default function Page() {
  return <RegisterPage />;
}
