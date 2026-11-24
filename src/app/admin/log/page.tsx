import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LogPage } from "./log-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "접근 기록 | 엘센트로 한인교회", description: "접근 기록", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <LogPage />;
}
