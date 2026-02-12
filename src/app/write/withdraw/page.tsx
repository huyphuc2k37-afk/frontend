import type { Metadata } from "next";
import WithdrawPage from "./WithdrawPage";

export const metadata: Metadata = { title: "Rút tiền – VStory Studio" };

export default function Page() {
  return <WithdrawPage />;
}
