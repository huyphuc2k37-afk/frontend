import type { Metadata } from "next";
import StudioLayout from "@/components/StudioLayout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function WriteLayout({ children }: { children: React.ReactNode }) {
  return <StudioLayout>{children}</StudioLayout>;
}
