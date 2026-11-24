"use client";

import { Card, DataView, PageTitle } from "@/components/data-view";
import { Button } from "@/components/ui/button";
import { db, useAct, useFormat, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Visit } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VisitsAdmin() {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const q = useQuery<Visit[]>(() => db().from("visits").select("*").order("handled").order("created_at", { ascending: false }).limit(200));
  return (
    <>
      <PageTitle title={t("방문 문의", "Visitors")} sub={t("홈페이지의 '처음 오신 분' 양식으로 들어온 글입니다.", "Messages from the Plan a Visit form.")} />
      <DataView query={q} empty={t("아직 문의가 없습니다.", "No messages yet.")}>
        {(d) => (
          <div className="space-y-4">
            {d.map((v) => (
              <Card key={v.id} className={cn(v.handled && "opacity-60")}>
                <p><span className="font-medium">{v.name}</span> <span className="text-sm text-muted-foreground">{v.contact} · {f.stamp(v.created_at)}</span></p>
                {v.message && <p className="mt-2 break-words whitespace-pre-line">{v.message}</p>}
                <Button
                  variant="outline" size="sm" className="mt-4"
                  onClick={async () => {
                    if (await act(db().from("visits").update({ handled: !v.handled }).eq("id", v.id))) q.reload();
                  }}
                >
                  {v.handled ? t("다시 열기", "Reopen") : t("연락했음", "Contacted")}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </DataView>
    </>
  );
}
