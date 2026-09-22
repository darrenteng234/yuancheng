"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, Button, Input, Alert, LoadingState } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/provider";
  const t = getDictionary("en").auth;

  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [form, setForm] = React.useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
        if (err) { setError(/Invalid login/i.test(err.message) ? t.invalid : err.message); return; }
        router.push(redirectTo); router.refresh();
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: form.email.trim(), password: form.password, options: { data: { name: form.name } },
        });
        if (err) { setError(err.message); return; }
        setNotice("Account created. Check your email to confirm, then sign in.");
        setMode("login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-4)", textAlign: "center" }}>
        {mode === "login" ? t.signInTitle : t.registerTitle}
      </h1>
      <Card>
        <form onSubmit={submit}>
          {error ? <Alert tone="error" style={{ marginBottom: "var(--space-4)" }}>{error}</Alert> : null}
          {notice ? <Alert tone="success" style={{ marginBottom: "var(--space-4)" }}>{notice}</Alert> : null}
          {mode === "register" ? (
            <Input label={t.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          ) : null}
          <Input label={t.email} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label={t.password} type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" full loading={busy} style={{ marginTop: "var(--space-2)" }}>
            {mode === "login" ? t.signIn : t.register}
          </Button>
        </form>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: "var(--space-3)", width: "100%" }}
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? t.toRegister : t.toSignIn}
        </button>
      </Card>
      <p style={{ textAlign: "center", marginTop: "var(--space-4)" }}>
        <Link href="/en" className="text-sm text-muted">← Home</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<LoadingState />}><LoginInner /></Suspense>;
}
