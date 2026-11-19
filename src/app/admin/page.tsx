import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { AdminApp } from "./admin-app";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "관리자 | 엘센트로 한인교회",
    description: "메인 슬라이드 이미지 관리",
    ogDescription: "Admin",
  }),
  robots: { index: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
