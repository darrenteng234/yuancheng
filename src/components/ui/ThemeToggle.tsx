"use client";
import React from "react";

type Mode = "light" | "dark" | "system";
const KEY = "yc-theme";

function apply(mode: Mode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
}

/** Cycles light → dark → system. Persists per-viewer; safe if storage blocked. */
export function ThemeToggle() {
  const [mode, setMode] = React.useState<Mode>("system");
  React.useEffect(() => {
    try { const s = localStorage.getItem(KEY) as Mode | null; if (s) { setMode(s); apply(s); } } catch {}
  }, []);
  function next() {
    const order: Mode[] = ["light", "dark", "system"];
    const m = order[(order.indexOf(mode) + 1) % order.length];
    setMode(m); apply(m);
    try { localStorage.setItem(KEY, m); } catch {}
  }
  const icon = mode === "dark" ? "🌙" : mode === "light" ? "☀️" : "◐";
  return (
    <button className="btn btn-secondary btn-sm" onClick={next} aria-label={`Theme: ${mode}`} title={`Theme: ${mode}`}>
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

/** Inline script for <head>: applies stored theme before paint (no flash). */
export const themeInitScript =
  `(function(){try{var m=localStorage.getItem('${KEY}');if(m==='light'||m==='dark')document.documentElement.setAttribute('data-theme',m);}catch(e){}})();`;

export default ThemeToggle;
