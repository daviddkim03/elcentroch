import { ArrowRight, BookOpen, Clock, Heart, MapPin, Phone, Sprout, Users } from "lucide-react";
import Link from "next/link";
import { SiYoutube } from "react-icons/si";
import { PublicEvents } from "@/components/public-feed";
import { HeroSlider } from "@/components/hero-slider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { T } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { images, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "엘센트로 한인교회 | El Centro Korean Church",
  description: "캘리포니아 엘센트로 한인교회. 주일예배 일요일 오전 9시, 담임 김요셉 목사.",
  ogDescription: "Korean-American church in El Centro, CA. Sunday service 9:00 AM.",
});

const quickLinks = [
  { to: "/about", icon: Heart, ko: "교회소개", en: "About Us", dko: "우리 교회를 소개합니다", den: "Get to know our church" },
  { to: "/worship", icon: BookOpen, ko: "예배와 말씀", en: "Worship & Word", dko: "예배 시간과 설교", den: "Service times & sermons" },
  { to: "/ministry", icon: Users, ko: "사역", en: "Ministries", dko: "섬김과 선교의 자리", den: "Serving and mission" },
  { to: "/next-generation", icon: Sprout, ko: "다음세대", en: "Next Generation", dko: "자녀와 청소년 사역", den: "Children & youth" },
];

export default function Home() {
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
            <p className="mt-4 font-serif text-lg font-bold">
              <T ko={q.ko} en={q.en} />
            </p>
            <p className="mt-1 text-sm opacity-70">
              <T ko={q.dko} en={q.den} />
            </p>
          </Link>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-28 md:grid-cols-2">
        <div>
          <p className="eyebrow">Welcome</p>
          <h2 className="mt-4 text-3xl leading-snug font-bold whitespace-pre-line md:text-4xl">
            <T
              ko={"함께 예배하고, 함께 사랑하며,\n함께 자라가는 교회"}
              en="Worship together, love together, grow together"
            />
          </h2>
          <p className="mt-6 leading-loose text-muted-foreground">
            <T
              ko="엘센트로 한인교회는 임페리얼 밸리 지역의 한인 이민자들과 그 가정을 위해 세워진 교회입니다. 복음 안에서 서로를 품고, 다음 세대에 믿음을 전하며, 이 땅에서 그리스도의 사랑을 실천하는 공동체가 되기를 소망합니다."
              en="El Centro Korean Church serves Korean immigrants and their families in the Imperial Valley. We hope to be a community that embraces one another in the Gospel, passes faith to the next generation, and lives out the love of Christ."
            />
          </p>
          <p className="mt-8 font-serif text-lg">
            <T ko="담임목사" en="Senior Pastor" />{" "}
            <span className="font-bold">
              <T ko={site.pastorKo} en={site.pastorEn} />
            </span>
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 border-b-2 border-gold pb-1 font-medium"
          >
            <T ko="교회소개 더보기" en="Learn more" /> <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/visit"
            className="mt-8 ml-8 inline-flex items-center gap-2 border-b-2 border-gold pb-1 font-medium"
          >
            <T ko="처음 오시나요?" en="Plan a visit" /> <ArrowRight className="h-4 w-4" />
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
            <p className="text-sm">
              <T ko="주일예배 AM" en="Sunday AM" />
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink py-24 text-center text-ink-foreground">
        <div className="mx-auto max-w-3xl px-6">
          <p className="font-serif text-2xl leading-relaxed md:text-3xl">
            <T
              ko="“수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라”"
              en="“Come to me, all you who are weary and burdened, and I will give you rest.”"
            />
          </p>
          <p className="mt-6 text-sm tracking-widest text-gold">
            <T ko="마태복음 11:28" en="Matthew 11:28" />
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="text-center">
          <p className="eyebrow">Worship &amp; Visit</p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            <T ko="예배 안내" en="Join Us" />
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <div className="border-t-2 border-gold bg-card p-10 shadow-sm">
            <Clock className="h-8 w-8 text-gold" />
            <h3 className="mt-5 text-xl font-bold">
              <T ko="주일예배" en="Sunday Service" />
            </h3>
            <p className="mt-2 text-muted-foreground">
              <T ko="매주 일요일 오전 9:00" en="Every Sunday, 9:00 AM" />
            </p>
          </div>
          <a
            href={site.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="border-t-2 border-gold bg-card p-10 shadow-sm transition-shadow hover:shadow-lg"
          >
            <MapPin className="h-8 w-8 text-gold" />
            <h3 className="mt-5 text-xl font-bold">
              <T ko="오시는 길" en="Location" />
            </h3>
            <p className="mt-2 text-muted-foreground">{site.address}</p>
          </a>
          <a
            href={`tel:${site.phone}`}
            className="border-t-2 border-gold bg-card p-10 shadow-sm transition-shadow hover:shadow-lg"
          >
            <Phone className="h-8 w-8 text-gold" />
            <h3 className="mt-5 text-xl font-bold">
              <T ko="문의" en="Contact" />
            </h3>
            <p className="mt-2 text-muted-foreground">{site.phone}</p>
          </a>
        </div>
        <div className="mt-10 overflow-hidden shadow-sm">
          <iframe title="map" src={site.mapEmbed} className="h-96 w-full border-0" loading="lazy" />
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <div className="text-center">
            <p className="eyebrow">Sermons</p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              <T ko="최근 설교" en="Latest Sermon" />
            </h2>
          </div>
          <iframe
            title="YouTube"
            src={site.youtubeLatest}
            className="mt-14 aspect-video w-full border-0 bg-ink"
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Link href="/sermons" className="inline-flex items-center gap-2 border-b-2 border-gold pb-1 font-medium">
              <T ko="설교 모두 보기" en="All sermons" /> <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={site.youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium hover:text-gold">
              <SiYoutube aria-hidden className="h-6 w-6 text-[#ff0033]" />
              {site.youtubeHandle}
            </a>
          </div>
        </div>
      </section>

      <PublicEvents home />

      <SiteFooter />
    </div>
  );
}
