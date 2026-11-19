"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ko" | "en";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (ko: string, en: string) => string;
};

const LangContext = createContext<Ctx>({
  lang: "ko",
  setLang: () => {},
  t: (ko) => ko,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "ko") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  };

  return (
    <LangContext.Provider
      value={{ lang, setLang, t: (ko, en) => (lang === "ko" ? ko : en) }}
    >
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
