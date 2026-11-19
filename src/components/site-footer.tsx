"use client";

import Link from "next/link";
import { LuArrowUp, LuClock, LuMapPin, LuPhone, LuUser } from "react-icons/lu";
import { useLang } from "@/lib/i18n";
import { nav, site } from "@/lib/site";

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1.2fr_1fr]">
        <div>
          <p className="font-serif text-2xl font-bold">{t(site.nameKo, site.nameEn)}</p>
          <p className="mt-2 text-sm text-ink-foreground/60">{t(site.nameEn, site.nameKo)}</p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-foreground/70">
            {t(
              "임페리얼 밸리의 한인 이민자 가정을 섬기는 교회입니다.",
              "A church serving Korean immigrant families in the Imperial Valley."
            )}
          </p>
        </div>
        <div>
          <p className="eyebrow text-ink-foreground/50">{t("연락처", "Contact")}</p>
          <ul className="mt-4 space-y-3 text-sm text-ink-foreground/85">
            <li>
              <a href={site.mapUrl} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-white">
                <LuMapPin className="mt-0.5 size-4 shrink-0 text-ink-foreground/50" />
                {site.address}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone}`} className="flex gap-3 hover:text-white">
                <LuPhone className="mt-0.5 size-4 shrink-0 text-ink-foreground/50" />
                {site.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <LuClock className="mt-0.5 size-4 shrink-0 text-ink-foreground/50" />
              {t("주일예배 · 일요일 오전 9:00", "Sunday Service · 9:00 AM")}
            </li>
            <li className="flex gap-3">
              <LuUser className="mt-0.5 size-4 shrink-0 text-ink-foreground/50" />
              {t("담임목사", "Senior Pastor")}: {t(site.pastorKo, site.pastorEn)}
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-ink-foreground/50">{t("바로가기", "Explore")}</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.to}>
                <Link href={n.to} className="text-ink-foreground/75 transition-colors hover:text-white">
                  {t(n.ko, n.en)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-ink-foreground/55 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.nameEn}. All rights reserved. ·{" "}
            <Link href="/admin" className="hover:text-white">
              Admin
            </Link>
          </p>
          <a href="#top" className="inline-flex items-center gap-1.5 hover:text-white">
            {t("맨 위로", "Back to top")} <LuArrowUp className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
