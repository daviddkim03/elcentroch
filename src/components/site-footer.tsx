"use client";

import { MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { nav, site } from "@/lib/site";
import { NavLink } from "./nav-link";

// The HTML is pre-rendered at build time, so the year baked into it is the build
// year. Show the visitor's current year once the page is running in the browser.
function CurrentYear() {
  const [year, setYear] = useState<number>();
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <span suppressHydrationWarning>{year ?? new Date().getFullYear()}</span>;
}

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl font-bold">{t(site.nameKo, site.nameEn)}</p>
          <p className="mt-2 text-sm opacity-70">{t(site.nameEn, site.nameKo)}</p>
        </div>
        <div className="space-y-3 text-sm opacity-90">
          <p className="flex gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-gold" />
            {site.address}
          </p>
          <p className="flex gap-2">
            <Phone className="h-4 w-4 shrink-0 text-gold" />
            <a href={`tel:${site.phone}`}>{site.phone}</a>
          </p>
          <p>
            {t("담임목사", "Senior Pastor")}: {t(site.pastorKo, site.pastorEn)}
          </p>
        </div>
        <div className="space-y-2 text-sm">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              href={n.to}
              className="block opacity-80 hover:text-gold hover:opacity-100"
            >
              {t(n.ko, n.en)}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="border-t border-ink-foreground/10 py-6 text-center text-xs opacity-60">
        © <CurrentYear /> {site.nameEn}. All rights reserved. ·{" "}
        <NavLink href="/admin" className="hover:text-gold">
          Admin
        </NavLink>
      </div>
    </footer>
  );
}
