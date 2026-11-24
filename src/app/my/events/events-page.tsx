"use client";

import { useState } from "react";
import { Card, DataView, PageTitle } from "@/components/data-view";
import { RecordForm } from "@/components/record-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { db, useAct, useFormat, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { ChurchEvent, Rsvp } from "@/lib/types";

export function EventsPage() {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const { member } = useAuth();
  const me = member!.id;
  const [editing, setEditing] = useState<ChurchEvent | null>(null);
  const events = useQuery<ChurchEvent[]>(() =>
    db().from("events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at").limit(100)
  );
  const mine = useQuery<Rsvp[]>(() => db().from("event_rsvps").select("*").eq("member_id", me));
  const counts = useQuery<{ event_id: string; people: number }[]>(() => db().rpc("event_counts"));
  const reload = () => {
    mine.reload();
    counts.reload();
  };
  const myRsvp = (id: string) => mine.data?.find((r) => r.event_id === id);

  return (
    <>
      <PageTitle title={t("행사", "Events")} />
      <DataView query={events} empty={t("예정된 행사가 없습니다.", "No upcoming events.")} rowClass="h-40">
        {(d) => (
          <div className="space-y-4">
            {d.map((e) => {
              const r = myRsvp(e.id);
              const going = Number(counts.data?.find((c) => c.event_id === e.id)?.people ?? 0);
              const full = e.capacity !== null && going >= e.capacity;
              const details = t(e.details_ko ?? "", e.details_en ?? e.details_ko ?? "");
              return (
                <Card key={e.id}>
                  <p className="text-sm text-muted-foreground">{f.time(e.starts_at)}</p>
                  <h2 className="mt-1 text-lg font-bold">{t(e.title_ko, e.title_en ?? e.title_ko)}</h2>
                  {e.location && <p className="mt-1 text-sm text-muted-foreground">{e.location}</p>}
                  {details && <p className="mt-3 leading-relaxed break-words whitespace-pre-line">{details}</p>}
                  {e.rsvp && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {r ? (
                        <>
                          <Badge tone="good">{t(`참석 ${r.people}명`, `Going: ${r.people}`)}</Badge>
                          <Button variant="outline" className="h-11" onClick={() => setEditing(e)}>
                            {t("변경", "Change")}
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-11"
                            onClick={async () => {
                              if (await act(db().from("event_rsvps").delete().match({ event_id: e.id, member_id: me }), "취소했습니다", "Cancelled")) reload();
                            }}
                          >
                            {t("참석 취소", "Cancel")}
                          </Button>
                        </>
                      ) : (
                        <Button className="h-11" disabled={full || !mine.data} onClick={() => setEditing(e)}>
                          {full ? t("마감", "Full") : t("참석 신청", "I'm coming")}
                        </Button>
                      )}
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {e.capacity ? `${going} / ${e.capacity}` : t(`${going}명 참석`, `${going} going`)}
                      </span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </DataView>
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={t("참석 신청", "Sign up")}>
        {editing && (
          <RecordForm
            fields={[
              { name: "people", ko: "인원 (본인 포함)", en: "How many, including you", type: "number", required: true, default: 1 },
              { name: "note", ko: "메모 (차량 필요 등)", en: "Note (need a ride, allergies...)", type: "textarea", max: 500 },
            ]}
            values={myRsvp(editing.id)}
            onSubmit={async (v) => {
              if (await act(db().from("event_rsvps").upsert({ ...v, event_id: editing.id, member_id: me }), "신청했습니다", "You're signed up")) {
                setEditing(null);
                reload();
              }
            }}
          />
        )}
      </Sheet>
    </>
  );
}
