"use client";

import { useState } from "react";
import Link from "next/link";

export default function TempleRequestPage() {
  const [form, setForm] = useState({ temple_name: "", country: "Thailand", city: "", requested_by: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.temple_name) { setError("请输入寺庙名称。"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/temple-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "pending", request_count: 1 }),
      });
      if (!res.ok) throw new Error("提交失败");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section style={{ paddingTop: "var(--space-10)" }}>
        <div className="container" style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: "var(--space-3)" }}>✅</div>
          <h2 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>申请已提交</h2>
          <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>我们将尽快研究您申请的寺庙，并通过电子邮件通知您结果。</p>
          <Link href="/" className="btn btn-primary">返回首页</Link>
        </div>
      </section>
    );
  }

  return (
    <section style={{ paddingTop: "var(--space-8)" }}>
      <div className="container" style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, textAlign: "center", marginBottom: "var(--space-2)" }}>申请寺庙</h1>
        <p className="text-muted" style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>找不到您想要的寺庙？告诉我们，我们会研究并尽快添加。</p>

        {error && <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}><span>⚠️</span><span>{error}</span></div>}

        <div className="card" style={{ marginBottom: "var(--space-4)" }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">寺庙名称 *</label>
                <input type="text" className="form-input" placeholder="例如：双龙寺" value={form.temple_name} onChange={(e) => handleChange("temple_name", e.target.value)} required />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">国家</label>
                  <input type="text" className="form-input" placeholder="例如：泰国" value={form.country} onChange={(e) => handleChange("country", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">城市</label>
                  <input type="text" className="form-input" placeholder="例如：清迈" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">您的姓名</label>
                <input type="text" className="form-input" placeholder="您的姓名" value={form.requested_by} onChange={(e) => handleChange("requested_by", e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">备注</label>
                <textarea className="form-textarea" placeholder="任何其他信息..." value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: "var(--space-4)" }}>
                {loading ? "提交中..." : "提交申请"}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center">
          <Link href="/temples" className="text-sm text-muted">← 返回寺庙</Link>
        </div>
      </div>
    </section>
  );
}
