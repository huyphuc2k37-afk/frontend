import type { Metadata } from "next";
import FaqPage from "./FaqPage";

export const metadata: Metadata = { title: "Câu hỏi thường gặp – VStory Studio" };

export default function Page() {
  return <FaqPage />;
}
