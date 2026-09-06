"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push("/en");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError(
            "This email is already registered. Please log in instead."
          );
        } else {
          setError(authError.message);
        }
        return;
      }

      setSuccess(
        "Account created! Check your email to confirm, then log in."
      );
      setMode("login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ paddingTop: "var(--space-10)" }}>
      <div className="container" style={{ maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <Link href="/en" style={{ fontSize: 32, display: "block", marginBottom: "var(--space-3)" }}>
            ⛩️
          </Link>
          <h1
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              marginBottom: "var(--space-1)",
            }}
          >
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted">
            {mode === "login"
              ? "Log in to track your orders and preferences"
              : "Join YUANCHENG to manage your temple services"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border)",
            marginBottom: "var(--space-6)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
            style={{
              flex: 1,
              padding: "var(--space-3)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color:
                mode === "login" ? "var(--amber-700)" : "var(--color-text-muted)",
              borderBottom:
                mode === "login" ? "2px solid var(--amber-600)" : "2px solid transparent",
              background: "none",
              border: "none",
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              borderBottomColor:
                mode === "login" ? "var(--amber-600)" : "transparent",
              cursor: "pointer",
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
              setSuccess(null);
            }}
            style={{
              flex: 1,
              padding: "var(--space-3)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color:
                mode === "register" ? "var(--amber-700)" : "var(--color-text-muted)",
              background: "none",
              border: "none",
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              borderBottomColor:
                mode === "register" ? "var(--amber-600)" : "transparent",
              cursor: "pointer",
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: "var(--space-4)" }}>
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            {mode === "login" ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-full"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
                <p style={{ textAlign: "center", marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--amber-700)",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "inherit",
                    }}
                  >
                    Sign up free
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-full"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
                <p style={{ textAlign: "center", marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--amber-700)",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "inherit",
                    }}
                  >
                    Log in
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/en" className="text-sm text-muted">
            ← Back to Home
          </Link>
        </div>

        <div style={{ marginTop: "var(--space-6)", textAlign: "center" }}>
          <div className="divider" style={{ marginBottom: "var(--space-4)" }} />
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-3)" }}>
            Want to become a Runner?
          </p>
          <Link href="/runner/register" className="btn btn-accent">
            🏃 Become a Runner
          </Link>
        </div>
      </div>

      <div style={{ height: "var(--space-10)" }} />
    </section>
  );
}
