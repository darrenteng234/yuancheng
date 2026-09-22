"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { applyProvider } from "@/lib/platform-api";
import { Card, Button, Input, Select, Alert } from "@/components/ui";
import type { ProviderKind } from "@/types/platform";

const KINDS: { value: ProviderKind; label: string }[] = [
  { value: "temple", label: "Temple" },
  { value: "organization", label: "Organization" },
  { value: "service_operator", label: "Service operator" },
  { value: "religious_service", label: "Religious service provider" },
  { value: "community_org", label: "Community organization" },
  { value: "other", label: "Other" },
];

export default function ProviderApply() {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", kind: "temple" as ProviderKind, contact_email: "", contact_phone: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      await applyProvider(form);
      router.push("/provider");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed");
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: "var(--space-10)", paddingBottom: "var(--space-16)" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Become a provider</h1>
      <p className="text-muted" style={{ marginBottom: "var(--space-6)" }}>
        Tell us about your organization. An admin reviews every application before you can publish publicly.
      </p>
      <Card>
        <form onSubmit={submit}>
          {error ? <Alert tone="error" style={{ marginBottom: "var(--space-4)" }}>{error}</Alert> : null}
          <Input label="Provider name" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wat Arun Services" />
          <Select label="Provider type" value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as ProviderKind })}>
            {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </Select>
          <Input label="Contact email" type="email" value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          <Input label="Contact phone" value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          <Button type="submit" full loading={busy} style={{ marginTop: "var(--space-2)" }}>Submit application</Button>
        </form>
      </Card>
    </div>
  );
}
