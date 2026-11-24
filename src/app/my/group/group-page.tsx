"use client";

import { Trash2 } from "lucide-react";
import { Card, DataView, PageTitle } from "@/components/data-view";
import { RecordForm } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { byName, db, useAct, useFormat, useQuery, useUndoDelete } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Group, GroupPost } from "@/lib/types";

export function GroupPage() {
  const { t } = useLang();
  const { member } = useAuth();
  // Staff can read every group, so ask for the ones this person belongs to or leads.
  const q = useQuery<Group[]>(() => {
    const mine = `leader_id.eq.${member!.id}` + (member!.group_id ? `,id.eq.${member!.group_id}` : "");
    return db().from("groups").select("*").or(mine);
  });
  return (
    <DataView query={q} empty={t("아직 소그룹이 정해지지 않았습니다.", "You have not been placed in a group yet.")}>
      {(d) => <div className="space-y-16">{d.map((g) => <GroupView key={g.id} g={g} />)}</div>}
    </DataView>
  );
}

function GroupView({ g }: { g: Group }) {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const undoDelete = useUndoDelete();
  const { member } = useAuth();
  const [formKey, setFormKey] = useState(0);
  const roster = useQuery<{ id: string; name_ko: string; name_en: string | null; phone: string | null }[]>(() =>
    db().rpc("group_roster", { p_group: g.id })
  );
  const posts = useQuery<GroupPost[]>(() =>
    db().from("group_posts").select("*").eq("group_id", g.id).order("created_at", { ascending: false }).limit(50)
  );
  return (
    <div className="space-y-8">
      <div>
        <PageTitle title={t(g.name_ko, g.name_en ?? g.name_ko)} sub={[g.meeting, g.location].filter(Boolean).join(" · ")} />
        <DataView query={roster} empty={t("아직 구성원이 없습니다.", "No one here yet.")} rows={1}>
          {(d) => (
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {byName(d)!.map((p) => (
                <li key={p.id} className="py-1">
                  {t(p.name_ko, p.name_en ?? p.name_ko)}
                  {p.phone && <a href={`tel:${p.phone}`} className="ml-2 text-sm text-muted-foreground">{p.phone}</a>}
                </li>
              ))}
            </ul>
          )}
        </DataView>
      </div>
      <RecordForm
        key={formKey}
        fields={[{ name: "body", ko: "나눔과 기도 제목", en: "Notes and prayer", type: "textarea", required: true }]}
        submitLabel={t("올리기", "Post")}
        onSubmit={async (v) => {
          if (await act(db().from("group_posts").insert({ ...v, group_id: g.id, author_id: member!.id }), "올렸습니다", "Posted")) {
            setFormKey((k) => k + 1);
            posts.reload();
          }
        }}
      />
      <DataView query={posts} empty={t("아직 글이 없습니다.", "No posts yet.")}>
        {(d) => (
          <div className="space-y-4">
            {d.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{p.author_name}</span>
                  <span>{f.stamp(p.created_at)}</span>
                  {(p.author_id === member!.id || g.leader_id === member!.id) && (
                    <Button
                      variant="ghost"
                      className="ml-auto size-11"
                      aria-label={t("삭제", "Delete")}
                      onClick={() =>
                        undoDelete(
                          () => posts.setData((x) => x?.filter((y) => y.id !== p.id)),
                          posts.reload,
                          () => db().from("group_posts").delete().eq("id", p.id)
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
                <p className="mt-2 leading-relaxed break-words whitespace-pre-line">{p.body}</p>
              </Card>
            ))}
          </div>
        )}
      </DataView>
    </div>
  );
}
