import { Metadata } from "next";
import BookshelfPage from "./BookshelfPage";

export const metadata: Metadata = {
  title: "Tủ truyện – VStory",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <BookshelfPage />;
}
