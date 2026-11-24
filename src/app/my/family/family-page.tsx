"use client";

import { useState } from "react";
import { Card, DataView, PageTitle } from "@/components/data-view";
import { RecordForm, type Field } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { db, today, useAct, useFormat, useQuery, useUndoDelete } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Checkin, Child } from "@/lib/types";

const fields: Field[] = [
  { name: "name", ko: "이름", en: "Name", required: true, max: 80 },
  { name: "birthday", ko: "생일", en: "Birthday", type: "date" },
  { name: "allergies", ko: "알레르기", en: "Allergies", max: 500 },
  { name: "notes", ko: "선생님이 알아야 할 점", en: "What teachers should know", type: "textarea", max: 1000 },
  { name: "pickup", ko: "데려갈 수 있는 사람", en: "Who may pick up", max: 500 },
];

export function FamilyPage() {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const undoDelete = useUndoDelete();
  const { member } = useAuth();
  const [editing, setEditing] = useState<Child | "new" | null>(null);
  const kids = useQuery<Child[]>(() => db().from("children").select("*").order("name"));
  const checkins = useQuery<Checkin[]>(() => db().from("child_checkins").select("*").eq("service_on", today()));

  return (
    <>
      <PageTitle
        title={t("자녀", "Children")}
        sub={t("가족과 주일학교 담당자만 볼 수 있습니다.", "Only your family and church staff can see this.")}
        action={<Button className="h-11" onClick={() => setEditing("new")}>{t("자녀 추가", "Add child")}</Button>}
      />
      <DataView query={kids} empty={t("등록한 자녀가 없습니다.", "No children added yet.")} rowClass="h-28">
        {(d) => (
          <div className="space-y-4">
            {d.map((c) => {
              const here = checkins.data?.find((k) => k.child_id === c.id && !k.out_at);
              return (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold">{c.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {[f.day(c.birthday), c.allergies && `${t("알레르기", "Allergies")}: ${c.allergies}`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {here && (
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">{t("픽업 코드", "Pickup code")}</p>
                        <p className="text-2xl font-bold tracking-widest">{here.code}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="h-11" onClick={() => setEditing(c)}>{t("수정", "Edit")}</Button>
                    <Button
                      variant="ghost"
                      className="h-11"
                      onClick={() =>
                        undoDelete(
                          () => kids.setData((x) => x?.filter((y) => y.id !== c.id)),
                          kids.reload,
                          () => db().from("children").delete().eq("id", c.id)
                        )
                      }
                    >
                      {t("삭제", "Remove")}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </DataView>
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={t("자녀 정보", "Child details")}>
        <RecordForm
          fields={fields}
          values={editing === "new" ? null : editing}
          onSubmit={async (v) => {
            const q =
              editing === "new"
                ? db().from("children").insert({ ...v, guardian_id: member!.id })
                : db().from("children").update(v).eq("id", (editing as Child).id);
            if (await act(q, "저장했습니다", "Saved")) {
              setEditing(null);
              kids.reload();
            }
          }}
        />
      </Sheet>
    </>
  );
}
