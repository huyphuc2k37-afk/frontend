import { Metadata } from "next";
import ProfilePage from "./ProfilePage";

export const metadata: Metadata = {
  title: "Trang cá nhân – VStory",
};

export default function Page() {
  return <ProfilePage />;
}
