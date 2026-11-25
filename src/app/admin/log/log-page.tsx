"use client";

import { DataView, PageTitle } from "@/components/data-view";
import { useAuth } from "@/lib/auth";
import { db, roleNames, useFormat, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";

type Entry = { id: number; actor_name: string; action: string; target: string | null; at: string };

export function LogPage() {
  const { t } = useLang();
  const f = useFormat();
  const { isSuper } = useAuth();
  const q = useQuery<Entry[]>(() => db().from("access_log").select("*").order("id", { ascending: false }).limit(200), [], isSuper);
  const names: Record<string, string> = {
    "care.read": t("돌봄 기록 열람", "Viewed care notes"),
    "care.add": t("돌봄 기록 추가", "Added care note"),
    "care.done": t("돌봄 기록 상태 변경", "Changed care note"),
    "care.delete": t("돌봄 기록 삭제", "Deleted care note"),
    "children.read": t("어린이 명단 열람", "Viewed children's list"),
    "children.in": t("어린이 체크인", "Checked in child"),
    "children.out": t("어린이 체크아웃", "Checked out child"),
    "giving.read": t("헌금 기록 열람", "Viewed giving"),
    "giving.insert": t("헌금 기록 추가", "Recorded giving"),
    "giving.delete": t("헌금 기록 삭제", "Deleted giving"),
    "member.link": t("계정 연결 승인", "Approved and linked"),
    "member.delete": t("교인 기록 삭제", "Deleted member record"),
  };
  const words: Record<string, string> = {
    active: t("활동", "Active"), pending: t("승인 대기", "Pending"), inactive: t("비활동", "Inactive"), declined: t("거절됨", "Declined"),
    ...Object.fromEntries(Object.entries(roleNames).map(([k, v]) => [k, t(...v)])),
  };
  const label = (a: string) =>
    names[a] ??
    (a.startsWith("member.")
      ? `${t("교인 상태 변경", "Changed member")}: ${a.slice(7).split(".").map((w) => words[w] ?? w).join(", ")}`
      : a);
  if (!isSuper) return <p className="text-muted-foreground">{t("최고 관리자만 볼 수 있습니다.", "Super admins only.")}</p>;
  return (
    <>
      <PageTitle title={t("접근 기록", "Access log")} sub={t("민감한 정보를 누가 보고 바꿨는지 보여 줍니다.", "Who viewed or changed sensitive information.")} />
      <DataView query={q} rows={6} rowClass="h-12" empty={t("기록이 없습니다.", "Nothing yet.")}>
        {(d) => (
          <ul className="divide-y border bg-card text-sm">
            {d.map((e) => (
              <li key={e.id} className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-3">
                <span className="font-medium">{e.actor_name}</span>
                <span>{label(e.action)}{e.target && <span className="text-muted-foreground"> {e.target}</span>}</span>
                <span className="text-muted-foreground sm:ml-auto">{f.time(e.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </DataView>
    </>
  );
}
