"use client";

import {
  createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel,
  useReactTable, type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DataView, PageTitle } from "@/components/data-view";
import { RecordForm, type Field } from "@/components/record-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Sheet } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { db, useAct, useQuery } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Group, Household, Member } from "@/lib/types";
import { CareNotes } from "./care-notes";

const col = createColumnHelper<Member>();
const none: Member[] = [];

export function MembersPage() {
  const { t } = useLang();
  const act = useAct();
  const { isPastor, member: me } = useAuth();
  const members = useQuery<Member[]>(() => db().from("members").select("*").order("name_ko").limit(2000));
  const groups = useQuery<Group[]>(() => db().from("groups").select("*").order("name_ko"));
  const households = useQuery<Household[]>(() => db().from("households").select("*").order("name"));
  const [find, setFind] = useState("");
  const [status, setStatus] = useState("active");
  const [group, setGroup] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editing, setEditing] = useState<Member | "new" | null>(null);

  const statusName = useMemo(
    () => ({ active: t("활동", "Active"), pending: t("승인 대기", "Pending"), inactive: t("비활동", "Inactive"), declined: t("거절됨", "Declined") }),
    [t]
  );
  const roleName = useMemo(() => ({ pastor: t("목사", "Pastor"), admin: t("관리자", "Admin"), member: t("교인", "Member") }), [t]);
  const groupName = (id: string | null) => {
    const g = groups.data?.find((x) => x.id === id);
    return g ? t(g.name_ko, g.name_en ?? g.name_ko) : "";
  };

  const rows = useMemo(
    () => members.data?.filter((m) => (!status || m.status === status) && (!group || m.group_id === group)) ?? none,
    [members.data, status, group]
  );
  const table = useReactTable({
    data: rows,
    columns: [
      col.accessor("name_ko", {
        header: t("이름", "Name"),
        cell: (c) => (
          <button className="text-left font-medium underline-offset-4 hover:underline" onClick={() => setEditing(c.row.original)}>
            {c.getValue()} <span className="font-normal text-muted-foreground">{c.row.original.name_en}</span>
          </button>
        ),
      }),
      col.accessor("church_title", { header: t("직분", "Title"), cell: (c) => c.getValue() }),
      col.accessor((m) => groupName(m.group_id), { id: "group", header: t("소그룹", "Group") }),
      col.accessor("phone", { header: t("전화", "Phone"), cell: (c) => <span className="tabular-nums">{c.getValue()}</span> }),
      col.accessor("role", {
        header: t("권한", "Role"),
        cell: (c) => (c.getValue() === "member" ? (c.row.original.user_id ? roleName.member : t("계정 없음", "No account")) : <Badge>{roleName[c.row.original.role]}</Badge>),
      }),
      col.accessor("status", {
        header: t("상태", "Status"),
        cell: (c) => <Badge tone={c.getValue() === "active" ? "good" : c.getValue() === "pending" ? "wait" : "neutral"}>{statusName[c.row.original.status]}</Badge>,
      }),
    ],
    state: { sorting, globalFilter: find },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFind,
    globalFilterFn: (row, _c, v: string) => {
      const m = row.original;
      return [m.name_ko, m.name_en, m.email, m.phone].some((x) => x?.toLowerCase().includes(v.trim().toLowerCase()));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });
  // Phones show name, phone and status.
  const hide = (id: string) => (["church_title", "group", "role"].includes(id) ? "hidden md:table-cell" : "");
  const found = { ...members, data: members.data && table.getRowModel().rows };

  const fields: Field[] = [
    { name: "name_ko", ko: "이름", en: "Name", required: true, max: 80, half: true },
    { name: "name_en", ko: "영어 이름", en: "English name", max: 80, half: true },
    { name: "phone", ko: "전화번호", en: "Phone", type: "tel", max: 40, half: true },
    { name: "email", ko: "이메일", en: "Email", type: "email", half: true },
    { name: "address", ko: "주소", en: "Address", max: 300 },
    { name: "birthday", ko: "생일", en: "Birthday", type: "date", half: true },
    { name: "baptized_on", ko: "세례일", en: "Baptized on", type: "date", half: true },
    { name: "church_title", ko: "직분", en: "Church title", max: 40, half: true, hint: t("예: 집사, 권사, 장로", "e.g. deacon, elder") },
    { name: "group_id", ko: "소그룹", en: "Small group", type: "select", half: true, options: groups.data?.map((g) => ({ value: g.id, label: t(g.name_ko, g.name_en ?? g.name_ko) })) },
    { name: "household_id", ko: "가정", en: "Household", type: "select", options: households.data?.map((h) => ({ value: h.id, label: h.name })) },
    { name: "is_newcomer", ko: "새가족", en: "Newcomer", type: "checkbox", default: true },
  ];
  // Pending requests are approved from the dashboard; roles need an account.
  if (isPastor && editing && editing !== "new" && editing.id !== me!.id && editing.status !== "pending") {
    fields.push({
      name: "status", ko: "상태", en: "Status", type: "select", required: true, half: true,
      options: (["active", "inactive", "declined"] as const)
        .filter((s) => s !== "declined" || editing.status === "declined")
        .map((value) => ({ value, label: statusName[value] })),
    });
    if (editing.user_id)
      fields.push({
        name: "role", ko: "권한", en: "Role", type: "select", required: true, half: true,
        options: (["member", "admin", "pastor"] as const).map((value) => ({ value, label: roleName[value] })),
      });
  }

  return (
    <>
      <PageTitle
        title={t("교인", "Members")}
        sub={members.data && t(`${rows.length}명`, `${rows.length} people`)}
        action={<Button onClick={() => setEditing("new")}><Plus /> {t("교인 추가", "Add member")}</Button>}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <Input type="search" aria-label={t("찾기", "Search")} placeholder={t("이름, 전화, 이메일", "Name, phone, email")} value={find} onChange={(e) => setFind(e.target.value)} />
        <NativeSelect className="sm:w-36" aria-label={t("상태", "Status")} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t("모든 상태", "Any status")}</option>
          {Object.entries(statusName).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </NativeSelect>
        <NativeSelect className="sm:w-36" aria-label={t("소그룹", "Group")} value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">{t("모든 소그룹", "Any group")}</option>
          {groups.data?.map((g) => <option key={g.id} value={g.id}>{t(g.name_ko, g.name_en ?? g.name_ko)}</option>)}
        </NativeSelect>
      </div>
      <DataView query={found} rows={6} rowClass="h-12" empty={t("해당하는 교인이 없습니다.", "No one matches.")}>
        {(d) => (
          <div className="overflow-x-auto border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => {
                      const dir = h.column.getIsSorted();
                      return (
                        <th key={h.id} className={`px-4 py-3 font-medium whitespace-nowrap ${hide(h.column.id)}`} aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"}>
                          <button className="inline-flex items-center gap-1" onClick={h.column.getToggleSortingHandler()}>
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {dir === "asc" && <ArrowUp className="size-3" />}
                            {dir === "desc" && <ArrowDown className="size-3" />}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y">
                {d.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-secondary/50">
                    {r.getVisibleCells().map((c) => (
                      <td key={c.id} className={`px-4 py-3 ${hide(c.column.id)}`}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataView>
      {table.getPageCount() > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm text-muted-foreground">
          <span className="tabular-nums">{table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
          <Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>{t("이전", "Previous")}</Button>
          <Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>{t("다음", "Next")}</Button>
        </div>
      )}
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing === "new" ? t("교인 추가", "Add member") : (editing?.name_ko ?? "")}>
        {editing && (
          <>
            <RecordForm
              fields={fields}
              values={editing === "new" ? null : editing}
              onSubmit={async (v) => {
                const q =
                  editing === "new"
                    ? db().from("members").insert({ ...v, status: "active" })
                    : db().from("members").update(v).eq("id", editing.id);
                if (await act(q, "저장했습니다", "Saved")) {
                  setEditing(null);
                  members.reload();
                }
              }}
            />
            {isPastor && editing !== "new" && <CareNotes member={editing} />}
          </>
        )}
      </Sheet>
    </>
  );
}
