"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { db, useAct } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { portalOn } from "@/lib/supabase";
import { LoginPanel } from "./login-panel";
import { RecordForm } from "./record-form";

/** Shows `children` to approved members and the right next step to everyone else. */
export function AccountGate({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const { userId, member, failed, active, refresh, signOut } = useAuth();
  const act = useAct();

  if (!portalOn) return <Notice title={t("준비 중입니다", "Coming soon")} body={t("교인 로그인은 준비 중입니다.", "Member login is coming soon.")} />;
  if (userId === null) return <div className="px-4 py-16"><LoginPanel next="/my" /></div>;
  if (failed)
    return (
      <Notice title={t("불러오지 못했습니다", "Could not load")} body={t("인터넷 연결을 확인해 주세요.", "Please check your connection.")}>
        <Button className="h-11" onClick={refresh}>{t("다시 시도", "Try again")}</Button>
      </Notice>
    );
  if (userId === undefined || member === undefined)
    return (
      <div aria-busy className="mx-auto max-w-3xl space-y-4 px-5 py-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  if (active) return <>{children}</>;

  const out = (
    <Button className="h-11" variant="outline" type="button" onClick={signOut}>
      {t("로그아웃", "Sign out")}
    </Button>
  );
  if (member === null)
    return (
      <div className="mx-auto max-w-lg px-5 py-12">
        <h1 className="text-2xl font-bold">{t("교인 등록 신청", "Request to join")}</h1>
        <p className="mt-2 mb-8 text-muted-foreground">
          {t("담임목사님이 확인하고 승인하면 이용하실 수 있습니다.", "The pastor will review and approve your request.")}
        </p>
        <RecordForm
          fields={applyFields}
          submitLabel={t("신청하기", "Send request")}
          onSubmit={async (v) => {
            const ok = await act(
              db().rpc("apply_for_membership", {
                p_name_ko: v.name_ko,
                p_name_en: v.name_en ?? "",
                p_phone: v.phone ?? "",
                p_note: v.note ?? "",
              }),
              "신청했습니다",
              "Request sent"
            );
            if (ok) await refresh();
          }}
        >
          {out}
        </RecordForm>
      </div>
    );
  const pending = member.status === "pending";
  return (
    <Notice
      title={pending ? t("승인을 기다리고 있습니다", "Waiting for approval") : t("이용할 수 없는 계정입니다", "This account is not active")}
      body={
        pending
          ? t("담임목사님이 승인하시면 바로 이용하실 수 있습니다.", "You can come in as soon as the pastor approves your request.")
          : t("궁금한 점은 교회로 연락해 주세요.", "Please contact the church with any questions.")
      }
    >
      {pending && <Button className="h-11" onClick={refresh}>{t("다시 확인", "Check again")}</Button>}
      {out}
    </Notice>
  );
}

const applyFields = [
  { name: "name_ko", ko: "이름", en: "Name", required: true, max: 80 },
  { name: "name_en", ko: "영어 이름", en: "English name", max: 80 },
  { name: "phone", ko: "전화번호", en: "Phone", type: "tel" as const, max: 40 },
  { name: "note", ko: "목사님께 남길 말씀", en: "A note for the pastor", type: "textarea" as const, max: 1000 },
];

export function Notice({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      <div className="mt-8 flex justify-center gap-3">
        {children ?? (
          <Button asChild>
            <Link href="/">{t("홈으로", "Home")}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
