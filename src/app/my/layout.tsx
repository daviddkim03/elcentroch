"use client";

import { CalendarDays, House, MessageCircleHeart, User, Users } from "lucide-react";
import Link from "next/link";
import { AccountGate } from "@/components/account-gate";
import { LangToggle } from "@/components/lang-toggle";
import { NavLink } from "@/components/nav-link";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { site } from "@/lib/site";

const tabs = [
  { to: "/my", icon: House, ko: "홈", en: "Home" },
  { to: "/my/prayer", icon: MessageCircleHeart, ko: "기도", en: "Prayer" },
  { to: "/my/events", icon: CalendarDays, ko: "행사", en: "Events" },
  { to: "/my/directory", icon: Users, ko: "교인", en: "People" },
  { to: "/my/profile", icon: User, ko: "내 정보", en: "Profile" },
];

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const { active, isStaff } = useAuth();
  return (
    <div className="min-h-dvh bg-background text-[17px]">
      <header className="sticky top-0 z-40 border-b bg-background print:hidden">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-5">
          <Link href="/" className="truncate font-serif font-bold">
            {t(site.nameKo, site.nameEn)}
          </Link>
          <div className="flex shrink-0 items-center gap-4">
            {isStaff && (
              <Link href="/admin" className="py-2 text-sm font-medium hover:text-gold">
                {t("관리", "Admin")}
              </Link>
            )}
            <LangToggle light={false} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl pb-28">
        <AccountGate>
          <div className="px-5 py-8">{children}</div>
        </AccountGate>
      </main>
      {active && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background print:hidden pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto grid max-w-3xl grid-cols-5">
            {tabs.map((x) => (
              <NavLink
                key={x.to}
                href={x.to}
                className="flex h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors"
                activeClassName="!text-foreground font-bold"
              >
                <x.icon className="size-5" />
                {t(x.ko, x.en)}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
