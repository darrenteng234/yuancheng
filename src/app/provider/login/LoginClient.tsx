"use client";
import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export default function ProviderLoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("redirect") || "/provider";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      if (!supabaseConfigured) throw new Error("Sign-in is not available right now.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error("Incorrect email or password.");
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally { setBusy(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="auth-brand">YUANCHENG</Link>
        <h1>Provider Portal</h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-6)" }}>Manage your services, storefront and orders.</p>
        {error ? <div className="banner-review" style={{ marginBottom: "var(--space-4)", background: "var(--color-error-bg)", color: "var(--color-error)" }}>{error}</div> : null}
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
          <div><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
          <div><label className="form-label">Password</label><input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></div>
          <button className="btn btn-primary btn-lg btn-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="auth-links">
          <Link href="/provider/apply">Create provider account</Link>
          <Link href="/">Back to Yuancheng</Link>
        </div>
      </div>
    </div>
  );
}
