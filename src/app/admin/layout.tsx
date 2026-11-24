"use client";

import {
  Baby, BookOpen, CalendarCheck, CalendarDays, ClipboardList, Command as CommandIcon, HandCoins, Images, LayoutDashboard,
  Menu, Newspaper, ScrollText, UserPlus, Users, UsersRound, X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Notice } from "@/components/account-gate";
import { CommandMenu } from "@/components/command-menu";
import { LangToggle } from "@/components/lang-toggle";
import { LoginPanel } from "@/components/login-panel";
import { NavLink } from "@/components/nav-link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { portalOn, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { SlideManager } from "./slides/slide-manager";

const links = [
  { to: "/admin", icon: LayoutDashboard, ko: "대시보드", en: "Dashboard" },
  { to: "/admin/members", icon: Users, ko: "교인", en: "Members" },
  { to: "/admin/groups", icon: UsersRound, ko: "소그룹과 가정", en: "Groups & households" },
  { to: "/admin/attendance", icon: CalendarCheck, ko: "출석", en: "Attendance" },
  { to: "/admin/visits", icon: UserPlus, ko: "방문 문의", en: "Visitors" },
  { to: "/admin/news", icon: Newspaper, ko: "소식과 주보", en: "News & bulletins" },
  { to: "/admin/events", icon: CalendarDays, ko: "행사", en: "Events" },
  { to: "/admin/sermons", icon: BookOpen, ko: "설교", en: "Sermons" },
  { to: "/admin/serving", icon: ClipboardList, ko: "섬김", en: "Serving" },
  { to: "/admin/children", icon: Baby, ko: "주일학교", en: "Children" },
  { to: "/admin/giving", icon: HandCoins, ko: "헌금", en: "Giving" },
  { to: "/admin/slides", icon: Images, ko: "메인 슬라이드", en: "Home slides" },
  { to: "/admin/log", icon: ScrollText, ko: "접근 기록", en: "Access log", pastor: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const { userId, member, isStaff, isPastor, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState(false);
  // People who managed slides before the portal existed keep that access.
  const [slidesOnly, setSlidesOnly] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setSlidesOnly(undefined);
    if (!userId || !supabase) return;
    let stale = false;
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }).then(({ data }) => {
      if (!stale) setSlidesOnly(!!data);
    });
    return () => {
      stale = true;
    };
  }, [userId]);

  const visible = isStaff ? links.filter((l) => !l.pastor || isPastor) : [];

  let body: React.ReactNode;
  if (userId === null)
    body = <div className="px-4 py-16"><LoginPanel next="/admin" signUp={false} /></div>;
  else if (isStaff) body = children;
  else if (userId === undefined || (portalOn && member === undefined) || slidesOnly === undefined)
    body = (
      <div aria-busy className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-40" />
      </div>
    );
  else if (slidesOnly) body = <SlideManager />;
  else
    body = (
      <Notice title={t("관리자 권한이 없습니다", "Admin access required")} body={t("담임목사님께 문의해 주세요.", "Please ask the pastor.")}>
        {portalOn && (
          <Button asChild>
            <Link href="/my">{t("내 교회로", "Go to my page")}</Link>
          </Button>
        )}
        <Button variant="outline" onClick={signOut}>{t("로그아웃", "Sign out")}</Button>
      </Notice>
    );

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-ink px-4 text-ink-foreground print:hidden">
        {isStaff && (
          <button className="flex size-10 items-center justify-center lg:hidden" aria-label={t("메뉴", "Menu")} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        )}
        <Link href="/" className="truncate font-serif font-bold">{t(site.nameKo, site.nameEn)}</Link>
        <div className="ml-auto flex shrink-0 items-center gap-4 text-sm">
          {isStaff && (
            <button onClick={() => setCommand(true)} className="hidden items-center gap-1 opacity-80 hover:opacity-100 sm:flex">
              <CommandIcon className="size-3.5" />K
            </button>
          )}
          {isStaff && <Link href="/my" className="hidden opacity-80 hover:opacity-100 sm:block">{t("내 교회", "My page")}</Link>}
          <LangToggle light />
          {userId && (
            <button onClick={signOut} className="opacity-80 hover:opacity-100">{t("로그아웃", "Sign out")}</button>
          )}
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl">
        {isStaff && (
          <nav
            className={cn(
              "fixed inset-x-0 top-14 bottom-0 z-30 overflow-y-auto border-r bg-background p-3 lg:sticky lg:block lg:h-[calc(100dvh-3.5rem)] lg:w-60 lg:shrink-0 print:hidden",
              !open && "hidden"
            )}
          >
            {visible.map((l) => (
              <NavLink
                key={l.to}
                href={l.to}
                onClick={() => setOpen(false)}
                className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeClassName="bg-secondary !text-foreground font-medium"
              >
                <l.icon className="size-4" />
                {t(l.ko, l.en)}
              </NavLink>
            ))}
          </nav>
        )}
        <main className={cn("min-w-0 flex-1 px-5 py-8 lg:px-10", !isStaff && "mx-auto max-w-4xl")}>{body}</main>
      </div>
      {isStaff && <CommandMenu open={command} setOpen={setCommand} links={visible} />}
    </div>
  );
}
