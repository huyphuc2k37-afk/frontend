import type { Metadata } from "next";
import ModLayout from "@/components/ModLayout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ModRouteLayout({ children }: { children: React.ReactNode }) {
  return <ModLayout>{children}</ModLayout>;
}
