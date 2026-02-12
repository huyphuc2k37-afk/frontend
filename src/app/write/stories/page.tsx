import type { Metadata } from "next";
import StoriesPage from "./StoriesPage";

export const metadata: Metadata = { title: "Tác phẩm của tôi – VStory Studio" };

export default function Page() {
  return <StoriesPage />;
}
