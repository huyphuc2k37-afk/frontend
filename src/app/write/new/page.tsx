import type { Metadata } from "next";
import CreateStoryPage from "./CreateStoryPage";

export const metadata: Metadata = { title: "Tạo truyện mới – VStory" };
export default function Page() { return <CreateStoryPage />; }
