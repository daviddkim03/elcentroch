"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import type { HeroSlide } from "@/lib/site";
import { supabase } from "@/lib/supabase";
import { useHeroSlides } from "@/lib/use-hero-slides";

export function SlideManager() {
  const { t } = useLang();
  const { data: slides = [], refresh } = useHeroSlides();
  const [uploading, setUploading] = useState(false);
  const sb = supabase!;

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      let order = slides.length ? Math.max(...slides.map((s) => s.sort_order ?? 0)) + 1 : 0;
      for (const f of Array.from(files)) {
        const path = `${crypto.randomUUID()}-${f.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const up = await sb.storage.from("hero").upload(path, f);
        if (up.error) throw up.error;
        const signed = await sb.storage.from("hero").createSignedUrl(path, 315360000);
        if (signed.error) throw signed.error;
        const ins = await sb.from("hero_slides").insert({ image_url: signed.data.signedUrl, sort_order: order++ });
        if (ins.error) throw ins.error;
      }
      toast.success(t("업로드 완료", "Uploaded"));
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const update = async (id: string, patch: Partial<HeroSlide>) => {
    const { error } = await sb.from("hero_slides").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  };

  const remove = async (id: string) => {
    if (!window.confirm(t("이 슬라이드를 삭제할까요?", "Delete this slide?"))) return;
    const { error } = await sb.from("hero_slides").delete().eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  };

  const move = async (i: number, d: number) => {
    const a = slides[i];
    const b = slides[i + d];
    if (!a || !b) return;
    await sb.from("hero_slides").update({ sort_order: b.sort_order }).eq("id", a.id);
    await sb.from("hero_slides").update({ sort_order: a.sort_order }).eq("id", b.id);
    refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("메인 슬라이드", "Home slides")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("슬라이드가 없으면 기본 이미지가 표시됩니다.", "With no slides, the built-in images are shown.")}</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" multiple className="peer sr-only" onChange={(e) => upload(e.target.files)} />
          <span className="inline-flex h-10 items-center rounded-md bg-primary px-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring text-sm font-medium text-primary-foreground">
            {uploading ? t("업로드 중...", "Uploading...") : t("+ 이미지 추가", "+ Add images")}
          </span>
        </label>
      </div>
      <div className="mt-8 space-y-4">
        {slides.map((s, i) => (
          <div key={s.id} className="grid gap-4 border bg-card p-4 md:grid-cols-[200px_1fr_auto]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image_url} alt="" className="aspect-video w-full object-cover" />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input defaultValue={s.title_ko ?? ""} placeholder="제목 (한국어)" onBlur={(e) => update(s.id, { title_ko: e.target.value || null })} />
              <Input defaultValue={s.title_en ?? ""} placeholder="Title (English)" onBlur={(e) => update(s.id, { title_en: e.target.value || null })} />
              <Input defaultValue={s.subtitle_ko ?? ""} placeholder="부제목 (한국어)" onBlur={(e) => update(s.id, { subtitle_ko: e.target.value || null })} />
              <Input defaultValue={s.subtitle_en ?? ""} placeholder="Subtitle (English)" onBlur={(e) => update(s.id, { subtitle_en: e.target.value || null })} />
            </div>
            <div className="flex gap-1 md:flex-col">
              <Button size="icon" variant="outline" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <ArrowUp />
              </Button>
              <Button size="icon" variant="outline" onClick={() => move(i, 1)} disabled={i === slides.length - 1} aria-label="Move down">
                <ArrowDown />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => remove(s.id)} aria-label="Delete">
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
