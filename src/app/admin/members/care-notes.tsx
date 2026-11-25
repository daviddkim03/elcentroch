"use client";

import { Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, DataView } from "@/components/data-view";
import { RecordForm } from "@/components/record-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db, useAct, useFormat, useQuery, useUndoDelete } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { CareNote, Member } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Closed until asked for, because each opening is written to the access log. */
export function CareNotes({ member }: { member: Member }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-10 border-t pt-8">
      <h2 className="text-lg font-bold">{t("돌봄 기록", "Care notes")}</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        {t("최고 관리자만 볼 수 있고, 열람이 기록됩니다.", "Super admins only. Each viewing is logged.")}
      </p>
      {open ? <Notes member={member} /> : <Button variant="outline" onClick={() => setOpen(true)}>{t("열기", "Open")}</Button>}
    </section>
  );
}

function Notes({ member }: { member: Member }) {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const undoDelete = useUndoDelete();
  const [formKey, setFormKey] = useState(0);
  const q = useQuery<CareNote[]>(() => db().rpc("read_care_notes", { p_member: member.id }));
  const kinds = { visit: t("심방", "Visit"), hospital: t("병원", "Hospital"), call: t("전화", "Call"), followup: t("후속 돌봄", "Follow-up") };
  return (
    <div className="space-y-6">
      <RecordForm
        key={formKey}
        fields={[
          { name: "kind", ko: "종류", en: "Type", type: "select", required: true, default: "visit", half: true, options: Object.entries(kinds).map(([value, label]) => ({ value, label })) },
          { name: "remind", ko: "알림 날짜", en: "Remind me on", type: "date", half: true },
          { name: "body", ko: "내용", en: "Note", type: "textarea", required: true, max: 5000 },
        ]}
        submitLabel={t("기록 추가", "Add note")}
        onSubmit={async (v) => {
          const p = db().rpc("add_care_note", { p_member: member.id, p_kind: v.kind, p_body: v.body, p_remind: v.remind });
          if (await act(p, "저장했습니다", "Saved")) {
            setFormKey((k) => k + 1);
            q.reload();
          }
        }}
      />
      <DataView query={q} rows={1} empty={t("기록이 없습니다.", "No notes yet.")}>
        {(d) => (
          <div className="space-y-3">
            {d.map((n) => (
              <Card key={n.id} className={cn("text-sm", n.done && "opacity-60")}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge>{kinds[n.kind]}</Badge>
                  {f.stamp(n.created_at)}
                  {n.remind_on && <Badge tone="wait">{f.day(n.remind_on)}</Badge>}
                  <span className="ml-auto flex">
                    <Button
                      size="icon" variant="ghost" aria-pressed={n.done} aria-label={t("완료", "Done")}
                      onClick={async () => {
                        if (await act(db().rpc("finish_care_note", { p_id: n.id }))) q.reload();
                      }}
                    >
                      <Check />
                    </Button>
                    <Button
                      size="icon" variant="ghost" aria-label={t("삭제", "Delete")}
                      onClick={() =>
                        undoDelete(
                          () => q.setData((x) => x?.filter((y) => y.id !== n.id)),
                          q.reload,
                          () => db().rpc("finish_care_note", { p_id: n.id, p_delete: true })
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </span>
                </div>
                <p className="mt-2 leading-relaxed break-words whitespace-pre-line">{n.body}</p>
              </Card>
            ))}
          </div>
        )}
      </DataView>
    </div>
  );
}
