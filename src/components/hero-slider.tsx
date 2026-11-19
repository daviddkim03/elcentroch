"use client";

import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useLang } from "@/lib/i18n";
import { defaultSlides } from "@/lib/site";
import { useHeroSlides } from "@/lib/use-hero-slides";
import { cn } from "@/lib/utils";

export function HeroSlider() {
  const { t } = useLang();
  const { data } = useHeroSlides();
  const slides = data && data.length > 0 ? data : defaultSlides;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const cur = index % slides.length;
  const go = (d: number) => setIndex((i) => (i + d + slides.length) % slides.length);
  const s = slides[cur];

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-ink">
      {slides.map((sl, i) => (
        <div
          key={sl.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === cur ? "opacity-100" : "opacity-0"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sl.image_url}
            alt=""
            className={cn("h-full w-full object-cover", i === cur && "animate-kenburns")}
          />
        </div>
      ))}
      <div className="hero-overlay absolute inset-0" />
      <div
        key={cur}
        className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 text-ink-foreground"
      >
        <p className="eyebrow animate-fadeup">El Centro Korean Church</p>
        <h1 className="mt-5 max-w-3xl animate-fadeup text-4xl leading-tight font-bold md:text-6xl">
          {t(s.title_ko ?? "", s.title_en ?? s.title_ko ?? "")}
        </h1>
        <p className="mt-6 max-w-xl animate-fadeup text-lg opacity-90 md:text-xl">
          {t(s.subtitle_ko ?? "", s.subtitle_en ?? s.subtitle_ko ?? "")}
        </p>
      </div>
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-10 mx-auto flex max-w-7xl items-center gap-6 px-6 text-ink-foreground">
          <button onClick={() => go(-1)} aria-label="Previous">
            <LuChevronLeft size={24} />
          </button>
          <div className="flex gap-2">
            {slides.map((sl, i) => (
              <button
                key={sl.id}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-0.5 transition-all",
                  i === cur ? "w-12 bg-gold" : "w-6 bg-ink-foreground/50"
                )}
              />
            ))}
          </div>
          <button onClick={() => go(1)} aria-label="Next">
            <LuChevronRight size={24} />
          </button>
          <span className="ml-auto font-serif text-sm">
            {String(cur + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      )}
    </section>
  );
}
