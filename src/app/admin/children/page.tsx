import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ChildrenAdmin } from "./children-admin";

export const metadata: Metadata = {
  ...pageMetadata({ title: "주일학교 | 엘센트로 한인교회", description: "주일학교", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <ChildrenAdmin />;
}
