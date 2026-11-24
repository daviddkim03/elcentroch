import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { PrayerPage } from "./prayer-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "기도 | 엘센트로 한인교회", description: "기도", ogDescription: "기도" }),
  robots: { index: false },
};

export default function Page() {
  return <PrayerPage />;
}
