import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Truyện dịch - VStory",
  description: "Khám phá truyện dịch trên VStory với đầy đủ thể loại, xuất xứ và hashtag.",
};

export default function TranslatedStoriesRedirectPage() {
  redirect("/explore?origin=translated");
}