"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProvider, setProviderStatus } from "@/lib/platform-api";
import { Card, Button, StatusBadge, Badge, LoadingState, ErrorState, Alert } from "@/components/ui";
import type { Provider } from "@/types/platform";

export default function AdminProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [provider, setProvider] = React.useState<Provider | null>(null);
  const [msg, setMsg] = React.useState("");

  const load = React.useCallback(() => {
    setState("loading");
    getProvider(id).then((p) => { setProvider(p); setState("ready"); }).catch(() => setState("error"));
  }, [id]);
  React.useEffect(() => { load(); }, [load]);

  async function change(status: string) {
    setMsg("");
    try { await setProviderStatus(id, status); setMsg(`Provider ${status}.`); load(); }
    catch (e) { setMsg(e instanceof Error ? e.message : "Failed"); }
  }

  if (state === "loading") return <div style={{ padding: "var(--space-8)" }}><LoadingState /></div>;
  if (state === "error" || !provider) return <div style={{ padding: "var(--space-8)" }}><ErrorState onRetry={load} description="Provider not found." /></div>;

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: 720 }}>
      <Link href="/admin/providers" className="text-sm text-muted">← All providers</Link>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", margin: "var(--space-3) 0 var(--space-5)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>{provider.name}</h1>
        <StatusBadge status={provider.status} />
      </div>

      {msg ? <Alert tone="success" style={{ marginBottom: "var(--space-4)" }}>{msg}</Alert> : null}

      <Card>
        <Row label="Type"><Badge tone="gray">{provider.kind.replace(/_/g, " ")}</Badge></Row>
        <Row label="Fulfilment">{provider.fulfillment_mode}</Row>
        <Row label="Contact email">{provider.contact_email || "—"}</Row>
        <Row label="Contact phone">{provider.contact_phone || "—"}</Row>
        <Row label="Applied">{(provider.created_at || "").slice(0, 10)}</Row>
        <Row label="Approved">{provider.approved_at ? provider.approved_at.slice(0, 10) : "—"}</Row>
      </Card>

      <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-5)", flexWrap: "wrap" }}>
        {provider.status !== "approved" ? <Button onClick={() => change("approved")}>Approve</Button> : null}
        {provider.status !== "suspended" ? <Button variant="secondary" onClick={() => change("suspended")}>Suspend</Button> : null}
        {provider.status !== "rejected" ? <Button variant="danger" onClick={() => change("rejected")}>Reject</Button> : null}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", padding: "var(--space-2) 0", borderBottom: "1px solid var(--color-border)" }}>
      <span className="text-muted text-sm">{label}</span>
      <span style={{ textAlign: "right" }}>{children}</span>
    </div>
  );
}
