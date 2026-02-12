import type { Metadata } from "next";
import AboutPage from "./AboutPage";

export const metadata: Metadata = {
  title: "Gi?i thi?u � VStory",
  description:
    "VStory l� n?n t?ng d?c v� vi?t truy?n ch? d�nh cho ngu?i Vi?t. �u?c s�ng l?p b?i Nguy?n Huy Ph�c.",
};

export default function Page() {
  return <AboutPage />;
}
