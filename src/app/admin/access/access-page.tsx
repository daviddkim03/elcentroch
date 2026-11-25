"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { DataView, PageTitle } from "@/components/data-view";
import { RecordForm, type Field } from "@/components/record-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { byName, db, roleNames, useAct, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Member, Role } from "@/lib/types";

const roles = Object.keys(roleNames) as Role[];

export function AccessPage() {
  const { t } = useLang();
  const act = useAct();
  const { isSuper, member: me } = useAuth();
  const accounts = useQuery<Member[]>(
    () => db().from("members").select("*").eq("status", "active").not("user_id", "is", null).limit(2000), [], isSuper
  );
  const [editing, setEditing] = useState<Member | "new" | null>(null);
  if (!isSuper) return <p className="text-muted-foreground">{t("최고 관리자만 볼 수 있습니다.", "Super admins only.")}</p>;

  const people = byName(accounts.data);
  const staff = people && roles.filter((r) => r !== "member").flatMap((r) => people.filter((m) => m.role === r));
  const about: Record<Role, string> = {
    superadmin: t("담임목사와 사이트 개발자. 가입 승인, 권한, 돌봄 기록, 모든 기도 제목, 접근 기록까지 모두 할 수 있습니다.", "Senior pastor and site developer. Everything, including approving people, roles, care notes, every prayer request and the access log."),
    pastor: t("교인, 출석, 소식, 주일학교, 헌금을 관리합니다. 관리자와 권한이 같습니다.", "Manages members, attendance, news, children and giving. Same access as an admin."),
    admin: t("목사가 아닌 사무 담당자. 목사와 권한이 같습니다.", "Office staff who are not pastors. Same access as a pastor."),
    member: t("교인 페이지만 이용합니다.", "Uses the member pages only."),
  };

  const role: Field = {
    name: "role", ko: "권한", en: "Role", type: "select", required: true, default: "pastor",
    options: roles.filter((r) => editing !== "new" || r !== "member").map((value) => ({ value, label: t(...roleNames[value]) })),
    hint: t("최고 관리자는 다른 사람의 권한도 바꿀 수 있습니다.", "A super admin can also change other people's roles."),
  };
  const who: Field = {
    name: "id", ko: "이름", en: "Name", type: "select", required: true,
    options: people?.filter((m) => m.role === "member").map((m) => ({ value: m.id, label: m.name_ko })),
    hint: t("가입하고 승인된 교인만 나옵니다.", "Only approved members with an account are listed."),
  };

  return (
    <>
      <PageTitle
        title={t("권한", "Access")}
        sub={t("누가 무엇을 관리할 수 있는지 정합니다.", "Decide who can manage what.")}
        action={<Button disabled={!people} onClick={() => setEditing("new")}><Plus /> {t("권한 주기", "Give access")}</Button>}
      />
      <DataView query={{ ...accounts, data: staff }} rows={2} rowClass="h-16" empty={t("아직 없습니다.", "No one yet.")}>
        {(d) => (
          <ul aria-label={t("권한이 있는 사람", "People with access")} className="divide-y border bg-card">
            {d.map((m) => (
              <li key={m.id} className="flex min-h-16 items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.name_ko}</p>
                  <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                </div>
                <Badge>{t(...roleNames[m.role])}</Badge>
                <div className="flex w-14 shrink-0 justify-end">
                  {m.id === me!.id ? (
                    <span className="text-sm text-muted-foreground">{t("나", "You")}</span>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setEditing(m)}>{t("변경", "Change")}</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </DataView>
      <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {roles.map((r) => (
          <div key={r}>
            <dt className="font-medium">{t(...roleNames[r])}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{about[r]}</dd>
          </div>
        ))}
      </dl>
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing === "new" ? t("권한 주기", "Give access") : (editing?.name_ko ?? "")}>
        {editing && (
          <RecordForm
            fields={editing === "new" ? [who, role] : [role]}
            values={editing === "new" ? null : editing}
            onSubmit={async (v) => {
              const id = editing === "new" ? (v.id as string) : editing.id;
              if (await act(db().from("members").update({ role: v.role }).eq("id", id), "권한을 바꿨습니다", "Access changed")) {
                setEditing(null);
                accounts.reload();
              }
            }}
          />
        )}
      </Sheet>
    </>
  );
}
