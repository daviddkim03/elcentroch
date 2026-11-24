"use client";

import { useState } from "react";
import { Crud } from "@/components/crud";
import { DataView } from "@/components/data-view";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { db, useFormat, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { ChurchEvent, Rsvp } from "@/lib/types";

export function EventsAdmin() {
  const { t } = useLang();
  const f = useFormat();
  const [list, setList] = useState<ChurchEvent | null>(null);
  return (
    <>
      <Crud<ChurchEvent>
        table="events"
        title={t("행사", "Events")}
        order="starts_at"
        empty={t("첫 행사를 등록해 보세요.", "Add the first event.")}
        fields={[
          { name: "title_ko", ko: "제목", en: "Title (Korean)", required: true },
          { name: "title_en", ko: "영어 제목", en: "Title (English)" },
          { name: "starts_at", ko: "시작", en: "Starts", type: "datetime", required: true, half: true },
          { name: "location", ko: "장소", en: "Location", half: true },
          { name: "details_ko", ko: "설명", en: "Details (Korean)", type: "textarea", max: 5000 },
          { name: "details_en", ko: "영어 설명", en: "Details (English)", type: "textarea", max: 5000 },
          { name: "is_public", ko: "홈페이지에 공개", en: "Show on the public site", type: "checkbox", default: true },
          { name: "rsvp", ko: "참석 신청 받기", en: "Take sign-ups", type: "checkbox" },
          { name: "capacity", ko: "정원 (비우면 제한 없음)", en: "Capacity (blank for no limit)", type: "number" },
        ]}
        row={(e) => (
          <>
            <p className="truncate font-medium">{t(e.title_ko, e.title_en ?? e.title_ko)}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {f.time(e.starts_at)}
              {!e.is_public && <Badge>{t("교인만", "Members only")}</Badge>}
              {e.rsvp && (
                <button className="underline underline-offset-4 hover:text-foreground" onClick={() => setList(e)}>
                  {t("신청 명단", "Sign-ups")}
                </button>
              )}
            </p>
          </>
        )}
      />
      <Sheet open={!!list} onOpenChange={(o) => !o && setList(null)} title={t("신청 명단", "Sign-ups")}>
        {list && <SignUps event={list} />}
      </Sheet>
    </>
  );
}

function SignUps({ event }: { event: ChurchEvent }) {
  const { t } = useLang();
  const q = useQuery<Rsvp[]>(() => db().from("event_rsvps").select("*").eq("event_id", event.id).order("created_at"));
  return (
    <DataView query={q} empty={t("아직 신청이 없습니다.", "No sign-ups yet.")}>
      {(d) => (
        <>
          <p className="mb-4 text-sm text-muted-foreground">{t(`모두 ${d.reduce((s, r) => s + r.people, 0)}명`, `${d.reduce((s, r) => s + r.people, 0)} people`)}</p>
          <ul className="divide-y border bg-card">
            {d.map((r) => (
              <li key={r.member_id} className="px-5 py-3">
                <p className="flex justify-between gap-4"><span className="font-medium">{r.member_name}</span><span className="tabular-nums">{r.people}</span></p>
                {r.note && <p className="text-sm text-muted-foreground">{r.note}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </DataView>
  );
}
