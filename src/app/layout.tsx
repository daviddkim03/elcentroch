import type { Metadata } from "next";
import { LangProvider } from "@/lib/i18n";
import "./globals.css";

const ogImage =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/lovp_15f5vfv3tn8cjb68fwj6c9nz8c/c02c6834fe328c2f88c0df10c0b83d8b_1793559221530.png";

export const metadata: Metadata = {
  title: "엘센트로 한인교회 | El Centro Korean Church",
  description: "캘리포니아 엘센트로 한인교회. 주일예배 일요일 오전 9시, 담임 김요셉 목사.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    title: "엘센트로 한인교회 | El Centro Korean Church",
    description: "Korean-American church in El Centro, CA. Sunday service 9:00 AM.",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "엘센트로 한인교회 | El Centro Korean Church",
    description: "Korean-American church in El Centro, CA. Sunday service 9:00 AM.",
    images: [ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
