"use client";

import { Download, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DataView, PageTitle } from "@/components/data-view";
import { RecordForm } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Sheet } from "@/components/ui/sheet";
import { db, today, useAct, useFormat, useQuery, useUndoDelete } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Gift } from "@/lib/types";
import { usePeople } from "@/lib/use-people";

// Quote every cell; a leading = + - @ would run as a formula in Excel.
const cell = (v: unknown) => `"${String(v ?? "").replace(/^([=+\-@\t\r])/, "'$1").replace(/"/g, '""')}"`;

export function GivingAdmin() {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const undoDelete = useUndoDelete();
  const people = usePeople();
  const thisYear = Number(today().slice(0, 4));
  const [year, setYear] = useState(thisYear);
  const [adding, setAdding] = useState(false);
  const q = useQuery<Gift[]>(() => db().rpc("giving_report", { p_year: year }), [year]);
  const total = (q.data ?? []).reduce((s, g) => s + Math.round(Number(g.amount) * 100), 0) / 100;

  const csv = () => {
    const rows = [["date", "name", "fund", "method", "amount"], ...q.data!.map((g) => [g.given_on, g.name, g.fund, g.method, Number(g.amount).toFixed(2)])];
    const url = URL.createObjectURL(new Blob(["﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n")], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `giving-${year}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageTitle
        title={t("헌금", "Giving")}
        sub={q.data && `${year} · ${f.money(total)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <NativeSelect className="w-24" aria-label={t("연도", "Year")} value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {Array.from({ length: 6 }, (_, i) => thisYear - i).map((y) => <option key={y}>{y}</option>)}
            </NativeSelect>
            <Button variant="outline" disabled={!q.data?.length} onClick={csv}><Download /> CSV</Button>
            <Button onClick={() => setAdding(true)}><Plus /> {t("기록", "Record")}</Button>
          </div>
        }
      />
      <DataView query={q} empty={t("이 해의 기록이 없습니다.", "No records for this year.")}>
        {(d) => (
          <ul className="divide-y border bg-card">
            {d.map((g) => (
              <li key={g.id} className="flex items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{g.name}</p>
                  <p className="text-sm text-muted-foreground">{[f.day(g.given_on), g.fund, g.method].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="tabular-nums">{f.money(g.amount)}</span>
                <Button
                  size="icon" variant="ghost" aria-label={t("삭제", "Delete")}
                  onClick={() =>
                    undoDelete(
                      () => q.setData((x) => x?.filter((y) => y.id !== g.id)),
                      q.reload,
                      () => db().rpc("delete_giving", { p_id: g.id })
                    )
                  }
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DataView>
      <Sheet open={adding} onOpenChange={setAdding} title={t("헌금 기록", "Record giving")}>
        <RecordForm
          fields={[
            { name: "member_id", ko: "이름", en: "Name", type: "select", required: true, options: [{ value: "", label: "-" }, ...people] },
            { name: "given_on", ko: "날짜", en: "Date", type: "date", required: true, default: today(), half: true },
            { name: "amount", ko: "금액 (USD)", en: "Amount (USD)", type: "money", required: true, half: true },
            { name: "fund", ko: "종류", en: "Fund", required: true, max: 80, default: "주일헌금", half: true },
            { name: "method", ko: "방법", en: "Method", max: 40, half: true },
          ]}
          onSubmit={async (v) => {
            if (await act(db().from("giving").insert(v), "저장했습니다", "Saved")) {
              setAdding(false);
              q.reload();
            }
          }}
        />
      </Sheet>
    </>
  );
}
