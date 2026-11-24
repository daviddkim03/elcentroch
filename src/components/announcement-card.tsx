"use client";

import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db, useAct, useFormat } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Announcement } from "@/lib/types";
import { Card } from "./data-view";

export function AnnouncementCard({ a }: { a: Announcement }) {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  const body = t(a.body_ko ?? "", a.body_en ?? a.body_ko ?? "");

  const openFile = async () => {
    // Open the tab during the tap; phones block tabs opened after a wait.
    const tab = window.open("", "_blank");
    const res = await db().storage.from("church-files").createSignedUrl(a.file_path!, 300);
    if ((await act(Promise.resolve(res))) && res.data && tab) tab.location.href = res.data.signedUrl;
    else tab?.close();
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {a.pinned && <Badge tone="wait">{t("중요", "Pinned")}</Badge>}
        {a.kind === "bulletin" && <Badge>{t("주보", "Bulletin")}</Badge>}
        <span>{f.day(a.published_on)}</span>
      </div>
      <h2 className="mt-2 text-lg font-bold">{t(a.title_ko, a.title_en ?? a.title_ko)}</h2>
      {body && <p className="mt-2 leading-relaxed break-words whitespace-pre-line text-muted-foreground">{body}</p>}
      {a.file_path && (
        <Button variant="outline" className="mt-4 h-11" onClick={openFile}>
          <FileText /> {t("파일 보기", "Open file")}
        </Button>
      )}
    </Card>
  );
}
