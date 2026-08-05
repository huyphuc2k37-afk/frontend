import type { Metadata } from "next";
import MaintenanceClient from "./MaintenanceClient";

export const metadata: Metadata = {
  title: "Đang bảo trì | VStory",
  description:
    "VStory đang được bảo trì để nâng cấp hệ thống. Chúng tôi sẽ sớm quay lại.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return <MaintenanceClient />;
}
