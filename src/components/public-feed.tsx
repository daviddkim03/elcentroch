"use client";

import { db, useFormat, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { portalOn } from "@/lib/supabase";
import type { Announcement, ChurchEvent, Sermon } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DataView } from "./data-view";

// Visitors see these sections only when there is something in them.

export function PublicEvents({ home }: { home?: boolean }) {
  const { t } = useLang();
  const f = useFormat();
  const q = useQuery<ChurchEvent[]>(
    () => db().from("events").select("*").eq("is_public", true).gte("starts_at", new Date().toISOString()).order("starts_at").limit(home ? 3 : 12),
    [],
    portalOn
  );
  if (!q.data?.length) return null;
  return (
    <section className={cn(home ? "mx-auto max-w-5xl px-6 py-28" : "mt-20")}>
      <div className={cn(home && "text-center")}>
        <p className="eyebrow">Events</p>
        <h2 className="mt-4 text-3xl font-bold">{t("다가오는 행사", "Coming Up")}</h2>
      </div>
      <ul className="mt-10 divide-y border-y">
        {q.data.map((e) => (
          <li key={e.id} className="grid gap-2 py-6 sm:grid-cols-[13rem_1fr] sm:gap-8">
            <p className="text-muted-foreground">{f.time(e.starts_at)}</p>
            <div className="min-w-0">
              <h3 className="text-xl font-bold">{t(e.title_ko, e.title_en ?? e.title_ko)}</h3>
              {e.location && <p className="mt-1 text-sm text-muted-foreground">{e.location}</p>}
              {e.details_ko && <p className="mt-3 leading-relaxed whitespace-pre-line text-muted-foreground">{t(e.details_ko, e.details_en ?? e.details_ko)}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PublicNews() {
  const { t } = useLang();
  const f = useFormat();
  const q = useQuery<Announcement[]>(
    () => db().from("announcements").select("*").eq("is_public", true).order("published_on", { ascending: false }).limit(10),
    [],
    portalOn
  );
  if (!q.data?.length) return null;
  return (
    <section className="mt-20">
      <p className="eyebrow">News</p>
      <h2 className="mt-4 text-3xl font-bold">{t("교회 소식", "Church News")}</h2>
      <ul className="mt-10 divide-y border-y">
        {q.data.map((a) => (
          <li key={a.id} className="py-6">
            <p className="text-sm text-muted-foreground">{f.day(a.published_on)}</p>
            <h3 className="mt-1 text-xl font-bold">{t(a.title_ko, a.title_en ?? a.title_ko)}</h3>
            {a.body_ko && <p className="mt-3 leading-relaxed whitespace-pre-line text-muted-foreground">{t(a.body_ko, a.body_en ?? a.body_ko)}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SermonArchive() {
  const { t } = useLang();
  const f = useFormat();
  const q = useQuery<Sermon[]>(() => db().from("sermons").select("*").order("preached_on", { ascending: false }).limit(200), [], portalOn);
  if (!portalOn) return null;
  return (
    <section className="mt-16">
      <h2 className="mb-8 text-3xl font-bold">{t("지난 설교", "Sermon Archive")}</h2>
      <DataView query={q} empty={t("곧 설교를 올리겠습니다.", "Sermons will be listed here soon.")}>
        {(d) => (
          <ul className="divide-y border-y">
            {d.map((s) => {
              const body = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-xl font-bold">{t(s.title_ko, s.title_en ?? s.title_ko)}</span>
                    <span className="mt-1 block text-muted-foreground">{[s.scripture, s.preacher].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="shrink-0 text-sm text-muted-foreground">{f.day(s.preached_on)}</span>
                </>
              );
              const cls = "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-6";
              return (
                <li key={s.id}>
                  {s.youtube_id ? (
                    <a className={cn(cls, "hover:text-gold")} href={`https://www.youtube.com/watch?v=${s.youtube_id}`} target="_blank" rel="noreferrer">
                      {body}
                    </a>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DataView>
    </section>
  );
}
