"use client";
import React from "react";
import { waLink } from "@/lib/demo/contact";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE?.toLowerCase() === "true";

/**
 * WhatsApp action. Outside demo mode it is a normal wa.me link (unchanged).
 * In demo mode there is no real recipient, so it opens an in-page preview sheet
 * showing the exact prefilled message and sends nothing.
 */
export function WhatsAppAction({
  number, text, label, className, style, lang = "en",
}: {
  number: string; text: string; label: React.ReactNode;
  className?: string; style?: React.CSSProperties; lang?: "en" | "zh";
}) {
  const [open, setOpen] = React.useState(false);
  const zh = lang === "zh";

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!DEMO) {
    return (
      <a className={className} style={style} href={waLink(number, text)} target="_blank" rel="noreferrer">{label}</a>
    );
  }

  return (
    <>
      <button type="button" className={className} style={style} onClick={() => setOpen(true)}>{label}</button>
      {open ? (
        <div className="dialog-overlay" onClick={() => setOpen(false)}>
          <div className="dialog-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>{zh ? "WhatsApp 消息预览" : "WhatsApp message preview"}</h3>
            <p style={{ whiteSpace: "pre-wrap", background: "var(--color-surface-2)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", marginTop: "var(--space-3)" }}>{text}</p>
            <p className="text-muted" style={{ fontSize: "var(--text-sm)", marginTop: "var(--space-3)" }}>{zh ? "示范模式：不会实际发送" : "Demo mode: nothing is sent"}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>{zh ? "关闭" : "Close"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
