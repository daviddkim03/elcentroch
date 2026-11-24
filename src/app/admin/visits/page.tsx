import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { VisitsAdmin } from "./visits-admin";

export const metadata: Metadata = {
  ...pageMetadata({ title: "방문 문의 | 엘센트로 한인교회", description: "방문 문의", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <VisitsAdmin />;
}
