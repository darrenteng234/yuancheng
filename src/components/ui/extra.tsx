import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldCheck, Camera, Video, MapPinned, SearchX, Lock } from "lucide-react";
import type { OrderStatus } from "@/types/platform";
import { statusLabel, statusTone } from "@/lib/status";

/** Page + section headers (consistent typographic hierarchy). */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  );
}
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="section-header-row">
      <h2>{title}</h2>
      {action}
    </div>
  );
}

/** Order status badge — human label + tone (never a raw enum string). */
export function OrderStatusBadge({ status, locale = "en" }: { status: OrderStatus; locale?: string }) {
  return <span className={`sbadge sbadge--${statusTone(status)}`}>{statusLabel(status, locale)}</span>;
}

export function VerificationBadge({ verified, label }: { verified?: boolean; label?: string }) {
  if (!verified) return null;
  return <span className="sbadge sbadge--success"><ShieldCheck size={13} /> {label ?? "Verified provider"}</span>;
}

export function EvidenceBadge({ evidence, locale = "en" }: { evidence: "none" | "photo" | "photo_video"; locale?: string }) {
  if (evidence === "none") return null;
  const zh = locale === "zh";
  return (
    <span className="sbadge sbadge--muted">
      {evidence === "photo_video" ? <Video size={13} /> : <Camera size={13} />}
      {evidence === "photo_video" ? (zh ? "照片 + 视频" : "Photo + video") : (zh ? "照片" : "Photo")}
    </span>
  );
}

/** Shared empty-ish states. LoadingState/EmptyState/ErrorState live in Feedback. */
export function NotFoundState({ title, message, href, cta }: { title?: string; message?: string; href?: string; cta?: string }) {
  return (
    <div className="state-block">
      <SearchX size={32} className="state-icon" />
      <h3>{title ?? "Not found"}</h3>
      <p>{message ?? "The page you’re looking for doesn’t exist or has moved."}</p>
      <Link href={href ?? "/"} className="btn btn-secondary btn-sm">{cta ?? "Go back"}</Link>
    </div>
  );
}
export function UnauthorizedState({ title, message, href, cta }: { title?: string; message?: string; href?: string; cta?: string }) {
  return (
    <div className="state-block">
      <Lock size={32} className="state-icon" />
      <h3>{title ?? "Not authorized"}</h3>
      <p>{message ?? "You don’t have access to this area. Please sign in with the right account."}</p>
      {href ? <Link href={href} className="btn btn-primary btn-sm">{cta ?? "Sign in"}</Link> : null}
    </div>
  );
}

export function PlaceIndependenceNote({ locale = "en" }: { locale?: string }) {
  const zh = locale === "zh";
  return (
    <div className="independence-note">
      <MapPinned size={16} />
      <p>{zh
        ? "此处的服务商独立经营。场所仅标识服务相关或代办的位置，并不代表场所背书或授权。"
        : "Providers operate independently. The place identifies where the service is associated or fulfilled — not an endorsement or authorization by the place."}</p>
    </div>
  );
}
