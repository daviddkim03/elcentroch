"use client";

import Link from "next/link";
import { LuMapPin, LuPhone } from "react-icons/lu";
import { useLang } from "@/lib/i18n";
import { nav, site } from "@/lib/site";

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
            <LuMapPin className="h-4 w-4 shrink-0 text-gold" />
            {site.address}
          </p>
          <p className="flex gap-2">
            <LuPhone className="h-4 w-4 shrink-0 text-gold" />
            <a href={`tel:${site.phone}`}>{site.phone}</a>
          </p>
          <p>
            {t("담임목사", "Senior Pastor")}: {t(site.pastorKo, site.pastorEn)}
          </p>
        </div>
        <div className="space-y-2 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              href={n.to}
              className="block opacity-80 hover:text-gold hover:opacity-100"
            >
              {t(n.ko, n.en)}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-ink-foreground/10 py-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} {site.nameEn}. All rights reserved. ·{" "}
        <Link href="/admin" className="hover:text-gold">
          Admin
        </Link>
      </div>
    </footer>
  );
}
