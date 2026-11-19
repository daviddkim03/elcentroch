"use client";

import { LuClock, LuMic, LuSmile } from "react-icons/lu";
import { InfoCard, PageShell, SectionHeading } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLang } from "@/lib/i18n";
import { images } from "@/lib/site";

export default function WorshipPage() {
  const { t } = useLang();
  return (
    <PageShell
      titleKo="예배와 말씀"
      titleEn="Worship & Word"
      eyebrow="Worship"
      image={images.hero2}
      introKo="매주 일요일 오전 9시, 함께 예배합니다"
      introEn="We worship together every Sunday at 9:00 AM"
    >
      <SectionHeading eyebrow="Service Times" ko="예배 시간" en="Service Times" />
      <Card className="mt-8 gap-0 py-0">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-secondary">
              <LuClock className="size-5" />
            </span>
            <div>
              <p className="font-serif text-xl font-bold">{t("주일예배", "Sunday Service")}</p>
              <p className="text-sm text-muted-foreground">{t("본당", "Main sanctuary")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{t("매주", "Weekly")}</Badge>
            <span className="text-lg font-medium">{t("일요일 오전 09:00", "Sunday 9:00 AM")}</span>
          </div>
        </div>
      </Card>

      <div className="mt-16 grid gap-5 md:grid-cols-2">
        <InfoCard icon={LuMic} titleKo="주일 설교" titleEn="Sunday Sermons" ko="매 주일 선포되는 말씀으로 한 주를 살아갈 힘을 얻습니다." en="Receive strength for the week through the Word proclaimed each Sunday." />
        <InfoCard icon={LuSmile} titleKo="처음 오신 분" titleEn="First Time?" ko="처음 방문하시는 분들을 따뜻하게 환영합니다. 예배 후 함께 교제의 시간을 가집니다." en="First-time guests are warmly welcomed. Join us for fellowship after the service." />
      </div>
    </PageShell>
  );
}
