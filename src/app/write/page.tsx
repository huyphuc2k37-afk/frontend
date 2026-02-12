import { Metadata } from "next";
import WritePage from "./WritePage";

export const metadata: Metadata = {
  title: "Viết truyện – VStory",
};

export default function Page() {
  return <WritePage />;
}
