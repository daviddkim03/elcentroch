"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LuArrowRight, LuMapPin, LuMenu, LuMoon, LuPhone, LuSun } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLang } from "@/lib/i18n";
import { nav, site } from "@/lib/site";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

function LangToggle({ light }: { light: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "flex items-center rounded-full border p-0.5 text-xs font-medium",
        light ? "border-white/30 bg-white/10 backdrop-blur" : "border-border bg-muted"
      )}
    >
      {(["ko", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "cursor-pointer rounded-full px-3 py-1 transition-colors",
            lang === l
              ? light
                ? "bg-white text-neutral-900"
                : "bg-background text-foreground shadow-sm"
              : light
                ? "text-white/80 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l === "ko" ? "한국어" : "EN"}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle({ light }: { light: boolean }) {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("rounded-full", light && "text-white hover:bg-white/15 hover:text-white")}
    >
      {theme === "dark" ? <LuSun /> : <LuMoon />}
    </Button>
  );
}

export function SiteHeader({ transparent }: { transparent?: boolean }) {
  const { t } = useLang();
  const pathname = usePathname()?.replace(/\/$/, "") || "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = !!transparent && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        light ? "text-white" : "border-b bg-background/80 text-foreground backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
      )}
    >
      <div className={cn("mx-auto flex max-w-7xl items-center justify-between px-6 transition-all", light ? "h-20" : "h-16")}>
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-serif text-lg font-bold md:text-xl">{t(site.nameKo, site.nameEn)}</span>
          <span className={cn("text-[10px] tracking-[0.25em] uppercase", light ? "text-white/75" : "text-muted-foreground")}>
            {t(site.nameEn, site.nameKo)}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                href={n.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-[15px] font-medium transition-colors",
                  light
                    ? active
                      ? "bg-white/15 text-white"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                    : active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {t(n.ko, n.en)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LangToggle light={light} />
          </div>
          <ThemeToggle light={light} />
          <Button
            asChild
            size="sm"
            className={cn("hidden rounded-full lg:inline-flex", light && "bg-white text-neutral-900 hover:bg-white/90")}
          >
            <Link href="/#visit">
              {t("방문하기", "Plan a visit")} <LuArrowRight />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
                className={cn("rounded-full lg:hidden", light && "text-white hover:bg-white/15 hover:text-white")}
              >
                <LuMenu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="gap-0">
              <SheetHeader className="border-b">
                <SheetTitle className="font-serif text-lg">{t(site.nameKo, site.nameEn)}</SheetTitle>
                <SheetDescription>{t(site.nameEn, site.nameKo)}</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col p-3" aria-label="Mobile">
                <SheetClose asChild>
                  <Link href="/" className={cn("rounded-lg px-3 py-3 text-base font-medium hover:bg-accent", pathname === "/" && "bg-accent")}>
                    {t("홈", "Home")}
                  </Link>
                </SheetClose>
                {nav.map((n) => (
                  <SheetClose asChild key={n.to}>
                    <Link
                      href={n.to}
                      aria-current={pathname === n.to ? "page" : undefined}
                      className={cn("rounded-lg px-3 py-3 text-base font-medium hover:bg-accent", pathname === n.to && "bg-accent")}
                    >
                      {t(n.ko, n.en)}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto space-y-4 border-t p-6">
                <div className="sm:hidden">
                  <LangToggle light={false} />
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <a href={site.mapUrl} target="_blank" rel="noreferrer" className="flex gap-2 hover:text-foreground">
                    <LuMapPin className="mt-0.5 size-4 shrink-0" /> {site.address}
                  </a>
                  <a href={`tel:${site.phone}`} className="flex gap-2 hover:text-foreground">
                    <LuPhone className="mt-0.5 size-4 shrink-0" /> {site.phone}
                  </a>
                </div>
                <SheetClose asChild>
                  <Button asChild className="w-full rounded-full">
                    <Link href="/#visit">
                      {t("방문하기", "Plan a visit")} <LuArrowRight />
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
