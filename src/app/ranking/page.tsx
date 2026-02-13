import { Metadata } from "next";
import RankingPage from "./RankingPage";

export const metadata: Metadata = {
  title: "Bảng xếp hạng – VStory",
};

export default function Page() {
  return <RankingPage />;
}
