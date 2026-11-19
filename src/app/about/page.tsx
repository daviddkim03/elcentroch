"use client";

import { LuBookOpen, LuHandHeart, LuSparkles } from "react-icons/lu";
import { InfoCard, PageShell, SectionHeading } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/lib/i18n";
import { images, site } from "@/lib/site";

export default function AboutPage() {
  const { t } = useLang();
  return (
    <PageShell
      titleKo="교회소개"
      titleEn="About Us"
      eyebrow="About"
      image={images.hero1}
      introKo="말씀과 기도 위에 선 가족 같은 공동체"
      introEn="A family-like community built on the Word and prayer"
    >
      <Card className="py-0">
        <CardContent className="grid gap-10 p-8 md:grid-cols-[1fr_2fr] md:p-12">
          <div>
            <p className="eyebrow text-muted-foreground">Senior Pastor</p>
            <h2 className="mt-3 text-3xl font-bold">{t(site.pastorKo, site.pastorEn)}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t(site.nameKo, site.nameEn)}</p>
          </div>
          <blockquote className="border-l-2 pl-6 text-[17px] leading-loose text-muted-foreground">
            {t(
              "엘센트로 한인교회를 찾아주신 여러분을 주님의 이름으로 환영합니다. 우리 교회는 말씀과 기도 위에 서서, 이민의 삶 가운데 서로의 위로와 힘이 되는 가족 같은 공동체입니다. 언제든지 편안한 마음으로 찾아오십시오.",
              "Welcome in the name of our Lord. Our church stands on the Word and prayer, a family-like community that comforts and strengthens one another through the immigrant journey. Please come as you are, anytime."
            )}
          </blockquote>
        </CardContent>
      </Card>

      <div className="mt-20">
        <SectionHeading eyebrow="Our Values" ko="우리가 추구하는 교회" en="What we value" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <InfoCard icon={LuSparkles} titleKo="예배하는 교회" titleEn="Worshipping" ko="하나님께 영광 돌리는 예배를 최우선으로 합니다." en="We put God-glorifying worship first." />
          <InfoCard icon={LuBookOpen} titleKo="양육하는 교회" titleEn="Discipling" ko="말씀으로 성도를 세우고 제자로 자라게 합니다." en="We build up believers as disciples through the Word." />
          <InfoCard icon={LuHandHeart} titleKo="섬기는 교회" titleEn="Serving" ko="지역 사회와 이웃을 그리스도의 사랑으로 섬깁니다." en="We serve our neighbors with the love of Christ." />
        </div>
      </div>
    </PageShell>
  );
}
