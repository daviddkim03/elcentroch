"use client";

import Link from "next/link";
import { Card, DataView, PageTitle } from "@/components/data-view";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { db, today, useAct, useFormat, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Member, Visit } from "@/lib/types";

type Reminder = { id: string; member_id: string; name: string; kind: string; remind_on: string };

export function Dashboard() {
  const { t } = useLang();
  const f = useFormat();
  const { isPastor } = useAuth();
  const members = useQuery<Member[]>(() => db().from("members").select("*").order("created_at").limit(2000));
  const visits = useQuery<Visit[]>(() => db().from("visits").select("*").eq("handled", false).order("created_at", { ascending: false }).limit(20));
  const absent = useQuery<{ id: string; name: string; last_seen: string }[]>(() => db().rpc("absentees"));
  const care = useQuery<Reminder[]>(() => db().rpc("care_reminders"), [], isPastor);
  const pick = (fn: (m: Member) => boolean) => ({ ...members, data: members.data?.filter(fn) });
  const pending = pick((m) => m.status === "pending");
  const newcomers = pick((m) => m.status === "active" && m.is_newcomer);
  const birthdays = pick((m) => m.status === "active" && birthdayWithinWeek(m.birthday));

  return (
    <>
      <PageTitle title={t("대시보드", "Dashboard")} sub={f.day(today())} />
      <Section title={t("승인 대기", "Waiting for approval")}>
        <DataView query={pending} rows={1} empty={t("기다리는 신청이 없습니다.", "No one is waiting.")}>
          {(d) => (
            <ul className="divide-y border bg-card">
              {d.map((m) => (
                <PendingRow key={m.id} m={m} records={members.data!.filter((x) => !x.user_id && x.status !== "pending")} canApprove={isPastor} onDone={members.reload} />
              ))}
            </ul>
          )}
        </DataView>
      </Section>
      <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2">
        <Section title={t("새가족", "Newcomers")}>
          <People q={newcomers} empty={t("새가족이 없습니다.", "No newcomers.")} sub={(m) => m.phone ?? f.stamp(m.created_at)} />
        </Section>
        <Section title={t("방문 문의", "Visitor messages")} href="/admin/visits">
          <People q={visits} empty={t("새 문의가 없습니다.", "No new messages.")} sub={(v) => v.contact} />
        </Section>
        <Section title={t("7일 안의 생일", "Birthdays in 7 days")}>
          <People q={birthdays} empty={t("가까운 생일이 없습니다.", "No birthdays this week.")} sub={(m) => f.weekday(`${today().slice(0, 4)}${m.birthday!.slice(4)}`)} />
        </Section>
        <Section title={t("최근 3번 예배에 결석", "Missed the last 3 services")}>
          <People q={absent} empty={t("없습니다.", "No one.")} sub={(a) => `${t("마지막 출석", "Last seen")} ${f.day(a.last_seen)}`} />
        </Section>
        {isPastor && (
          <Section title={t("돌봄 알림", "Care reminders")}>
            <People q={care} empty={t("예정된 알림이 없습니다.", "No reminders.")} sub={(c) => f.day(c.remind_on)} />
          </Section>
        )}
      </div>
    </>
  );
}

function birthdayWithinWeek(b: string | null) {
  if (!b) return false;
  const now = new Date(today());
  for (let i = 0; i <= 7; i++) {
    const d = new Date(now.getTime() + i * 86400000).toISOString().slice(5, 10);
    if (d === b.slice(5)) return true;
  }
  return false;
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  const { t } = useLang();
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        {href && <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">{t("모두 보기", "See all")}</Link>}
      </div>
      {children}
    </section>
  );
}

function People<T extends { id: string }>({
  q,
  empty,
  sub,
}: {
  q: { data: T[] | undefined; error: boolean; reload: () => void };
  empty: string;
  sub: (x: T) => string;
}) {
  return (
    <DataView query={q} rows={1} empty={empty}>
      {(d) => (
        <Card className="divide-y p-0">
          {d.slice(0, 8).map((x) => (
            <div key={x.id} className="flex justify-between gap-4 px-5 py-3 text-sm">
              <span className="font-medium">{"name_ko" in x ? String(x.name_ko) : "name" in x ? String(x.name) : ""}</span>
              <span className="truncate text-muted-foreground tabular-nums">{sub(x)}</span>
            </div>
          ))}
        </Card>
      )}
    </DataView>
  );
}

function PendingRow({ m, records, canApprove, onDone }: { m: Member; records: Member[]; canApprove: boolean; onDone: () => void }) {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const [link, setLink] = useState("");
  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-48 flex-1">
          <p className="font-medium">{m.name_ko} {m.name_en && <span className="text-muted-foreground">{m.name_en}</span>}</p>
          <p className="text-sm break-words text-muted-foreground">{[m.email, m.phone, f.stamp(m.created_at)].filter(Boolean).join(" · ")}</p>
          {m.request_note && <p className="mt-2 text-sm whitespace-pre-line">{m.request_note}</p>}
        </div>
        {canApprove ? (
          <div className="flex flex-wrap items-center gap-2">
            {records.length > 0 && (
              <NativeSelect className="w-44" aria-label={t("기존 교인 기록과 연결", "Link to an existing record")} value={link} onChange={(e) => setLink(e.target.value)}>
                <option value="">{t("새 교인", "New record")}</option>
                {records.map((r) => <option key={r.id} value={r.id}>{r.name_ko}</option>)}
              </NativeSelect>
            )}
            <Button
              onClick={async () => {
                if (await act(db().rpc("approve_member", { p_id: m.id, p_existing: link || null }), "승인했습니다", "Approved")) onDone();
              }}
            >
              {t("승인", "Approve")}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (await act(db().from("members").update({ status: "declined" }).eq("id", m.id), "거절했습니다", "Declined")) onDone();
              }}
            >
              {t("거절", "Decline")}
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{t("목사님 승인 필요", "Needs the pastor")}</span>
        )}
      </div>
    </li>
  );
}
