import { InfoCard, PageShell } from "@/components/page-shell";
import { pageMetadata } from "@/lib/metadata";
import { images } from "@/lib/site";

export const metadata = pageMetadata({
  title: "다음세대 | 엘센트로 한인교회",
  description: "어린이와 청소년을 위한 다음세대 사역.",
  ogDescription: "Children and youth ministry.",
});

export default function NextGenerationPage() {
  return (
    <PageShell titleKo="다음세대" titleEn="Next Generation" eyebrow="Next Generation" image={images.hero1}>
      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard titleKo="주일학교" titleEn="Sunday School" ko="어린이들이 말씀 안에서 즐겁게 자라도록 돕습니다." en="Helping children grow joyfully in the Word." />
        <InfoCard titleKo="청소년부" titleEn="Youth Group" ko="청소년들이 믿음의 정체성을 세워가는 공동체입니다." en="A community where teens build their identity in faith." />
      </div>
    </PageShell>
  );
}
