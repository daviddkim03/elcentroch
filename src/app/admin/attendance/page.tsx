import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { AttendancePage } from "./attendance-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "출석 | 엘센트로 한인교회", description: "출석", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <AttendancePage />;
}
