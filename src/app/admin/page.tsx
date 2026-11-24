import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  ...pageMetadata({ title: "관리자 | 엘센트로 한인교회", description: "관리자", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <Dashboard />;
}
