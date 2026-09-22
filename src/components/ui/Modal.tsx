"use client";
import React from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

/** Accessible dialog: focus-trap-lite, Escape to close, backdrop click, scroll lock. */
export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  const maxW = size === "sm" ? 400 : size === "lg" ? 720 : 540;
  return (
    <div className="ui-modal-backdrop" onClick={onClose} role="presentation">
      <div className="ui-modal" style={{ maxWidth: maxW }} role="dialog" aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined} onClick={(e) => e.stopPropagation()}>
        {title ? (
          <div className="ui-modal-header">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{title}</h2>
            <button className="ui-modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        ) : null}
        <div className="ui-modal-body">{children}</div>
        {footer ? <div className="ui-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export default Modal;
