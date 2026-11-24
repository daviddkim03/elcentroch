import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { DirectoryPage } from "./directory-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "교인 | 엘센트로 한인교회", description: "교인", ogDescription: "교인" }),
  robots: { index: false },
};

export default function Page() {
  return <DirectoryPage />;
}
