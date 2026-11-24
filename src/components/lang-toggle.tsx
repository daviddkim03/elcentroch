"use client";

import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle({ light }: { light: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={cn(
        "flex items-center rounded-full border text-xs font-medium",
        light ? "border-ink-foreground/40" : "border-border"
      )}
    >
      {(["ko", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-3 py-1 transition-colors",
            lang === l && "bg-accent text-accent-foreground"
          )}
        >
          {l === "ko" ? "한국어" : "EN"}
        </button>
      ))}
    </div>
  );
}
