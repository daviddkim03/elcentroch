"use client";

import { PageTitle } from "@/components/data-view";
import { RecordForm, type Field } from "@/components/record-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { db, useAct } from "@/lib/data";
import { useLang } from "@/lib/i18n";

const fields: Field[] = [
  { name: "name_ko", ko: "이름", en: "Name", required: true, max: 80, half: true },
  { name: "name_en", ko: "영어 이름", en: "English name", max: 80, half: true },
  { name: "phone", ko: "전화번호", en: "Phone", type: "tel", max: 40, half: true },
  { name: "email", ko: "연락 이메일", en: "Contact email", type: "email", half: true },
  { name: "address", ko: "주소", en: "Address", max: 300 },
  { name: "birthday", ko: "생일", en: "Birthday", type: "date" },
  { name: "directory_listed", ko: "교인 주소록에 내 이름 보이기", en: "List my name in the directory", type: "checkbox" },
  { name: "directory_phone", ko: "전화번호도 보이기", en: "Also show my phone", type: "checkbox" },
  { name: "directory_email", ko: "이메일도 보이기", en: "Also show my email", type: "checkbox" },
  { name: "directory_address", ko: "주소도 보이기", en: "Also show my address", type: "checkbox" },
];

export function ProfilePage() {
  const { t } = useLang();
  const { member, refresh, signOut } = useAuth();
  const act = useAct();
  return (
    <>
      <PageTitle title={t("내 정보", "My profile")} sub={member!.church_title ?? undefined} />
      <RecordForm
        fields={fields}
        values={member}
        onSubmit={async (v) => {
          if (await act(db().from("members").update(v).eq("id", member!.id), "저장했습니다", "Saved")) await refresh();
        }}
      >
        <Button type="button" variant="outline" onClick={signOut}>
          {t("로그아웃", "Sign out")}
        </Button>
      </RecordForm>
    </>
  );
}
