import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { GivingAdmin } from "./giving-admin";

export const metadata: Metadata = {
  ...pageMetadata({ title: "헌금 | 엘센트로 한인교회", description: "헌금", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <GivingAdmin />;
}
