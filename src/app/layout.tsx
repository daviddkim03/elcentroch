import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { withBasePath } from "@/lib/base-path";
import { LangProvider } from "@/lib/i18n";
import { ogImage } from "@/lib/metadata";
// Self-hosted copies of the fonts the original loads from Google Fonts. Google
// serves Noto Sans KR / Noto Serif KR as variable fonts (one file per unicode
// slice covers every weight), so the variable packages render identically.
// Imported here rather than from globals.css: inlining ~250 unicode-range
// @font-face rules into one stylesheet overflows webpack's CSS parser.
import "@fontsource-variable/noto-sans-kr";
import "@fontsource-variable/noto-serif-kr";
import "./globals.css";

// Defaults for every page (the 404 page uses them as-is); pages override them.
export const metadata: Metadata = {
  title: "엘센트로 한인교회 | El Centro Korean Church",
  description: "캘리포니아 엘센트로에 위치한 한인교회입니다. 주일예배 오전 9시.",
  icons: { icon: { url: withBasePath("/favicon.ico"), type: "image/x-icon" } },
  openGraph: { type: "website", images: [ogImage] },
  twitter: { card: "summary_large_image", images: [ogImage] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <LangProvider>
          {children}
          <Toaster />
        </LangProvider>
      </body>
    </html>
  );
}
