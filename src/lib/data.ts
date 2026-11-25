"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLang } from "./i18n";
import { supabase } from "./supabase";
import type { Role } from "./types";

type Result<T> = PromiseLike<{ data: unknown; error: { message: string } | null }> & { __t?: T };

/** The Supabase client, for code that only renders once someone is signed in. */
export const db = () => supabase!;

/** Runs a Supabase query on mount (and when `deps` change). */
export function useQuery<T>(run: () => Result<T>, deps: React.DependencyList = [], enabled = true) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState(false);
  const latest = useRef(0);
  const runRef = useRef(run);
  runRef.current = run;

  const reload = useCallback(async () => {
    const turn = ++latest.current;
    const res = await runRef.current();
    if (turn !== latest.current) return;
    setError(!!res.error);
    if (!res.error) setData(res.data as T);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    setData(undefined);
    setError(false);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, enabled, ...deps]);

  return { data, error, reload, setData };
}

const messages: [RegExp, string, string][] = [
  [/invalid login credentials/i, "이메일 또는 비밀번호가 맞지 않습니다.", "Wrong email or password."],
  [/email not confirmed/i, "이메일 확인을 먼저 완료해 주세요.", "Please confirm your email first."],
  [/already registered/i, "이미 가입된 이메일입니다.", "That email already has an account."],
  [/rate limit|too many|security purposes/i, "잠시 후 다시 시도해 주세요.", "Please try again in a little while."],
  [/event full/i, "자리가 모두 찼습니다.", "This event is full."],
  [/rsvp closed/i, "신청이 마감되었습니다.", "Sign-up is closed."],
  [/wrong pickup code/i, "픽업 코드가 맞지 않습니다.", "That pickup code is not right."],
  [/slot unavailable/i, "이미 다른 분이 맡았습니다.", "Someone else already took this."],
  [/at least one super admin/i, "최고 관리자가 최소 한 명은 있어야 합니다.", "At least one super admin is required."],
  [/not in a group/i, "아직 소그룹이 없습니다.", "You are not in a small group yet."],
  [/already has an account/i, "이미 계정이 연결된 기록입니다.", "That record already has an account."],
  [/giving_member_id/i, "헌금 기록이 있어 삭제할 수 없습니다. 비활성으로 바꿔 주세요.", "This person has giving records. Set them inactive instead."],
  [/duplicate key/i, "이미 등록되어 있습니다.", "That already exists."],
  [/super admin only|staff only|not allowed|row-level security/i, "권한이 없습니다.", "You do not have permission."],
  [/password/i, "비밀번호는 8자 이상으로 해 주세요.", "Use a password of at least 8 characters."],
];

/** `act(promise, "저장했습니다", "Saved")` -> true on success; always tells the person how it went. */
export function useAct() {
  const { t } = useLang();
  return useCallback(
    async (p: PromiseLike<{ error: { message: string } | null }>, ko?: string, en?: string) => {
      const { error } = await p;
      if (error) {
        const m = messages.find(([re]) => re.test(error.message));
        toast.error(m ? t(m[1], m[2]) : t("문제가 생겼습니다. 다시 시도해 주세요.", "Something went wrong. Please try again."));
        return false;
      }
      if (ko) toast.success(t(ko, en ?? ko));
      return true;
    },
    [t]
  );
}

/** Hides a row now and deletes it in five seconds unless the person presses Undo. */
export function useUndoDelete() {
  const { t } = useLang();
  const act = useAct();
  return useCallback(
    (hide: () => void, restore: () => void, commit: () => PromiseLike<{ error: { message: string } | null }>) => {
      hide();
      const id = setTimeout(async () => {
        if (!(await act(commit()))) restore();
      }, 5000);
      toast(t("삭제했습니다", "Deleted"), {
        duration: 4800,
        action: {
          label: t("되돌리기", "Undo"),
          onClick: () => {
            clearTimeout(id);
            restore();
          },
        },
      });
    },
    [t, act]
  );
}

/** The four access levels, highest first. */
export const roleNames: Record<Role, [ko: string, en: string]> = {
  superadmin: ["최고 관리자", "Super admin"],
  pastor: ["목사", "Pastor"],
  admin: ["관리자", "Admin"],
  member: ["교인", "Member"],
};

/** Korean alphabetical order, independent of the database's collation. */
export const byName = <T extends { name_ko: string }>(rows: T[] | undefined) =>
  rows && [...rows].sort((a, b) => a.name_ko.localeCompare(b.name_ko, "ko"));

/** Today in the church's time zone, as YYYY-MM-DD. */
export const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

export function useFormat() {
  const { lang } = useLang();
  const locale = lang === "ko" ? "ko-KR" : "en-US";
  return {
    /** A calendar date (YYYY-MM-DD); parsed as UTC so it never shifts a day. */
    day: (d: string | null | undefined) =>
      d ? new Date(d).toLocaleDateString(locale, { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" }) : "",
    weekday: (d: string) =>
      new Date(d).toLocaleDateString(locale, { timeZone: "UTC", month: "short", day: "numeric", weekday: "short" }),
    time: (d: string) =>
      new Date(d).toLocaleString(locale, {
        timeZone: "America/Los_Angeles",
        month: "short",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      }),
    stamp: (d: string) =>
      new Date(d).toLocaleDateString(locale, { timeZone: "America/Los_Angeles", year: "numeric", month: "short", day: "numeric" }),
    money: (n: number) => Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" }),
  };
}
