"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import { LuArrowRight, LuChevronRight, LuPhone } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PageShell({
  titleKo,
  titleEn,
  eyebrow,
  image,
  introKo,
  introEn,
  children,
}: {
  titleKo: string;
  titleEn: string;
  eyebrow: string;
  image: string;
  introKo?: string;
  introEn?: string;
  children: React.ReactNode;
}) {
  const { t } = useLang();
  return (
    <div className="min-h-screen">
      <SiteHeader transparent />
      <section className="relative flex h-[52vh] min-h-[380px] items-end overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="absolute inset-0 h-full w-full animate-kenburns object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 text-white">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/70">
            <Link href="/" className="hover:text-white">
              {t("홈", "Home")}
            </Link>
            <LuChevronRight className="size-3.5" />
            <span className="text-white">{t(titleKo, titleEn)}</span>
          </nav>
          <p className="eyebrow mt-6 text-white/70">{eyebrow}</p>
          <h1 className="mt-3 animate-fadeup text-4xl font-bold md:text-6xl">{t(titleKo, titleEn)}</h1>
          {introKo && (
            <p className="mt-4 max-w-2xl animate-fadeup text-lg text-white/85">{t(introKo, introEn ?? introKo)}</p>
          )}
        </div>
      </section>
      <main id="main" className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        {children}
      </main>
      <VisitBand />
      <SiteFooter />
    </div>
  );
}

export function InfoCard({
  titleKo,
  titleEn,
  ko,
  en,
  icon: Icon,
}: {
  titleKo: string;
  titleEn: string;
  ko: string;
  en: string;
  icon?: IconType;
}) {
  const { t } = useLang();
  return (
    <Card className="group h-full gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="gap-4">
        {Icon && (
          <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-5" />
          </span>
        )}
        <CardTitle className="font-serif text-xl">{t(titleKo, titleEn)}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-[15px] leading-relaxed">{t(ko, en)}</CardDescription>
      </CardContent>
    </Card>
  );
}

export function SectionHeading({
  eyebrow,
  ko,
  en,
  center,
}: {
  eyebrow: string;
  ko: string;
  en: string;
  center?: boolean;
}) {
  const { t } = useLang();
  return (
    <div className={center ? "text-center" : undefined}>
      <p className="eyebrow text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold md:text-4xl">{t(ko, en)}</h2>
    </div>
  );
}

function VisitBand() {
  const { t } = useLang();
  return (
    <section className="border-t bg-muted/50">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">{t("이번 주일에 함께해요", "Join us this Sunday")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t("매주 일요일 오전 9:00 · ", "Every Sunday at 9:00 AM · ")}
            {site.address}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/#visit">
              {t("오시는 길", "Get directions")} <LuArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <a href={`tel:${site.phone}`}>
              <LuPhone /> {site.phone}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
