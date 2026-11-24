"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import { DataView, PageTitle } from "@/components/data-view";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { useAuth } from "@/lib/auth";
import { db, today, useFormat, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { site } from "@/lib/site";
import type { Gift } from "@/lib/types";

export function GivingPage() {
  const { t } = useLang();
  const f = useFormat();
  const { member } = useAuth();
  const thisYear = Number(today().slice(0, 4));
  const [year, setYear] = useState(thisYear);
  const q = useQuery<Gift[]>(
    () =>
      db()
        .from("giving")
        .select("*")
        .eq("member_id", member!.id)
        .gte("given_on", `${year}-01-01`)
        .lte("given_on", `${year}-12-31`)
        .order("given_on"),
    [year]
  );
  const total = q.data?.reduce((s, g) => s + Math.round(Number(g.amount) * 100), 0) ?? 0;
  return (
    <>
      <div className="hidden print:block">
        <p className="font-serif text-xl font-bold">{site.nameKo} {site.nameEn}</p>
        <p>{site.address} · {site.phone}</p>
        <p className="my-6">{member!.name_ko} {member!.name_en} · {year}</p>
      </div>
      <PageTitle
        title={t("헌금 기록", "Giving record")}
        action={
          <div className="flex gap-2 print:hidden">
            <NativeSelect className="h-11 w-28" aria-label={t("연도", "Year")} value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {Array.from({ length: 6 }, (_, i) => thisYear - i).map((y) => <option key={y}>{y}</option>)}
            </NativeSelect>
            <Button variant="outline" className="h-11" disabled={!q.data?.length} onClick={() => window.print()}>
              <Printer /> {t("인쇄 / PDF", "Print / PDF")}
            </Button>
          </div>
        }
      />
      <DataView query={q} empty={t("이 해의 기록이 없습니다.", "No records for this year.")}>
        {(d) => (
          <table className="w-full border bg-card text-left">
            <thead className="border-b text-sm text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">{t("날짜", "Date")}</th>
                <th className="px-5 py-3 font-medium">{t("종류", "Fund")}</th>
                <th className="px-5 py-3 text-right font-medium">{t("금액", "Amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {d.map((g) => (
                <tr key={g.id}>
                  <td className="px-5 py-3">{f.day(g.given_on)}</td>
                  <td className="px-5 py-3">{g.fund}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{f.money(g.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t font-bold">
              <tr>
                <td className="px-5 py-3" colSpan={2}>{t("합계", "Total")}</td>
                <td className="px-5 py-3 text-right tabular-nums">{f.money(total / 100)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </DataView>
    </>
  );
}
