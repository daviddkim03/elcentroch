"use client";

import { db, useQuery } from "./data";
import { useLang } from "./i18n";
import type { Member } from "./types";

/** Active members as select options (staff only). */
export function usePeople() {
  const { t } = useLang();
  const q = useQuery<Pick<Member, "id" | "name_ko" | "name_en">[]>(() =>
    db().from("members").select("id, name_ko, name_en").eq("status", "active").order("name_ko")
  );
  return q.data?.map((m) => ({ value: m.id, label: t(m.name_ko, m.name_en ?? m.name_ko) })) ?? [];
}
