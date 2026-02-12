import type { Metadata } from "next";
import AuthorPage from "./AuthorPage";

export const metadata: Metadata = {
  title: "Tr? th�nh t�c gi? � VStory",
  description:
    "Chia s? c�u chuy?n c?a b?n v?i h�ng tri?u d?c gi?. Nh?n 70% doanh thu, c�ng c? vi?t chuy�n nghi?p, v� c?ng d?ng h? tr?.",
};

export default function Page() {
  return <AuthorPage />;
}
