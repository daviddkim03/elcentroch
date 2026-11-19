import { InfoCard, PageShell } from "@/components/page-shell";
import { T } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { images } from "@/lib/site";

export const metadata = pageMetadata({
  title: "예배와 말씀 | 엘센트로 한인교회",
  description: "주일예배 매주 일요일 오전 9시. 예배 시간 안내.",
  ogDescription: "Sunday service every Sunday at 9:00 AM.",
});

export default function WorshipPage() {
  return (
    <PageShell titleKo="예배와 말씀" titleEn="Worship & Word" eyebrow="Worship" image={images.hero2}>
      <h2 className="text-3xl font-bold">
        <T ko="예배 시간" en="Service Times" />
      </h2>
      <div className="mt-8 divide-y border-y">
        <div className="flex items-center justify-between py-6">
          <span className="font-serif text-xl font-bold">
            <T ko="주일예배" en="Sunday Service" />
          </span>
          <span className="text-lg text-muted-foreground">
            <T ko="일요일 오전 09:00" en="Sunday 9:00 AM" />
          </span>
        </div>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <InfoCard titleKo="주일 설교" titleEn="Sunday Sermons" ko="매 주일 선포되는 말씀으로 한 주를 살아갈 힘을 얻습니다." en="Receive strength for the week through the Word proclaimed each Sunday." />
        <InfoCard titleKo="처음 오신 분" titleEn="First Time?" ko="처음 방문하시는 분들을 따뜻하게 환영합니다. 예배 후 함께 교제의 시간을 가집니다." en="First-time guests are warmly welcomed. Join us for fellowship after the service." />
      </div>
    </PageShell>
  );
}
