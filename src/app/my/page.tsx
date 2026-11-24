import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { MyHome } from "./my-home";

export const metadata: Metadata = {
  ...pageMetadata({ title: "내 교회 | 엘센트로 한인교회", description: "내 교회", ogDescription: "내 교회" }),
  robots: { index: false },
};

export default function Page() {
  return <MyHome />;
}
