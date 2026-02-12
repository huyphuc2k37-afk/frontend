import type { Metadata } from "next";
import WalletPage from "./WalletPage";

export const metadata: Metadata = {
  title: "Ví xu – VStory",
  description: "Nạp xu để đọc truyện trả phí trên VStory",
};

export default function Page() {
  return <WalletPage />;
}
