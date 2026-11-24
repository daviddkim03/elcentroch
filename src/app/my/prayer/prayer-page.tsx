"use client";

import { Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, DataView, PageTitle } from "@/components/data-view";
import { RecordForm } from "@/components/record-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { db, useAct, useFormat, useQuery, useUndoDelete } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Prayer } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PrayerPage() {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const undoDelete = useUndoDelete();
  const { member, isPastor } = useAuth();
  const [open, setOpen] = useState(false);
  const q = useQuery<Prayer[]>(() =>
    db().from("prayers").select("*, prayer_supports(member_id)").order("created_at", { ascending: false }).limit(100)
  );
  const me = member!.id;
  const who = {
    pastor: t("목사님께만", "Pastor only"),
    group: t("소그룹", "My group"),
    church: t("온 교회", "Whole church"),
  };

  const pray = async (p: Prayer) => {
    const mine = p.prayer_supports.some((s) => s.member_id === me);
    const set = (on: boolean) =>
      q.setData((d) =>
        d?.map((x) =>
          x.id === p.id
            ? { ...x, prayer_supports: [...x.prayer_supports.filter((s) => s.member_id !== me), ...(on ? [{ member_id: me }] : [])] }
            : x
        )
      );
    set(!mine);
    const table = db().from("prayer_supports");
    const ok = await act(
      mine ? table.delete().match({ prayer_id: p.id, member_id: me }) : table.insert({ prayer_id: p.id, member_id: me })
    );
    if (!ok) set(mine);
  };

  return (
    <>
      <PageTitle
        title={t("기도 제목", "Prayer requests")}
        action={<Button className="h-11" onClick={() => setOpen(true)}>{t("기도 부탁하기", "Ask for prayer")}</Button>}
      />
      <DataView query={q} empty={t("아직 기도 제목이 없습니다.", "No prayer requests yet.")} rowClass="h-36">
        {(d) => (
          <div className="space-y-4">
            {d.map((p) => {
              const mine = p.prayer_supports.some((s) => s.member_id === me);
              return (
                <Card key={p.id}>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{p.author_name}</span>
                    <span>{f.stamp(p.created_at)}</span>
                    <Badge>{who[p.visibility]}</Badge>
                    {p.answered && <Badge tone="good">{t("응답됨", "Answered")}</Badge>}
                  </div>
                  <p className="mt-3 leading-relaxed break-words whitespace-pre-line">{p.body}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button variant="outline" className="h-11" aria-pressed={mine} onClick={() => pray(p)}>
                      <Heart className={cn(mine && "fill-gold text-gold")} />
                      {t("기도합니다", "Praying")}
                      {p.prayer_supports.length > 0 && <span className="tabular-nums">{p.prayer_supports.length}</span>}
                    </Button>
                    {p.author_id === me && (
                      <Button
                        variant="ghost"
                        className="h-11"
                        onClick={async () => {
                          if (await act(db().from("prayers").update({ answered: !p.answered }).eq("id", p.id))) q.reload();
                        }}
                      >
                        {p.answered ? t("응답 표시 취소", "Not answered yet") : t("응답받았어요", "Mark answered")}
                      </Button>
                    )}
                    {(p.author_id === me || isPastor) && (
                      <Button
                        variant="ghost"
                        className="ml-auto size-11"
                        aria-label={t("삭제", "Delete")}
                        onClick={() =>
                          undoDelete(
                            () => q.setData((x) => x?.filter((y) => y.id !== p.id)),
                            q.reload,
                            () => db().from("prayers").delete().eq("id", p.id)
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </DataView>
      <Sheet open={open} onOpenChange={setOpen} title={t("기도 부탁하기", "Ask for prayer")}>
        <RecordForm
          fields={[
            { name: "body", ko: "기도 제목", en: "Prayer request", type: "textarea", required: true },
            {
              name: "visibility",
              ko: "누구와 나눌까요?",
              en: "Who can see it?",
              type: "select",
              required: true,
              default: "church",
              options: (["church", "group", "pastor"] as const)
                .filter((v) => v !== "group" || member!.group_id)
                .map((value) => ({ value, label: who[value] })),
              hint: t("담임목사님은 모든 기도 제목을 보실 수 있습니다.", "The pastor can see every request."),
            },
          ]}
          submitLabel={t("나누기", "Share")}
          onSubmit={async (v) => {
            if (await act(db().from("prayers").insert({ ...v, author_id: me }), "나눴습니다", "Shared")) {
              setOpen(false);
              q.reload();
            }
          }}
        />
      </Sheet>
    </>
  );
}
