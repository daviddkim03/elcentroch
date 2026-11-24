"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginPanel, NewPasswordForm } from "@/components/login-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { openedFromRecoveryLink, portalOn } from "@/lib/supabase";

export function LoginPage() {
  const { t } = useLang();
  const { userId } = useAuth();
  const router = useRouter();
  const [recovering, setRecovering] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRecovering(openedFromRecoveryLink);
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && userId && !recovering) router.replace("/my");
  }, [ready, userId, recovering, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-secondary px-4 pt-32 pb-20">
        {!portalOn ? (
          <p className="text-center text-muted-foreground">
            {t("교인 로그인은 준비 중입니다.", "Member login is coming soon.")}{" "}
            <Link href="/" className="underline">
              {t("홈으로", "Home")}
            </Link>{" "}
            · {site.phone}
          </p>
        ) : recovering && userId ? (
          <NewPasswordForm onDone={() => setRecovering(false)} />
        ) : userId === null ? (
          <LoginPanel next="/my" />
        ) : (
          <div className="h-96 w-full max-w-sm" />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
