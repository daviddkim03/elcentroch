"use client";

import { useState } from "react";
import { DataView, PageTitle } from "@/components/data-view";
import { Input } from "@/components/ui/input";
import { db, today, useAct, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Member } from "@/lib/types";

export function AttendancePage() {
  const { t } = useLang();
  const act = useAct();
  const [date, setDate] = useState(today());
  const [find, setFind] = useState("");
  const people = useQuery<Pick<Member, "id" | "name_ko" | "name_en">[]>(() =>
    db().from("members").select("id, name_ko, name_en").eq("status", "active").order("name_ko")
  );
  const here = useQuery<{ member_id: string }[]>(() => db().from("attendance").select("member_id").eq("service_on", date), [date]);
  const present = new Set(here.data?.map((r) => r.member_id));

  const toggle = async (id: string) => {
    const on = !present.has(id);
    const set = (v: boolean) =>
      here.setData((d) => [...(d ?? []).filter((r) => r.member_id !== id), ...(v ? [{ member_id: id }] : [])]);
    set(on);
    const row = { service_on: date, member_id: id };
    if (!(await act(on ? db().from("attendance").insert(row) : db().from("attendance").delete().match(row)))) set(!on);
  };

  const needle = find.trim().toLowerCase();
  const q = {
    data: people.data && here.data && people.data.filter((m) => `${m.name_ko} ${m.name_en ?? ""}`.toLowerCase().includes(needle)),
    error: people.error || here.error,
    reload: () => {
      people.reload();
      here.reload();
    },
  };
  return (
    <>
      <PageTitle title={t("출석", "Attendance")} sub={here.data && t(`${present.size}명 출석`, `${present.size} present`)} />
      <div className="mb-4 grid gap-3 sm:grid-cols-[auto_1fr]">
        <Input type="date" className="sm:w-44" aria-label={t("예배 날짜", "Service date")} value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <Input type="search" aria-label={t("이름 찾기", "Find a name")} placeholder={t("이름 찾기", "Find a name")} value={find} onChange={(e) => setFind(e.target.value)} />
      </div>
      <DataView query={q} rows={6} rowClass="h-12" empty={t("해당하는 교인이 없습니다.", "No one matches.")}>
        {(d) => (
          <ul className="grid border-t border-l bg-card sm:grid-cols-2 xl:grid-cols-3">
            {d.map((m) => (
              <li key={m.id} className="border-r border-b">
                <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 hover:bg-secondary/50">
                  <input type="checkbox" className="size-4 accent-primary" checked={present.has(m.id)} onChange={() => toggle(m.id)} />
                  {t(m.name_ko, m.name_en ?? m.name_ko)}
                </label>
              </li>
            ))}
          </ul>
        )}
      </DataView>
    </>
  );
}
