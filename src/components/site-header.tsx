"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { nav, site } from "@/lib/site";
import { portalOn } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { LangToggle } from "./lang-toggle";
import { NavLink } from "./nav-link";

export function SiteHeader({ transparent }: { transparent?: boolean }) {
  const { t } = useLang();
  const { userId } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = !!transparent && !scrolled && !open;

  const account = portalOn && {
    href: userId ? "/my" : "/login",
    label: userId ? t("내 교회", "My page") : t("로그인", "Login"),
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        light
          ? "text-ink-foreground"
          : "bg-background/95 text-foreground shadow-sm backdrop-blur"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <NavLink href="/" className="flex flex-col leading-tight">
          <span className="font-serif text-xl font-bold">
            {t(site.nameKo, site.nameEn)}
          </span>
          <span
            className={cn(
              "text-[10px] tracking-[0.25em] uppercase",
              light ? "opacity-80" : "text-muted-foreground"
            )}
          >
            {t(site.nameEn, site.nameKo)}
          </span>
        </NavLink>
        <nav className="hidden items-center gap-7 xl:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              href={n.to}
              className="text-[15px] font-medium transition-colors hover:text-gold"
              activeClassName="text-gold"
            >
              {t(n.ko, n.en)}
            </NavLink>
          ))}
          {account && (
            <NavLink href={account.href} className="text-sm transition-colors hover:text-gold">
              {account.label}
            </NavLink>
          )}
          <LangToggle light={light} />
        </nav>
        <div className="flex items-center gap-3 xl:hidden">
          <LangToggle light={light} />
          <button onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t bg-background px-6 py-4 xl:hidden">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              href={n.to}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium"
            >
              {t(n.ko, n.en)}
            </NavLink>
          ))}
          {account && (
            <NavLink href={account.href} className="block border-t py-3 text-base font-medium">
              {account.label}
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
