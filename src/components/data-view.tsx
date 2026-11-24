"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Loading, error and empty states around one query's rows. */
export function DataView<T>({
  query,
  empty,
  rows = 3,
  rowClass = "h-20",
  children,
}: {
  query: { data: T[] | undefined; error: boolean; reload: () => void };
  empty: React.ReactNode;
  rows?: number;
  rowClass?: string;
  children: (data: T[]) => React.ReactNode;
}) {
  const { t } = useLang();
  if (query.error && !query.data)
    return (
      <div role="alert" className="border bg-card px-6 py-10 text-center text-muted-foreground">
        <p>{t("불러오지 못했습니다.", "Could not load this.")}</p>
        <Button variant="outline" className="mt-4" onClick={query.reload}>
          {t("다시 시도", "Try again")}
        </Button>
      </div>
    );
  if (!query.data)
    return (
      <div aria-busy className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className={rowClass} />
        ))}
      </div>
    );
  if (!query.data.length)
    return <div className="border border-dashed px-6 py-10 text-center text-muted-foreground">{empty}</div>;
  return <>{children(query.data)}</>;
}

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border bg-card p-5", className)} {...props} />;
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
