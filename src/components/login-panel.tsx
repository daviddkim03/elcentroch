"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAct } from "@/lib/data";
import { withBasePath } from "@/lib/base-path";
import { useLang } from "@/lib/i18n";
import { enabledProviders, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Mode = "in" | "up" | "link" | "forgot";

export function LoginPanel({ next, signUp = true }: { next: "/my" | "/admin"; signUp?: boolean }) {
  const { t } = useLang();
  const act = useAct();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    enabledProviders().then(setProviders);
  }, []);

  if (!supabase) return <p className="text-center text-muted-foreground">{t("로그인이 설정되지 않았습니다.", "Login is not set up.")}</p>;
  const auth = supabase.auth;
  // Trailing slash: the exact page URL (next.config.ts), so no redirect is needed.
  const back = () => window.location.origin + withBasePath(`${next}/`);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const sent = ["이메일을 보냈습니다. 메일함을 확인해 주세요.", "Email sent. Please check your inbox."] as const;
    if (mode === "in") await act(auth.signInWithPassword({ email, password }));
    if (mode === "up") {
      const { data, error } = await auth.signUp({ email, password, options: { emailRedirectTo: back() } });
      if (await act(Promise.resolve({ error }))) if (!data.session) toast.success(t(...sent));
    }
    if (mode === "link")
      await act(auth.signInWithOtp({ email, options: { emailRedirectTo: back(), shouldCreateUser: signUp } }), ...sent);
    if (mode === "forgot")
      await act(auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + withBasePath("/login/") }), ...sent);
    setBusy(false);
  };

  const title = {
    in: t("로그인", "Sign in"),
    up: t("계정 만들기", "Create account"),
    link: t("이메일 링크로 로그인", "Sign in by email link"),
    forgot: t("비밀번호 재설정", "Reset password"),
  }[mode];
  const social = [
    { id: "kakao" as const, label: t("카카오로 계속하기", "Continue with Kakao") },
    { id: "google" as const, label: t("Google로 계속하기", "Continue with Google") },
  ].filter((p) => providers[p.id]);
  const other = (m: Mode, label: string) =>
    m !== mode && (
      <button type="button" onClick={() => setMode(m)} className="py-2 text-sm text-muted-foreground hover:text-foreground">
        {label}
      </button>
    );

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-sm border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-bold">{title}</h1>
      {mode === "up" && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t("가입 후 담임목사님의 승인을 받으면 이용할 수 있습니다.", "The pastor approves each account before it can be used.")}
        </p>
      )}
      <div className="mt-6 space-y-4">
        {social.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant="outline"
            className="h-11 w-full"
            onClick={() => act(auth.signInWithOAuth({ provider: p.id, options: { redirectTo: back() } }))}
          >
            {p.label}
          </Button>
        ))}
        <div className="space-y-2">
          <Label htmlFor="login-email">{t("이메일", "Email")}</Label>
          <Input id="login-email" type="email" autoComplete="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {(mode === "in" || mode === "up") && (
          <div className="space-y-2">
            <Label htmlFor="login-password">{t("비밀번호", "Password")}</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "up" ? 8 : undefined}
            />
          </div>
        )}
        <Button className="h-11 w-full" disabled={busy}>
          {mode === "link" || mode === "forgot" ? t("이메일 보내기", "Send email") : title}
        </Button>
      </div>
      <div className={cn("mt-4 flex flex-col items-center")}>
        {other("in", t("비밀번호로 로그인", "Sign in with password"))}
        {other("link", t("비밀번호 없이 이메일 링크로 로그인", "Email me a sign-in link instead"))}
        {mode === "in" && other("forgot", t("비밀번호를 잊으셨나요?", "Forgot your password?"))}
        {signUp && other("up", t("처음이신가요? 계정 만들기", "New here? Create an account"))}
      </div>
    </form>
  );
}

export function NewPasswordForm({ onDone }: { onDone: () => void }) {
  const { t } = useLang();
  const act = useAct();
  const [password, setPassword] = useState("");
  return (
    <form
      className="mx-auto w-full max-w-sm space-y-4 border bg-card p-8 shadow-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await act(supabase!.auth.updateUser({ password }), "비밀번호를 바꿨습니다", "Password changed")) onDone();
      }}
    >
      <h1 className="text-2xl font-bold">{t("새 비밀번호", "New password")}</h1>
      <Label htmlFor="new-password">{t("8자 이상", "At least 8 characters")}</Label>
      <Input id="new-password" type="password" autoComplete="new-password" className="h-11" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button className="h-11 w-full">{t("저장", "Save")}</Button>
    </form>
  );
}
