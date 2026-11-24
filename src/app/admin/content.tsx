"use client";

import { Badge } from "@/components/ui/badge";
import { Crud } from "@/components/crud";
import { db, today, useAct, useFormat } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import type { Announcement, Group, Household, Sermon } from "@/lib/types";
import { usePeople } from "@/lib/use-people";

export function GroupsPage() {
  const { t } = useLang();
  const people = usePeople();
  return (
    <div className="space-y-16">
      <Crud<Group>
        table="groups"
        title={t("소그룹", "Small groups")}
        sub={t("교인을 소그룹에 넣으려면 교인 화면에서 수정하세요.", "Place people in a group from the Members page.")}
        order="name_ko"
        ascending
        empty={t("아직 소그룹이 없습니다.", "No groups yet.")}
        fields={[
          { name: "name_ko", ko: "이름", en: "Name", required: true, max: 80, half: true },
          { name: "name_en", ko: "영어 이름", en: "English name", max: 80, half: true },
          { name: "leader_id", ko: "인도자", en: "Leader", type: "select", options: people },
          { name: "meeting", ko: "모임 시간", en: "Meeting time" },
          { name: "location", ko: "장소", en: "Location" },
        ]}
        row={(g) => (
          <>
            <p className="font-medium">{t(g.name_ko, g.name_en ?? g.name_ko)}</p>
            <p className="text-sm text-muted-foreground">
              {[people.find((p) => p.value === g.leader_id)?.label, g.meeting, g.location].filter(Boolean).join(" · ")}
            </p>
          </>
        )}
      />
      <Crud<Household>
        table="households"
        title={t("가정", "Households")}
        sub={t("같은 가정의 어른은 자녀 정보를 함께 봅니다.", "Adults in one household share their children's details.")}
        order="name"
        ascending
        empty={t("아직 가정이 없습니다.", "No households yet.")}
        fields={[{ name: "name", ko: "가정 이름", en: "Household name", required: true, max: 100 }]}
        row={(h) => <p className="font-medium">{h.name}</p>}
      />
    </div>
  );
}

export function NewsAdmin() {
  const { t } = useLang();
  const f = useFormat();
  const act = useAct();
  return (
    <Crud<Announcement>
      table="announcements"
      title={t("소식과 주보", "News & bulletins")}
      order="published_on"
      empty={t("첫 소식을 올려 보세요.", "Post your first announcement.")}
      fields={[
        {
          name: "kind", ko: "종류", en: "Type", type: "select", required: true, default: "news", half: true,
          options: [{ value: "news", label: t("소식", "News") }, { value: "bulletin", label: t("주보", "Bulletin") }],
        },
        { name: "published_on", ko: "날짜", en: "Date", type: "date", required: true, default: today(), half: true },
        { name: "title_ko", ko: "제목", en: "Title (Korean)", required: true },
        { name: "title_en", ko: "영어 제목", en: "Title (English)" },
        { name: "body_ko", ko: "내용", en: "Text (Korean)", type: "textarea", max: 10000 },
        { name: "body_en", ko: "영어 내용", en: "Text (English)", type: "textarea", max: 10000 },
        { name: "file", ko: "파일 (PDF 또는 사진)", en: "File (PDF or image)", type: "file", hint: t("로그인한 교인만 파일을 열 수 있습니다.", "Only signed-in members can open files.") },
        { name: "pinned", ko: "맨 위에 고정", en: "Pin to top", type: "checkbox" },
        { name: "is_public", ko: "홈페이지에도 공개", en: "Also show on the public site", type: "checkbox" },
      ]}
      prepare={async ({ file, ...v }) => {
        if (!(file instanceof File)) return v;
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_").slice(-80)}`;
        return (await act(db().storage.from("church-files").upload(path, file))) ? { ...v, file_path: path } : null;
      }}
      row={(a) => (
        <>
          <p className="truncate font-medium">{t(a.title_ko, a.title_en ?? a.title_ko)}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {f.day(a.published_on)}
            {a.kind === "bulletin" && <Badge>{t("주보", "Bulletin")}</Badge>}
            {a.pinned && <Badge tone="wait">{t("고정", "Pinned")}</Badge>}
            {a.is_public && <Badge tone="good">{t("공개", "Public")}</Badge>}
          </p>
        </>
      )}
    />
  );
}

export function SermonsAdmin() {
  const { t } = useLang();
  const f = useFormat();
  return (
    <Crud<Sermon>
      table="sermons"
      title={t("설교", "Sermons")}
      sub={t("홈페이지에 공개됩니다.", "Shown on the public site.")}
      order="preached_on"
      empty={t("첫 설교를 등록해 보세요.", "Add the first sermon.")}
      fields={[
        { name: "title_ko", ko: "제목", en: "Title (Korean)", required: true },
        { name: "title_en", ko: "영어 제목", en: "Title (English)" },
        { name: "preached_on", ko: "날짜", en: "Date", type: "date", required: true, default: today(), half: true },
        { name: "scripture", ko: "본문", en: "Scripture", half: true },
        { name: "preacher", ko: "설교자", en: "Preacher", max: 80 },
        { name: "youtube_id", ko: "유튜브 주소", en: "YouTube link", type: "youtube" },
      ]}
      row={(s) => (
        <>
          <p className="truncate font-medium">{t(s.title_ko, s.title_en ?? s.title_ko)}</p>
          <p className="text-sm text-muted-foreground">{[f.day(s.preached_on), s.scripture, s.preacher].filter(Boolean).join(" · ")}</p>
        </>
      )}
    />
  );
}
