import type { Metadata } from "next";
import QuestsPage from "./QuestsPage";

export const metadata: Metadata = {
  title: "Nhiệm vụ hàng ngày – VStory",
  description: "Hoàn thành nhiệm vụ hàng ngày để nhận xu miễn phí trên VStory",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <QuestsPage />;
}
