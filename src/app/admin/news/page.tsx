import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { NewsAdmin } from "../content";

export const metadata: Metadata = {
  ...pageMetadata({ title: "소식 | 엘센트로 한인교회", description: "소식", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <NewsAdmin />;
}
