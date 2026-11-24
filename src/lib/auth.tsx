"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { portalOn, supabase } from "./supabase";
import type { Member } from "./types";

type Auth = {
  /** undefined while loading, null when signed out */
  userId: string | null | undefined;
  /** undefined while loading, null when the account has not applied yet */
  member: Member | null | undefined;
  failed: boolean;
  active: boolean;
  isStaff: boolean;
  isPastor: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [member, setMember] = useState<Member | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!supabase) return setUserId(null);
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const load = useCallback(async (id: string) => {
    if (!portalOn || !supabase) return { member: null, failed: false };
    const { data, error } = await supabase.from("members").select("*").eq("user_id", id).maybeSingle();
    return { member: data as Member | null, failed: !!error };
  }, []);

  useEffect(() => {
    let stale = false;
    setMember(undefined);
    setFailed(false);
    if (!userId) return;
    load(userId).then((r) => {
      if (stale) return;
      setMember(r.member);
      setFailed(r.failed);
    });
    return () => {
      stale = true;
    };
  }, [userId, load]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const r = await load(userId);
    setMember(r.member);
    setFailed(r.failed);
  }, [userId, load]);

  const active = member?.status === "active";
  return (
    <AuthContext.Provider
      value={{
        userId,
        member,
        failed,
        active,
        isStaff: active && member.role !== "member",
        isPastor: active && member.role === "pastor",
        refresh,
        signOut: async () => {
          await supabase?.auth.signOut();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth needs AuthProvider");
  return auth;
}
