import { useEffect, useState } from "react";

export type UiLang = "id" | "en";

const STORAGE_KEY = "martabak-ui-lang";

const detectBrowserLanguage = (): UiLang => {
  if (typeof navigator === "undefined") return "id";
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "id";
};

export const useUiLanguage = () => {
  const [uiLang, setUiLang] = useState<UiLang>(() => {
    if (typeof window === "undefined") return "id";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "id" || saved === "en") return saved;
    return detectBrowserLanguage();
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, uiLang);
    document.documentElement.lang = uiLang;
  }, [uiLang]);

  return { uiLang, setUiLang };
};
