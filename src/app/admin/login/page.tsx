"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in with Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // Verify admin status via API
      const res = await fetch("/api/admin/auth-check", { method: "POST" });
      if (!res.ok) {
        await supabase.auth.signOut();
        setError("Unauthorized. Admin access only.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg, #faf9f6)",
        padding: "var(--space-6)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#fff",
          borderRadius: "12px",
          padding: "var(--space-8)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>⛩️</div>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>
            Admin Login
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
            YUANCHENG Management Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{
                width: "100%",
                padding: "var(--space-3)",
                borderRadius: "8px",
                border: "1px solid var(--color-border, #e5e5e5)",
                fontSize: "var(--text-base)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "var(--space-3)",
                borderRadius: "8px",
                border: "1px solid var(--color-border, #e5e5e5)",
                fontSize: "var(--text-base)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "var(--space-3)",
                borderRadius: "8px",
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: "var(--text-sm)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "var(--space-3)",
              borderRadius: "8px",
              border: "none",
              background: "var(--color-primary, #1a1a1a)",
              color: "#fff",
              fontSize: "var(--text-base)",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "var(--space-5)" }}>
          <Link
            href="/login"
            style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", textDecoration: "none" }}
          >
            ← Back to customer login
          </Link>
        </div>
      </div>
    </div>
  );
}
