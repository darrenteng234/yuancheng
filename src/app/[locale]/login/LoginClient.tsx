"use client";
import React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export default function LoginClient() {
  const params = useParams();
  const router = useRouter();
  const sp = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const zh = locale === "zh";
  const next = sp.get("next") || `/${locale}/orders`;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      if (!supabaseConfigured) throw new Error(zh ? "登录暂不可用。" : "Sign-in is not available right now.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(zh ? "邮箱或密码不正确。" : "Incorrect email or password.");
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : (zh ? "登录失败。" : "Sign-in failed."));
    } finally { setBusy(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link href={`/${locale}`} className="auth-brand">YUANCHENG</Link>
        <h1>{zh ? "欢迎回到愿成" : "Welcome to Yuancheng"}</h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-6)" }}>{zh ? "登录以管理您的订单。" : "Sign in to manage your orders."}</p>
        {error ? <div className="banner-review" style={{ marginBottom: "var(--space-4)", background: "var(--color-error-bg)", color: "var(--color-error)" }}>{error}</div> : null}
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label">{zh ? "邮箱" : "Email"}</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label className="form-label">{zh ? "密码" : "Password"}</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <button className="btn btn-primary btn-lg btn-full" disabled={busy}>{busy ? (zh ? "登录中…" : "Signing in…") : (zh ? "登录" : "Sign in")}</button>
        </form>
        <div className="auth-links">
          <Link href={`/${locale}/discover`}>{zh ? "继续浏览" : "Continue browsing"}</Link>
          <Link href="/provider">{zh ? "服务商入口" : "For providers"}</Link>
        </div>
      </div>
    </div>
  );
}
