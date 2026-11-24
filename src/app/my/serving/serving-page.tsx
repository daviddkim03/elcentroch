"use client";

import { DataView, PageTitle } from "@/components/data-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { db, today, useAct, useFormat, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Slot } from "@/lib/types";

export function SlotBadge({ status }: { status: Slot["status"] }) {
  const { t } = useLang();
  if (status === "confirmed") return <Badge tone="good">{t("확정", "Confirmed")}</Badge>;
  if (status === "swap") return <Badge tone="wait">{t("교체 요청", "Needs swap")}</Badge>;
  if (status === "open") return <Badge tone="wait">{t("비어 있음", "Open")}</Badge>;
  return <Badge>{t("배정됨", "Assigned")}</Badge>;
}

export function ServingPage() {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const { member } = useAuth();
  const q = useQuery<Slot[]>(() =>
    db().from("serving_slots").select("*").gte("serve_on", today()).order("serve_on").order("team").limit(200)
  );
  const respond = async (id: string, action: string) => {
    if (await act(db().rpc("serve_respond", { p_slot: id, p_action: action }), "저장했습니다", "Saved")) q.reload();
  };
  return (
    <>
      <PageTitle title={t("섬김 일정", "Serving schedule")} />
      <DataView query={q} empty={t("예정된 섬김이 없습니다.", "Nothing scheduled yet.")}>
        {(d) => (
          <ul className="divide-y border bg-card">
            {d.map((s) => {
              const mine = s.member_id === member!.id;
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
                  <div className="min-w-40 flex-1">
                    <p className="font-medium">
                      {s.team} <span className="font-normal text-muted-foreground">{mine ? t("나", "Me") : s.member_name}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{f.weekday(s.serve_on)}</p>
                  </div>
                  <SlotBadge status={s.status} />
                  {mine && s.status !== "confirmed" && (
                    <Button className="h-11" onClick={() => respond(s.id, "confirm")}>{t("할 수 있어요", "I can do it")}</Button>
                  )}
                  {mine && s.status !== "swap" && (
                    <Button variant="outline" className="h-11" onClick={() => respond(s.id, "swap")}>{t("교체 요청", "Ask to swap")}</Button>
                  )}
                  {!mine && (s.status === "swap" || s.status === "open") && (
                    <Button variant="outline" className="h-11" onClick={() => respond(s.id, "take")}>{t("제가 할게요", "I'll take it")}</Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DataView>
    </>
  );
}
