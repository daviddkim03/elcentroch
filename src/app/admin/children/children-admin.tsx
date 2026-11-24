"use client";

import { useState } from "react";
import { Card, DataView, PageTitle } from "@/components/data-view";
import { RecordForm } from "@/components/record-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { db, today, useAct, useFormat, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { RosterChild } from "@/lib/types";

export function ChildrenAdmin() {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const date = today();
  const [out, setOut] = useState<RosterChild | null>(null);
  const q = useQuery<RosterChild[]>(() => db().rpc("checkin_roster", { p_date: date }));
  return (
    <>
      <PageTitle
        title={t("주일학교 체크인", "Children's check-in")}
        sub={t(`${f.day(date)} · 부모가 등록한 자녀가 보입니다. 열람이 기록됩니다.`, `${f.day(date)} · Children added by parents. Viewing is logged.`)}
      />
      <DataView query={q} empty={t("등록된 어린이가 없습니다. 부모가 '자녀' 화면에서 등록합니다.", "No children yet. Parents add them on their Children page.")} rowClass="h-28">
        {(d) => (
          <div className="grid gap-4 xl:grid-cols-2">
            {d.map((c) => (
              <Card key={c.id}>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-bold">{c.name}</h2>
                  {c.out_at ? <Badge>{t(`귀가: ${c.picked_up_by}`, `Left with ${c.picked_up_by}`)}</Badge> : c.in_at && <Badge tone="good">{t("출석", "Here")}</Badge>}
                </div>
                {c.allergies && <p className="mt-1 text-sm font-medium text-destructive">{t("알레르기", "Allergies")}: {c.allergies}</p>}
                <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div>{t("보호자", "Guardian")}: {c.guardian} {c.guardian_phone && <a href={`tel:${c.guardian_phone}`} className="underline">{c.guardian_phone}</a>}</div>
                  {c.pickup && <div>{t("데려갈 수 있는 사람", "Pickup")}: {c.pickup}</div>}
                  {c.notes && <div>{c.notes}</div>}
                </dl>
                {!c.in_at && (
                  <Button
                    className="mt-4 h-11"
                    onClick={async () => {
                      if (await act(db().rpc("child_check_in", { p_child: c.id, p_date: date }), "체크인했습니다", "Checked in")) q.reload();
                    }}
                  >
                    {t("체크인", "Check in")}
                  </Button>
                )}
                {c.in_at && !c.out_at && (
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Button variant="outline" className="h-11" onClick={() => setOut(c)}>{t("체크아웃", "Check out")}</Button>
                    <span className="text-sm text-muted-foreground">
                      {t("부모 앱에 픽업 코드가 표시됩니다", "The pickup code is on the parent's phone")}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </DataView>
      <Sheet open={!!out} onOpenChange={(o) => !o && setOut(null)} title={t("체크아웃", "Check out")}>
        {out && (
          <RecordForm
            fields={[
              { name: "code", ko: "픽업 코드", en: "Pickup code", required: true, max: 8 },
              { name: "by", ko: "데려가는 사람", en: "Picked up by", required: true, max: 80, hint: out.pickup ?? undefined },
            ]}
            submitLabel={t("체크아웃", "Check out")}
            onSubmit={async (v) => {
              if (await act(db().rpc("child_check_out", { p_child: out.id, p_date: date, p_code: v.code, p_by: v.by }), "체크아웃했습니다", "Checked out")) {
                setOut(null);
                q.reload();
              }
            }}
          />
        )}
      </Sheet>
    </>
  );
}
