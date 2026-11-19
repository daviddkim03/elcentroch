"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight, LuChevronLeft, LuChevronRight, LuClock } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { defaultSlides } from "@/lib/site";
import { useHeroSlides } from "@/lib/use-hero-slides";
import { cn } from "@/lib/utils";

export function HeroSlider() {
  const { t } = useLang();
  const { data } = useHeroSlides();
  const slides = data && data.length > 0 ? data : defaultSlides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length, paused, index]);

  const cur = index % slides.length;
  const go = (d: number) => setIndex((i) => (i + d + slides.length) % slides.length);
  const s = slides[cur];

  return (
    <section
      className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((sl, i) => (
        <div
          key={sl.id}
          aria-hidden={i !== cur}
          className={cn("absolute inset-0 transition-opacity duration-1000", i === cur ? "opacity-100" : "opacity-0")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sl.image_url}
            alt=""
            fetchPriority={i === 0 ? "high" : "auto"}
            className={cn("h-full w-full object-cover", i === cur && "animate-kenburns")}
          />
        </div>
      ))}
      <div className="hero-overlay absolute inset-0" />

      <div key={cur} className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 text-white">
        <Badge variant="glass" className="animate-fadeup rounded-full px-3 py-1 text-[11px] tracking-[0.2em] uppercase">
          El Centro Korean Church
        </Badge>
        <h1 className="mt-6 max-w-3xl animate-fadeup text-4xl leading-[1.15] font-bold text-balance md:text-7xl">
          {t(s.title_ko ?? "", s.title_en ?? s.title_ko ?? "")}
        </h1>
        <p className="mt-6 max-w-xl animate-fadeup text-lg text-white/85 md:text-xl">
          {t(s.subtitle_ko ?? "", s.subtitle_en ?? s.subtitle_ko ?? "")}
        </p>
        <div className="mt-10 flex animate-fadeup flex-wrap items-center gap-3">
          <Button asChild size="lg" className="rounded-full bg-white px-7 text-neutral-900 hover:bg-white/90">
            <Link href="#visit">
              {t("방문 계획하기", "Plan your visit")} <LuArrowRight />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-white/40 bg-white/5 px-7 text-white backdrop-blur hover:bg-white/15 hover:text-white"
          >
            <Link href="/about">{t("교회 소개", "About us")}</Link>
          </Button>
          <span className="ml-1 hidden items-center gap-2 text-sm text-white/80 sm:inline-flex">
            <LuClock className="size-4" /> {t("주일예배 오전 9:00", "Sundays 9:00 AM")}
          </span>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-24 mx-auto flex max-w-7xl items-center gap-4 px-6 text-white md:bottom-28">
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/5 backdrop-blur transition hover:bg-white/20"
          >
            <LuChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/5 backdrop-blur transition hover:bg-white/20"
          >
            <LuChevronRight className="size-5" />
          </button>
          <div className="ml-2 flex gap-2">
            {slides.map((sl, i) => (
              <button
                key={sl.id}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === cur}
                className="relative h-1 w-10 cursor-pointer overflow-hidden rounded-full bg-white/30"
              >
                {i === cur && (
                  <span
                    key={`${cur}-${paused}`}
                    className={cn("absolute inset-0 rounded-full bg-white", !paused && "animate-progress")}
                  />
                )}
              </button>
            ))}
          </div>
          <span className="ml-auto font-serif text-sm tabular-nums text-white/80">
            {String(cur + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      )}
    </section>
  );
}
