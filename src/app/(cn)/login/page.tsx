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
          setError("邮箱或密码错误，请重试。");
        } else {
          setError(authError.message);
        }
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("请输入您的姓名。"); return; }
    if (!email.trim() || !email.includes("@")) { setError("请输入有效的电子邮件地址。"); return; }
    if (password.length < 6) { setError("密码至少需要6个字符。"); return; }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("该邮箱已注册，请直接登录。");
        } else {
          setError(authError.message);
        }
        return;
      }
      setSuccess("账户创建成功！请检查您的邮箱确认，然后登录。");
      setMode("login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ paddingTop: "var(--space-10)" }}>
      <div className="container" style={{ maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <Link href="/" style={{ fontSize: 32, display: "block", marginBottom: "var(--space-3)" }}>⛩️</Link>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>
            {mode === "login" ? "欢迎回来" : "创建账户"}
          </h1>
          <p className="text-sm text-muted">
            {mode === "login" ? "登录以追踪您的订单和偏好" : "加入愿成，管理您的寺庙服务"}
          </p>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-6)" }}>
          <button type="button" onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
            style={{ flex: 1, padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600,
              color: mode === "login" ? "var(--amber-700)" : "var(--color-text-muted)",
              border: "none", borderBottom: "2px solid", borderBottomColor: mode === "login" ? "var(--amber-600)" : "transparent",
              background: "none", cursor: "pointer" }}>登录</button>
          <button type="button" onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
            style={{ flex: 1, padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600,
              color: mode === "register" ? "var(--amber-700)" : "var(--color-text-muted)",
              border: "none", borderBottom: "2px solid", borderBottomColor: mode === "register" ? "var(--amber-600)" : "transparent",
              background: "none", cursor: "pointer" }}>注册</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}><span>⚠️</span><span>{error}</span></div>}
        {success && <div className="alert alert-success" style={{ marginBottom: "var(--space-4)" }}><span>✅</span><span>{success}</span></div>}

        <div className="card">
          <div className="card-body">
            {mode === "login" ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">电子邮件</label>
                  <input type="email" className="form-input" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">密码</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                  {loading ? "登录中..." : "登录"}
                </button>
                <p style={{ textAlign: "center", marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                  没有账户？{" "}
                  <button type="button" onClick={() => { setMode("register"); setError(null); }}
                    style={{ background: "none", border: "none", color: "var(--amber-700)", cursor: "pointer", fontWeight: 600, fontSize: "inherit" }}>
                    免费注册
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">姓名</label>
                  <input type="text" className="form-input" placeholder="您的姓名" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">电子邮件</label>
                  <input type="email" className="form-input" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">密码</label>
                  <input type="password" className="form-input" placeholder="至少6个字符" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                  {loading ? "注册中..." : "创建账户"}
                </button>
                <p style={{ textAlign: "center", marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                  已有账户？{" "}
                  <button type="button" onClick={() => { setMode("login"); setError(null); }}
                    style={{ background: "none", border: "none", color: "var(--amber-700)", cursor: "pointer", fontWeight: 600, fontSize: "inherit" }}>
                    登录
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted">← 返回首页</Link>
        </div>

        <div style={{ marginTop: "var(--space-6)", textAlign: "center" }}>
          <div className="divider" style={{ marginBottom: "var(--space-4)" }} />
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-3)" }}>
            想成为跑腿员？
          </p>
          <Link href="/runner/register" className="btn btn-accent">
            🏃 成为跑腿员
          </Link>
        </div>
      </div>
      <div style={{ height: "var(--space-10)" }} />
    </section>
  );
}
