import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ProfilePage } from "./profile-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "내 정보 | 엘센트로 한인교회", description: "내 정보", ogDescription: "내 정보" }),
  robots: { index: false },
};

export default function Page() {
  return <ProfilePage />;
}
