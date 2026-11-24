import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ServingAdmin } from "./serving-admin";

export const metadata: Metadata = {
  ...pageMetadata({ title: "섬김 | 엘센트로 한인교회", description: "섬김", ogDescription: "Admin" }),
  robots: { index: false },
};

export default function Page() {
  return <ServingAdmin />;
}
