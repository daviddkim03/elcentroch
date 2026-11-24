import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { SlideManager } from "./slide-manager";

export const metadata: Metadata = {
  ...pageMetadata({ title: "슬라이드 | 엘센트로 한인교회", description: "슬라이드", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <SlideManager />;
}
