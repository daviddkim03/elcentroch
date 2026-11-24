"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { AnnouncementCard } from "@/components/announcement-card";
import { DataView } from "@/components/data-view";
import { useAuth } from "@/lib/auth";
import { db, today, useFormat, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Announcement, ChurchEvent, Slot } from "@/lib/types";

const more = [
  { to: "/my/group", ko: "소그룹", en: "Small group" },
  { to: "/my/serving", ko: "섬김 일정", en: "Serving schedule" },
  { to: "/my/family", ko: "자녀", en: "Children" },
  { to: "/my/giving", ko: "헌금 기록", en: "Giving record" },
];

export function MyHome() {
  const { t } = useLang();
  const { member } = useAuth();
  const f = useFormat();
  const news = useQuery<Announcement[]>(() =>
    db().from("announcements").select("*").order("pinned", { ascending: false }).order("published_on", { ascending: false }).limit(3)
  );
  const events = useQuery<ChurchEvent[]>(() =>
    db().from("events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at").limit(3)
  );
  const serving = useQuery<Slot[]>(() =>
    db().from("serving_slots").select("*").eq("member_id", member!.id).gte("serve_on", today()).order("serve_on").limit(1)
  );
  const next = serving.data?.[0];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold">
          {t(`${member!.name_ko}님, 안녕하세요`, `Hello, ${member!.name_en ?? member!.name_ko}`)}
        </h1>
        {next && (
          <p className="mt-2 text-muted-foreground">
            {t("다음 섬김", "Next serving")}: {next.team}, {f.weekday(next.serve_on)}
          </p>
        )}
      </div>
      <Section title={t("교회 소식", "News")} href="/my/news">
        <DataView query={news} empty={t("아직 소식이 없습니다.", "No news yet.")} rowClass="h-32">
          {(d) => <div className="space-y-4">{d.map((a) => <AnnouncementCard key={a.id} a={a} />)}</div>}
        </DataView>
      </Section>
      <Section title={t("다가오는 행사", "Coming up")} href="/my/events">
        <DataView query={events} empty={t("예정된 행사가 없습니다.", "No upcoming events.")}>
          {(d) => (
            <ul className="divide-y border bg-card">
              {d.map((e) => (
                <li key={e.id} className="px-5 py-4">
                  <p className="font-medium">{t(e.title_ko, e.title_en ?? e.title_ko)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.time(e.starts_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </DataView>
      </Section>
      <ul className="divide-y border bg-card">
        {more.map((m) => (
          <li key={m.to}>
            <Link href={m.to} className="flex min-h-14 items-center justify-between px-5 transition-colors hover:bg-secondary">
              {t(m.ko, m.en)}
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  const { t } = useLang();
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link href={href} className="py-2 text-sm text-muted-foreground hover:text-foreground">
          {t("모두 보기", "See all")}
        </Link>
      </div>
      {children}
    </section>
  );
}
