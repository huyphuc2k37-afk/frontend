import { Metadata } from "next";
import RankingPage from "./RankingPage";

export const metadata: Metadata = {
  title: "Bảng xếp hạng – VStory",
  alternates: {
    canonical: "https://vstory.vn/ranking",
  },
};

export default function Page() {
  return <RankingPage />;
}
