import type { Metadata } from "next";
import ExplorePage from "./ExplorePage";

export const metadata: Metadata = {
  title: "Kh�m ph� truy?n � VStory",
  description:
    "T�m v� d?c truy?n ch? da th? lo?i. L?c theo th? lo?i, tr?ng th�i, t�m ki?m t�c gi? v� truy?n y�u th�ch.",
};

export default function Page() {
  return <ExplorePage />;
}
