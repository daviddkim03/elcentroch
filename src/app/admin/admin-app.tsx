"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HeroSlide } from "@/lib/site";
import { supabase } from "@/lib/supabase";
import { useHeroSlides } from "@/lib/use-hero-slides";

export function AdminApp() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) return setUserId(null);
    const sb = supabase;
    const check = async (id: string | null) => {
      setUserId(id);
      if (!id) return setIsAdmin(false);
      const { data } = await sb.rpc("has_role", { _user_id: id, _role: "admin" });
      setIsAdmin(!!data);
    };
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setTimeout(() => check(session?.user.id ?? null), 0);
    });
    sb.auth.getUser().then(({ data }) => check(data.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="flex items-center justify-between bg-ink px-6 py-4 text-ink-foreground">
        <Link href="/" className="font-serif font-bold">
          엘센트로 한인교회 · 관리자
        </Link>
        {userId && (
          <button className="text-sm opacity-80" onClick={() => supabase?.auth.signOut()}>
            로그아웃
          </button>
        )}
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        {userId === undefined ? null : userId ? (
          isAdmin ? (
            <SlideManager />
          ) : (
            <p className="text-center text-muted-foreground">
              관리자 권한이 없습니다. (Admin access required)
            </p>
          )
        ) : (
          <LoginForm />
        )}
      </main>
    </div>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!supabase) return toast.error("Supabase is not configured");
        setBusy(true);
        const { error } =
          mode === "in"
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: `${window.location.origin}/admin` },
              });
        setBusy(false);
        if (error) return toast.error(error.message);
        if (mode === "up") toast.success("확인 이메일을 보냈습니다. 이메일을 확인해 주세요.");
      }}
      className="mx-auto max-w-sm space-y-4 bg-card p-8 shadow"
    >
      <h1 className="text-2xl font-bold">{mode === "in" ? "관리자 로그인" : "관리자 계정 만들기"}</h1>
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <Button className="w-full" disabled={busy}>
        {mode === "in" ? "로그인" : "가입"}
      </Button>
      <button
        type="button"
        className="w-full text-sm text-muted-foreground"
        onClick={() => setMode(mode === "in" ? "up" : "in")}
      >
        {mode === "in" ? "계정 만들기" : "로그인으로 돌아가기"}
      </button>
    </form>
  );
}

function SlideManager() {
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
      toast.success("업로드 완료");
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
    if (!window.confirm("이 슬라이드를 삭제할까요?")) return;
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
          <h1 className="text-3xl font-bold">메인 슬라이드 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">슬라이드가 없으면 기본 이미지가 표시됩니다.</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          <span className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
            {uploading ? "업로드 중..." : "+ 이미지 추가"}
          </span>
        </label>
      </div>
      <div className="mt-8 space-y-4">
        {slides.map((s, i) => (
          <div key={s.id} className="grid gap-4 bg-card p-4 shadow-sm md:grid-cols-[200px_1fr_auto]">
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
