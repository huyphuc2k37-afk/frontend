import type { Metadata } from "next";
import StatsPage from "./StatsPage";

export const metadata: Metadata = { title: "Thống kê – VStory Studio" };

export default function Page() {
  return <StatsPage />;
}
