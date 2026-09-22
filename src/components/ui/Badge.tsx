import React from "react";

type Tone = "amber" | "brown" | "green" | "orange" | "red" | "gray";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}
export function Badge({ tone = "gray", className = "", children, ...rest }: BadgeProps) {
  return <span className={`badge badge-${tone} ${className}`} {...rest}>{children}</span>;
}

/**
 * Order/entity status → colored badge. Central map so status color is defined
 * once, not re-invented per page. Extend as the domain's status set grows.
 */
const STATUS_TONE: Record<string, Tone> = {
  // orders
  draft: "gray", pending_payment: "gray", payment_failed: "red", paid: "amber",
  accepted: "amber", unassigned: "gray", in_progress: "brown", evidence_submitted: "orange",
  in_review: "orange", under_review: "orange", completed: "green",
  cancelled: "gray", refunded: "gray", disputed: "red",
  // providers / skus
  active: "green", published: "green", inactive: "gray", archived: "gray",
  probation: "orange", suspended: "red", approved: "green", rejected: "red", pending: "amber",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = STATUS_TONE[status] ?? "gray";
  return <Badge tone={tone}>{label ?? status.replace(/_/g, " ")}</Badge>;
}

export default Badge;
