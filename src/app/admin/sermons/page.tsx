import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { SermonsAdmin } from "../content";

export const metadata: Metadata = {
  ...pageMetadata({ title: "설교 | 엘센트로 한인교회", description: "설교", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <SermonsAdmin />;
}
