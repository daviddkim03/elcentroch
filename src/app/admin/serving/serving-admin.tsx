"use client";

import { Crud } from "@/components/crud";
import { SlotBadge } from "@/app/my/serving/serving-page";
import { today, useFormat } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Slot } from "@/lib/types";
import { usePeople } from "@/lib/use-people";

export function ServingAdmin() {
  const { t } = useLang();
  const f = useFormat();
  const people = usePeople();
  return (
    <Crud<Slot>
      table="serving_slots"
      title={t("섬김 일정", "Serving schedule")}
      sub={t("담당자를 비우면 누구나 맡을 수 있습니다.", "Leave the person blank so anyone can take it.")}
      order="serve_on"
      empty={t("첫 일정을 만들어 보세요.", "Add the first slot.")}
      fields={[
        { name: "team", ko: "섬김", en: "Team", required: true, max: 80, hint: t("예: 찬양, 주차, 주방", "e.g. worship, parking, kitchen") },
        { name: "serve_on", ko: "날짜", en: "Date", type: "date", required: true, default: today() },
        { name: "member_id", ko: "담당", en: "Person", type: "select", options: people },
      ]}
      prepare={async (v) => ({ ...v, status: "assigned" })}
      row={(s) => (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-32 flex-1">
            <p className="font-medium">{s.team} <span className="font-normal text-muted-foreground">{s.member_name}</span></p>
            <p className="text-sm text-muted-foreground">{f.weekday(s.serve_on)}</p>
          </div>
          <SlotBadge status={s.status} />
        </div>
      )}
    />
  );
}
