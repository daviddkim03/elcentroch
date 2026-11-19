"use client";

import Link from "next/link";
import {
  LuArrowRight,
  LuBookOpen,
  LuClock,
  LuHeart,
  LuMapPin,
  LuPhone,
  LuSprout,
  LuUsers,
} from "react-icons/lu";
import { HeroSlider } from "@/components/hero-slider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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

      <section className="relative z-10 mx-auto -mt-16 grid max-w-7xl grid-cols-2 bg-card shadow-xl md:grid-cols-4">
        {quickLinks.map((q) => (
          <Link
            key={q.to}
            href={q.to}
            className="group border-r border-b p-8 transition-colors last:border-r-0 hover:bg-primary hover:text-primary-foreground md:border-b-0"
          >
            <q.icon className="h-7 w-7 text-gold" />
            <p className="mt-4 font-serif text-lg font-bold">{t(q.ko, q.en)}</p>
            <p className="mt-1 text-sm opacity-70">{t(q.dko, q.den)}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-28 md:grid-cols-2">
        <div>
          <p className="eyebrow">Welcome</p>
          <h2 className="mt-4 text-3xl leading-snug font-bold whitespace-pre-line md:text-4xl">
            {t("함께 예배하고, 함께 사랑하며,\n함께 자라가는 교회", "Worship together, love together, grow together")}
          </h2>
          <p className="mt-6 leading-loose text-muted-foreground">
            {t(
              "엘센트로 한인교회는 임페리얼 밸리 지역의 한인 이민자들과 그 가정을 위해 세워진 교회입니다. 복음 안에서 서로를 품고, 다음 세대에 믿음을 전하며, 이 땅에서 그리스도의 사랑을 실천하는 공동체가 되기를 소망합니다.",
              "El Centro Korean Church serves Korean immigrants and their families in the Imperial Valley. We hope to be a community that embraces one another in the Gospel, passes faith to the next generation, and lives out the love of Christ."
            )}
          </p>
          <p className="mt-8 font-serif text-lg">
            {t("담임목사", "Senior Pastor")}{" "}
            <span className="font-bold">{t(site.pastorKo, site.pastorEn)}</span>
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 border-b-2 border-gold pb-1 font-medium"
          >
            {t("교회소개 더보기", "Learn more")} <LuArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.hero2}
            alt=""
            loading="lazy"
            width={1920}
            height={1088}
            className="aspect-[4/5] w-full object-cover shadow-2xl"
          />
          <div className="absolute -bottom-8 -left-8 hidden bg-gold p-8 text-accent-foreground md:block">
            <p className="font-serif text-4xl font-bold">9:00</p>
            <p className="text-sm">{t("주일예배 AM", "Sunday AM")}</p>
          </div>
        </div>
      </section>

      <section className="bg-ink py-24 text-center text-ink-foreground">
        <div className="mx-auto max-w-3xl px-6">
          <p className="font-serif text-2xl leading-relaxed md:text-3xl">
            {t(
              "“수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라”",
              "“Come to me, all you who are weary and burdened, and I will give you rest.”"
            )}
          </p>
          <p className="mt-6 text-sm tracking-widest text-gold">{t("마태복음 11:28", "Matthew 11:28")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="text-center">
          <p className="eyebrow">Worship &amp; Visit</p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">{t("예배 안내", "Join Us")}</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <div className="border-t-2 border-gold bg-card p-10 shadow-sm">
            <LuClock className="h-8 w-8 text-gold" />
            <h3 className="mt-5 text-xl font-bold">{t("주일예배", "Sunday Service")}</h3>
            <p className="mt-2 text-muted-foreground">{t("매주 일요일 오전 9:00", "Every Sunday, 9:00 AM")}</p>
          </div>
          <a
            href={site.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="border-t-2 border-gold bg-card p-10 shadow-sm transition-shadow hover:shadow-lg"
          >
            <LuMapPin className="h-8 w-8 text-gold" />
            <h3 className="mt-5 text-xl font-bold">{t("오시는 길", "Location")}</h3>
            <p className="mt-2 text-muted-foreground">{site.address}</p>
          </a>
          <a
            href={`tel:${site.phone}`}
            className="border-t-2 border-gold bg-card p-10 shadow-sm transition-shadow hover:shadow-lg"
          >
            <LuPhone className="h-8 w-8 text-gold" />
            <h3 className="mt-5 text-xl font-bold">{t("문의", "Contact")}</h3>
            <p className="mt-2 text-muted-foreground">{site.phone}</p>
          </a>
        </div>
        <div className="mt-10 overflow-hidden shadow-sm">
          <iframe title="map" src={site.mapEmbed} className="h-96 w-full border-0" loading="lazy" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
