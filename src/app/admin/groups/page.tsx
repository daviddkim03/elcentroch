import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { GroupsPage } from "../content";

export const metadata: Metadata = {
  ...pageMetadata({ title: "소그룹 | 엘센트로 한인교회", description: "소그룹", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <GroupsPage />;
}
