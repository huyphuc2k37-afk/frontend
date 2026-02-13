import type { Metadata } from "next";
import ExplorePage from "./ExplorePage";

export const metadata: Metadata = {
  title: "Khám phá truyện – VStory",
  description:
    "Tìm và đọc truyện chữ đa thể loại. Lọc theo thể loại, trạng thái, tìm kiếm tác giả và truyện yêu thích.",
};

export default function Page() {
  return <ExplorePage />;
}
