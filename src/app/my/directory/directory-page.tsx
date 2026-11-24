"use client";

import Link from "next/link";
import { useState } from "react";
import { DataView, PageTitle } from "@/components/data-view";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { byName, db, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";

type Entry = {
  id: string;
  name_ko: string;
  name_en: string | null;
  church_title: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  group_ko: string | null;
  group_en: string | null;
};

export function DirectoryPage() {
  const { t } = useLang();
  const { member } = useAuth();
  const [find, setFind] = useState("");
  const q = useQuery<Entry[]>(() => db().rpc("directory"));
  const needle = find.trim().toLowerCase();
  const shown = {
    ...q,
    data: byName(q.data)?.filter((p) => `${p.name_ko} ${p.name_en ?? ""} ${p.group_ko ?? ""}`.toLowerCase().includes(needle)),
  };
  return (
    <>
      <PageTitle title={t("교인 주소록", "Directory")} />
      {!member!.directory_listed && (
        <p className="mb-6 text-sm text-muted-foreground">
          {t("회원님은 아직 주소록에 나오지 않습니다.", "You are not listed yet.")}{" "}
          <Link href="/my/profile" className="text-foreground underline">
            {t("내 정보에서 바꾸기", "Change this in your profile")}
          </Link>
        </p>
      )}
      <Input
        type="search"
        className="mb-4 h-11"
        aria-label={t("이름 찾기", "Find a name")}
        placeholder={t("이름 찾기", "Find a name")}
        value={find}
        onChange={(e) => setFind(e.target.value)}
      />
      <DataView query={shown} empty={needle ? t("찾는 분이 없습니다.", "No one by that name.") : t("아직 등록한 분이 없습니다.", "No one is listed yet.")}>
        {(d) => (
          <ul className="divide-y border bg-card">
            {d.map((p) => (
              <li key={p.id} className="px-5 py-4">
                <p>
                  <span className="font-medium">{t(p.name_ko, p.name_en ?? p.name_ko)}</span>{" "}
                  <span className="text-sm text-muted-foreground">
                    {[p.church_title, t(p.group_ko ?? "", p.group_en ?? p.group_ko ?? "")].filter(Boolean).join(" · ")}
                  </span>
                </p>
                <div className="flex flex-wrap gap-x-5 text-sm text-muted-foreground">
                  {p.phone && <a className="py-2 hover:text-foreground" href={`tel:${p.phone}`}>{p.phone}</a>}
                  {p.email && <a className="py-2 hover:text-foreground" href={`mailto:${p.email}`}>{p.email}</a>}
                  {p.address && <span className="py-2">{p.address}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </DataView>
    </>
  );
}
