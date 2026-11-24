import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { EventsAdmin } from "./events-admin";

export const metadata: Metadata = {
  ...pageMetadata({ title: "행사 | 엘센트로 한인교회", description: "행사", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <EventsAdmin />;
}
