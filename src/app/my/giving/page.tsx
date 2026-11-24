import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { GivingPage } from "./giving-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "헌금 | 엘센트로 한인교회", description: "헌금", ogDescription: "헌금" }),
  robots: { index: false },
};

export default function Page() {
  return <GivingPage />;
}
