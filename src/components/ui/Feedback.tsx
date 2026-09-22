import React from "react";

type AlertTone = "info" | "success" | "warning" | "error";
export function Alert({ tone = "info", className = "", children, ...rest }:
  React.HTMLAttributes<HTMLDivElement> & { tone?: AlertTone }) {
  return <div role={tone === "error" ? "alert" : "status"} className={`alert alert-${tone} ${className}`} {...rest}>{children}</div>;
}

/** Inline loading indicator. */
export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <span className="ui-spinner" role="status" aria-label={label}>
      <span className="ui-spinner-dot" aria-hidden="true" />
    </span>
  );
}

/** Full-block loading state (lists, panels, tables). */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="ui-state" role="status">
      <Spinner label={label} />
      <p className="text-muted text-sm" style={{ marginTop: "var(--space-3)" }}>{label}</p>
    </div>
  );
}

/** Empty result state. */
export function EmptyState({ icon = "📭", title, description, action }:
  { icon?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="ui-state">
      <div style={{ fontSize: "var(--text-4xl)", marginBottom: "var(--space-3)" }} aria-hidden="true">{icon}</div>
      <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-1)" }}>{title}</h3>
      {description ? <p className="text-muted text-sm" style={{ maxWidth: "44ch", margin: "0 auto" }}>{description}</p> : null}
      {action ? <div style={{ marginTop: "var(--space-4)" }}>{action}</div> : null}
    </div>
  );
}

/** Error state with optional retry. */
export function ErrorState({ title = "Something went wrong", description, onRetry, retryLabel = "Try again" }:
  { title?: React.ReactNode; description?: React.ReactNode; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="ui-state" role="alert">
      <div style={{ fontSize: "var(--text-4xl)", marginBottom: "var(--space-3)" }} aria-hidden="true">⚠️</div>
      <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-1)" }}>{title}</h3>
      {description ? <p className="text-muted text-sm" style={{ maxWidth: "44ch", margin: "0 auto" }}>{description}</p> : null}
      {onRetry ? (
        <button className="btn btn-secondary btn-sm" style={{ marginTop: "var(--space-4)" }} onClick={onRetry}>{retryLabel}</button>
      ) : null}
    </div>
  );
}
