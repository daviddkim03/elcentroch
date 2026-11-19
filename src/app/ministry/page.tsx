"use client";

import { InfoCard, PageShell } from "@/components/page-shell";
import { images } from "@/lib/site";

export default function MinistryPage() {
  return (
    <PageShell titleKo="사역" titleEn="Ministries" eyebrow="Ministries" image={images.hero3}>
      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard titleKo="중보기도" titleEn="Intercessory Prayer" ko="교회와 성도, 지역을 위해 함께 기도합니다." en="We pray together for the church, members, and our region." />
        <InfoCard titleKo="찬양사역" titleEn="Worship Team" ko="찬양으로 예배를 섬기는 사역입니다." en="Serving worship through music and praise." />
        <InfoCard titleKo="선교" titleEn="Missions" ko="국경 인근 지역과 열방을 향한 선교에 동참합니다." en="We join in missions near the border and to the nations." />
        <InfoCard titleKo="새가족 사역" titleEn="Newcomers" ko="새로 오신 분들이 교회에 잘 정착하도록 돕습니다." en="Helping newcomers settle into church life." />
      </div>
    </PageShell>
  );
}
