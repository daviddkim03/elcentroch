"use client";

import Link from "next/link";
import {
  LuArrowRight,
  LuArrowUpRight,
  LuBookOpen,
  LuClock,
  LuHeart,
  LuMapPin,
  LuPhone,
  LuSprout,
  LuUsers,
} from "react-icons/lu";
import { HeroSlider } from "@/components/hero-slider";
import { SectionHeading } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLang } from "@/lib/i18n";
import { images, site } from "@/lib/site";

const quickLinks = [
  { to: "/about", icon: LuHeart, ko: "교회소개", en: "About Us", dko: "우리 교회를 소개합니다", den: "Get to know our church" },
  { to: "/worship", icon: LuBookOpen, ko: "예배와 말씀", en: "Worship & Word", dko: "예배 시간과 설교", den: "Service times & sermons" },
  { to: "/ministry", icon: LuUsers, ko: "사역", en: "Ministries", dko: "섬김과 선교의 자리", den: "Serving and mission" },
  { to: "/next-generation", icon: LuSprout, ko: "다음세대", en: "Next Generation", dko: "자녀와 청소년 사역", den: "Children & youth" },
];

export default function Home() {
  const { t } = useLang();
  return (
    <div>
      <SiteHeader transparent />
      <HeroSlider />

      {/* Quick links */}
      <section className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-xl md:grid-cols-4">
          {quickLinks.map((q) => (
            <Link
              key={q.to}
              href={q.to}
              className="group relative flex flex-col bg-card p-6 transition-colors hover:bg-primary hover:text-primary-foreground md:p-8"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors group-hover:bg-primary-foreground/10 group-hover:text-primary-foreground">
                <q.icon className="size-5" />
              </span>
              <p className="mt-5 font-serif text-lg font-bold">{t(q.ko, q.en)}</p>
              <p className="mt-1 text-sm text-muted-foreground transition-colors group-hover:text-primary-foreground/70">
                {t(q.dko, q.den)}
              </p>
              <LuArrowUpRight className="absolute top-6 right-6 size-4 opacity-0 transition-all group-hover:opacity-100 md:top-8 md:right-8" />
            </Link>
          ))}
        </div>
      </section>

      <main id="main">
        {/* Welcome */}
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2 md:py-32">
          <div>
            <p className="eyebrow text-muted-foreground">Welcome</p>
            <h2 className="mt-4 text-3xl leading-snug font-bold whitespace-pre-line md:text-[2.75rem] md:leading-tight">
              {t("함께 예배하고, 함께 사랑하며,\n함께 자라가는 교회", "Worship together, love together, grow together")}
            </h2>
            <p className="mt-6 text-[17px] leading-loose text-muted-foreground">
              {t(
                "엘센트로 한인교회는 임페리얼 밸리 지역의 한인 이민자들과 그 가정을 위해 세워진 교회입니다. 복음 안에서 서로를 품고, 다음 세대에 믿음을 전하며, 이 땅에서 그리스도의 사랑을 실천하는 공동체가 되기를 소망합니다.",
                "El Centro Korean Church serves Korean immigrants and their families in the Imperial Valley. We hope to be a community that embraces one another in the Gospel, passes faith to the next generation, and lives out the love of Christ."
              )}
            </p>
            <div className="mt-8 flex items-center gap-4 rounded-xl border bg-card p-4">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary font-serif text-lg font-bold">
                {t("김", "JK")}
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{t("담임목사", "Senior Pastor")}</p>
                <p className="font-serif text-lg font-bold">{t(site.pastorKo, site.pastorEn)}</p>
              </div>
            </div>
            <Button asChild variant="link" className="mt-6 h-auto px-0 text-base">
              <Link href="/about">
                {t("교회소개 더보기", "Learn more about us")} <LuArrowRight />
              </Link>
            </Button>
          </div>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.hero2}
              alt={t("엘센트로 한인교회 예배당 내부", "Inside the El Centro Korean Church sanctuary")}
              loading="lazy"
              width={1920}
              height={1088}
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 left-6 rounded-xl border bg-card/95 p-6 text-card-foreground shadow-xl backdrop-blur md:-left-8">
              <p className="font-serif text-4xl font-bold">9:00</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("주일예배 AM", "Sunday AM")}</p>
            </div>
          </div>
        </section>

        {/* Verse */}
        <section className="bg-ink py-24 text-center text-ink-foreground md:py-28">
          <div className="mx-auto max-w-3xl px-6">
            <LuBookOpen className="mx-auto size-6 text-ink-foreground/50" />
            <p className="mt-6 font-serif text-2xl leading-relaxed text-balance md:text-4xl md:leading-snug">
              {t(
                "“수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라”",
                "“Come to me, all you who are weary and burdened, and I will give you rest.”"
              )}
            </p>
            <p className="mt-8 text-sm tracking-widest text-ink-foreground/60">{t("마태복음 11:28", "Matthew 11:28")}</p>
          </div>
        </section>

        {/* Visit */}
        <section id="visit" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24 md:py-32">
          <SectionHeading eyebrow="Worship & Visit" ko="예배 안내" en="Join Us" center />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <VisitCard icon={LuClock} title={t("주일예배", "Sunday Service")} body={t("매주 일요일 오전 9:00", "Every Sunday, 9:00 AM")} />
            <VisitCard
              icon={LuMapPin}
              title={t("오시는 길", "Location")}
              body={site.address}
              href={site.mapUrl}
              cta={t("길찾기", "Get directions")}
              external
            />
            <VisitCard icon={LuPhone} title={t("문의", "Contact")} body={site.phone} href={`tel:${site.phone}`} cta={t("전화하기", "Call us")} />
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border shadow-sm">
            <iframe
              title={t("교회 위치 지도", "Map to the church")}
              src={site.mapEmbed}
              className="h-96 w-full border-0 grayscale dark:invert dark:hue-rotate-180"
              loading="lazy"
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function VisitCard({
  icon: Icon,
  title,
  body,
  href,
  cta,
  external,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  external?: boolean;
}) {
  const inner = (
    <Card className="group h-full gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="gap-4">
        <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5" />
        </span>
        <CardTitle className="font-serif text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <CardDescription className="text-[15px]">{body}</CardDescription>
        {cta && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium">
            {cta} <LuArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        )}
      </CardContent>
    </Card>
  );
  if (!href) return inner;
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="block h-full rounded-xl">
      {inner}
    </a>
  );
}
