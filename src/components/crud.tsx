"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { db, useAct, useQuery, useUndoDelete } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { DataView, PageTitle } from "./data-view";
import { RecordForm, type Field, type Values } from "./record-form";

/** List, create, edit and delete one table. */
export function Crud<T extends { id: string }>({
  table,
  title,
  sub,
  order,
  ascending = false,
  fields,
  row,
  empty,
  prepare,
}: {
  table: string;
  title: string;
  sub?: string;
  order: string;
  ascending?: boolean;
  fields: Field[];
  row: (r: T) => React.ReactNode;
  empty: string;
  /** Turns form values into columns; return null to stop the save. */
  prepare?: (v: Values) => Promise<Values | null>;
}) {
  const { t } = useLang();
  const act = useAct();
  const undoDelete = useUndoDelete();
  const query = useQuery<T[]>(() => db().from(table).select("*").order(order, { ascending }).limit(300));
  const [editing, setEditing] = useState<T | "new" | null>(null);

  const save = async (v: Values) => {
    const values = prepare ? await prepare(v) : v;
    if (!values) return;
    const q =
      editing === "new" ? db().from(table).insert(values) : db().from(table).update(values).eq("id", (editing as T).id);
    if (await act(q, "저장했습니다", "Saved")) {
      setEditing(null);
      query.reload();
    }
  };

  return (
    <div>
      <PageTitle
        title={title}
        sub={sub}
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus /> {t("추가", "Add")}
          </Button>
        }
      />
      <DataView query={query} empty={empty} rowClass="h-18">
        {(data) => (
          <ul className="divide-y border bg-card">
            {data.map((r) => (
              <li key={r.id} className="flex items-center gap-2 px-5 py-4">
                <div className="min-w-0 flex-1">{row(r)}</div>
                <Button size="icon" variant="ghost" aria-label={t("수정", "Edit")} onClick={() => setEditing(r)}>
                  <Pencil />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t("삭제", "Delete")}
                  onClick={() =>
                    undoDelete(
                      () => query.setData((d) => d?.filter((x) => x.id !== r.id)),
                      query.reload,
                      () => db().from(table).delete().eq("id", r.id)
                    )
                  }
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DataView>
      <Sheet
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? t("새로 추가", "Add new") : t("수정", "Edit")}
      >
        <RecordForm fields={fields} values={editing === "new" ? null : editing} onSubmit={save} />
      </Sheet>
    </div>
  );
}
