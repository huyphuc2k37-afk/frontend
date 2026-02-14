import { Metadata } from "next";
import ProfilePage from "./ProfilePage";

export const metadata: Metadata = {
  title: "Trang cá nhân – VStory",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ProfilePage />;
}
