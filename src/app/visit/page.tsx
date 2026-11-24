import { InfoCard, PageShell } from "@/components/page-shell";
import { T } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { images, site } from "@/lib/site";
import { VisitForm } from "./visit-form";

export const metadata = pageMetadata({
  title: "처음 오신 분 | 엘센트로 한인교회",
  description: "엘센트로 한인교회에 처음 오시는 분을 위한 안내.",
  ogDescription: "Plan your first visit to El Centro Korean Church.",
});

export default function VisitPage() {
  return (
    <PageShell titleKo="처음 오신 분" titleEn="Plan a Visit" eyebrow="Welcome" image={images.hero3}>
      <div className="grid gap-6 md:grid-cols-3">
        <InfoCard titleKo="언제" titleEn="When" ko="주일예배는 매주 일요일 오전 9시입니다." en="Sunday service is every Sunday at 9:00 AM." />
        <InfoCard titleKo="어디서" titleEn="Where" ko={site.address} en={site.address} />
        <InfoCard titleKo="예배 후" titleEn="After service" ko="예배 후 함께 식사하며 교제합니다." en="We share a meal and fellowship after service." />
      </div>
      <div className="mt-10 overflow-hidden border">
        <iframe title="map" src={site.mapEmbed} className="h-80 w-full border-0" loading="lazy" />
      </div>
      <div className="mt-16 grid gap-10 md:grid-cols-[1fr_1.5fr]">
        <div>
          <h2 className="text-3xl font-bold">
            <T ko="미리 알려 주세요" en="Let us know you're coming" />
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            <T
              ko="궁금한 점이나 자녀와 함께 오시는지 등을 남겨 주시면 연락드리겠습니다."
              en="Ask a question or tell us if you are bringing children, and we will get back to you."
            />
          </p>
          <a href={`tel:${site.phone}`} className="mt-4 inline-block font-medium underline underline-offset-4">
            {site.phone}
          </a>
        </div>
        <VisitForm />
      </div>
    </PageShell>
  );
}
