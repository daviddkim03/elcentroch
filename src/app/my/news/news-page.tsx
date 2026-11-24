"use client";

import { AnnouncementCard } from "@/components/announcement-card";
import { DataView, PageTitle } from "@/components/data-view";
import { db, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Announcement } from "@/lib/types";

export function NewsPage() {
  const { t } = useLang();
  const q = useQuery<Announcement[]>(() =>
    db().from("announcements").select("*").order("pinned", { ascending: false }).order("published_on", { ascending: false }).limit(100)
  );
  return (
    <>
      <PageTitle title={t("소식과 주보", "News & bulletins")} />
      <DataView query={q} empty={t("아직 소식이 없습니다.", "No news yet.")} rowClass="h-32">
        {(d) => <div className="space-y-4">{d.map((a) => <AnnouncementCard key={a.id} a={a} />)}</div>}
      </DataView>
    </>
  );
}
