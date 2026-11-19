"use client";

import { LuHouse, LuMegaphone, LuUsers, LuUtensils } from "react-icons/lu";
import { InfoCard, PageShell } from "@/components/page-shell";
import { images } from "@/lib/site";

export default function CommunityPage() {
  return (
    <PageShell
      titleKo="커뮤니티"
      titleEn="Community"
      eyebrow="Community"
      image={images.hero2}
      introKo="삶을 나누고 서로를 세워가는 공동체"
      introEn="Sharing life and building one another up"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard icon={LuUsers} titleKo="소그룹 모임" titleEn="Small Groups" ko="삶을 나누고 서로를 위해 기도하는 소그룹입니다." en="Small groups to share life and pray for one another." />
        <InfoCard icon={LuUtensils} titleKo="친교" titleEn="Fellowship" ko="예배 후 함께 식사하며 교제합니다." en="We share a meal and fellowship after service." />
        <InfoCard icon={LuMegaphone} titleKo="교회 소식" titleEn="Church News" ko="교회의 행사와 소식을 전해 드립니다." en="Updates on church events and news." />
        <InfoCard icon={LuHouse} titleKo="지역 섬김" titleEn="Local Outreach" ko="임페리얼 밸리 지역 사회를 섬깁니다." en="Serving the Imperial Valley community." />
      </div>
    </PageShell>
  );
}
