import type { Metadata } from "next";
import AffiliatePage from "./AffiliatePage";

export const metadata: Metadata = {
  title: "Affiliate - VStory",
  description: "Kiếm xu bằng cách giới thiệu bạn bè đến VStory",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AffiliatePage />;
}
