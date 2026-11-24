import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { NewsPage } from "./news-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "소식 | 엘센트로 한인교회", description: "소식", ogDescription: "소식" }),
  robots: { index: false },
};

export default function Page() {
  return <NewsPage />;
}
