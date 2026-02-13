import { Metadata } from "next";
import BookshelfPage from "./BookshelfPage";

export const metadata: Metadata = {
  title: "Tủ truyện – VStory",
};

export default function Page() {
  return <BookshelfPage />;
}
