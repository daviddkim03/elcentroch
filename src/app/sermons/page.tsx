import { PageShell } from "@/components/page-shell";
import { SermonArchive } from "@/components/public-feed";
import { pageMetadata } from "@/lib/metadata";
import { images, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "설교 | 엘센트로 한인교회",
  description: "엘센트로 한인교회 설교 영상.",
  ogDescription: "Sermons from El Centro Korean Church.",
});

export default function SermonsPage() {
  return (
    <PageShell titleKo="설교" titleEn="Sermons" eyebrow="Sermons" image={images.hero2}>
      <iframe
        title="YouTube"
        src={site.youtubeLatest}
        className="aspect-video w-full border-0 bg-ink"
        loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <a href={site.youtubeUrl} target="_blank" rel="noreferrer" className="mt-6 inline-block border-b-2 border-gold pb-1 font-medium">
        YouTube {site.youtubeHandle}
      </a>
      <SermonArchive />
    </PageShell>
  );
}
