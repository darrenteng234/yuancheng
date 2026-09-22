"use client";
import { useEffect } from "react";

/** Sets <html lang> dynamically for the active customer locale. */
export function LangSetter({ lang }: { lang: string }) {
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return null;
}
