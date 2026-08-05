import type { Metadata } from "next";
import AuthorAdsPage from "./AuthorAdsPage";

export const metadata: Metadata = {
  title: "Quảng cáo tác giả – VStory Studio",
  description: "Quản lý quảng cáo và thu nhập từ quảng cáo trên truyện của bạn",
};

export default function Page() {
  return <AuthorAdsPage />;
}
