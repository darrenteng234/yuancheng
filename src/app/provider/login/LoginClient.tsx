"use client";
import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useProviderT } from "@/components/layout/ProviderShell";

export default function ProviderLoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const { t } = useProviderT();
  const L = t.login;
  const next = sp.get("redirect") || "/provider";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      if (!supabaseConfigured) throw new Error(L.unavailable);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(L.invalid);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : L.invalid);
    } finally { setBusy(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="auth-brand"><Logo /></Link>
        <h1>{L.title}</h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-6)" }}>{L.subtitle}</p>
        {error ? <div className="banner-review" style={{ marginBottom: "var(--space-4)", background: "var(--color-error-bg)", color: "var(--color-error)" }}>{error}</div> : null}
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
          <div><label className="form-label">{L.email}</label><input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
          <div><label className="form-label">{L.password}</label><input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></div>
          <button className="btn btn-primary btn-lg btn-full" disabled={busy}>{busy ? L.signingIn : L.signIn}</button>
        </form>
        <div className="auth-links">
          <Link href="/provider/apply">{L.create}</Link>
          <Link href="/">{L.back}</Link>
        </div>
      </div>
    </div>
  );
}
