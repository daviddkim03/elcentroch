import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { AccessPage } from "./access-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "권한 | 엘센트로 한인교회", description: "권한", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <AccessPage />;
}
