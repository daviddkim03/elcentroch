"use client";

import { useState } from "react";
import { RecordForm } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { db, useAct } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { portalOn } from "@/lib/supabase";

const fields = [
  { name: "name", ko: "이름", en: "Name", required: true, max: 80 },
  { name: "contact", ko: "전화 또는 이메일", en: "Phone or email", required: true, max: 200 },
  { name: "message", ko: "남기실 말씀", en: "Message", type: "textarea" as const, max: 2000 },
];

export function VisitForm() {
  const { t } = useLang();
  const act = useAct();
  const [sent, setSent] = useState(false);
  const [trap, setTrap] = useState("");

  if (!portalOn)
    return (
      <div className="flex items-center border bg-card p-8">
        <Button asChild className="h-11">
          <a href={`tel:${site.phone}`}>{t("전화하기", "Call us")}</a>
        </Button>
      </div>
    );
  if (sent)
    return (
      <p role="status" className="border bg-card p-8 text-lg">
        {t("감사합니다. 곧 연락드리겠습니다.", "Thank you. We will be in touch soon.")}
      </p>
    );
  return (
    <div className="border bg-card p-8">
      {/* People never see this field; bots fill it in. */}
      <input className="hidden" tabIndex={-1} autoComplete="off" aria-hidden name="website" value={trap} onChange={(e) => setTrap(e.target.value)} />
      <RecordForm
        fields={fields}
        submitLabel={t("보내기", "Send")}
        onSubmit={async (v) => {
          if (trap) return setSent(true);
          const p = db().rpc("submit_visit", { p_name: v.name, p_contact: v.contact, p_message: v.message ?? "" });
          if (await act(p)) setSent(true);
        }}
      />
    </div>
  );
}
