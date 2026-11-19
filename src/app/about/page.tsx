import { InfoCard, PageShell } from "@/components/page-shell";
import { T } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { images, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "교회소개 | 엘센트로 한인교회",
  description: "엘센트로 한인교회의 비전과 담임목사 소개.",
  ogDescription: "About El Centro Korean Church - vision and pastor.",
});

export default function AboutPage() {
  return (
    <PageShell titleKo="교회소개" titleEn="About Us" eyebrow="About" image={images.hero1}>
      <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="eyebrow">Senior Pastor</p>
          <h2 className="mt-3 text-3xl font-bold">
            <T ko={site.pastorKo} en={site.pastorEn} />
          </h2>
        </div>
        <p className="leading-loose text-muted-foreground">
          <T
            ko="엘센트로 한인교회를 찾아주신 여러분을 주님의 이름으로 환영합니다. 우리 교회는 말씀과 기도 위에 서서, 이민의 삶 가운데 서로의 위로와 힘이 되는 가족 같은 공동체입니다. 언제든지 편안한 마음으로 찾아오십시오."
            en="Welcome in the name of our Lord. Our church stands on the Word and prayer, a family-like community that comforts and strengthens one another through the immigrant journey. Please come as you are, anytime."
          />
        </p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        <InfoCard titleKo="예배하는 교회" titleEn="Worshipping" ko="하나님께 영광 돌리는 예배를 최우선으로 합니다." en="We put God-glorifying worship first." />
        <InfoCard titleKo="양육하는 교회" titleEn="Discipling" ko="말씀으로 성도를 세우고 제자로 자라게 합니다." en="We build up believers as disciples through the Word." />
        <InfoCard titleKo="섬기는 교회" titleEn="Serving" ko="지역 사회와 이웃을 그리스도의 사랑으로 섬깁니다." en="We serve our neighbors with the love of Christ." />
      </div>
    </PageShell>
  );
}
