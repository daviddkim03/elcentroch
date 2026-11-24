import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { FamilyPage } from "./family-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "자녀 | 엘센트로 한인교회", description: "자녀", ogDescription: "자녀" }),
  robots: { index: false },
};

export default function Page() {
  return <FamilyPage />;
}
