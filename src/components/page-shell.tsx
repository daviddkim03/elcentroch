"use client";

import { useLang } from "@/lib/i18n";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function PageShell({
  titleKo,
  titleEn,
  eyebrow,
  image,
  children,
}: {
  titleKo: string;
  titleEn: string;
  eyebrow: string;
  image: string;
  children: React.ReactNode;
}) {
  const { t } = useLang();
  return (
    <div className="min-h-screen">
      <SiteHeader transparent />
      <section className="relative flex h-[50vh] min-h-[360px] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 text-ink-foreground">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 animate-fadeup text-4xl font-bold md:text-5xl">
            {t(titleKo, titleEn)}
          </h1>
        </div>
      </section>
      <main className="mx-auto max-w-5xl px-6 py-20">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function InfoCard({
  titleKo,
  titleEn,
  ko,
  en,
}: {
  titleKo: string;
  titleEn: string;
  ko: string;
  en: string;
}) {
  const { t } = useLang();
  return (
    <div className="border-t-2 border-gold bg-card p-8 shadow-sm">
      <h3 className="text-xl font-bold">{t(titleKo, titleEn)}</h3>
      <p className="mt-3 leading-relaxed text-muted-foreground">{t(ko, en)}</p>
    </div>
  );
}
