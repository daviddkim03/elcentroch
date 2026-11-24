"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLang } from "@/lib/i18n";

export function CommandMenu({
  open,
  setOpen,
  links,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  links: { to: string; ko: string; en: string }[];
}) {
  const { t } = useLang();
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Dialog.Content aria-describedby={undefined} className="fixed top-[15vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 border bg-popover shadow-lg">
          <Dialog.Title className="sr-only">{t("빠른 이동", "Go to")}</Dialog.Title>
          <Command>
            <Command.Input placeholder={t("어디로 갈까요?", "Where to?")} className="h-12 w-full border-b bg-transparent px-4 outline-none" />
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="p-4 text-center text-sm text-muted-foreground">{t("없습니다", "Nothing found")}</Command.Empty>
              {links.map((l) => (
                <Command.Item
                  key={l.to}
                  value={`${l.ko} ${l.en}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(l.to);
                  }}
                  className="flex h-10 cursor-pointer items-center rounded-md px-3 text-sm data-[selected=true]:bg-secondary"
                >
                  {t(l.ko, l.en)}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
