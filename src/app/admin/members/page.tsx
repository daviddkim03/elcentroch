import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { MembersPage } from "./members-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "교인 관리 | 엘센트로 한인교회", description: "교인 관리", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <MembersPage />;
}
