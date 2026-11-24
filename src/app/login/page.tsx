import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LoginPage } from "./login-page";

export const metadata: Metadata = {
  ...pageMetadata({ title: "로그인 | 엘센트로 한인교회", description: "로그인", ogDescription: "로그인" }),
  robots: { index: false },
};

export default function Page() {
  return <LoginPage />;
}
