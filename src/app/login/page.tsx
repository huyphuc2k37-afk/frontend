import type { Metadata } from "next";
import LoginPage from "./LoginPage";

export const metadata: Metadata = {
  title: "�ang nh?p � VStory",
  description: "�ang nh?p v�o VStory d? d?c truy?n, theo d�i t�c gi? y�u th�ch v� qu?n l� t? truy?n.",
};

export default function Page() {
  return <LoginPage />;
}
