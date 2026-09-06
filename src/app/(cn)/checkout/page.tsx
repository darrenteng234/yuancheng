"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createCustomer, createOrder, getTemple, getPackages } from "@/lib/api";
import type { Temple, Package } from "@/types";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templeIdParam = searchParams.get("temple") || "";
  const packageIdParam = searchParams.get("package") || "";

  const [temple, setTemple] = useState<Temple | null>(null);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const totalAmount = pkg?.selling_price ?? 0;

  useEffect(() => {
    async function loadSelected() {
      if (!templeIdParam || !packageIdParam) return;
      try {
        const t = await getTemple(templeIdParam);
        setTemple(t);
        const allPackages = await getPackages(templeIdParam);
        const found = allPackages.find((p) => p.id === packageIdParam);
        if (found) setPkg(found);
      } catch {
        setError("无法加载订单信息，请返回重试。");
      }
    }
    loadSelected();
  }, [templeIdParam, packageIdParam]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!templeIdParam || !packageIdParam) {
        setError("请先选择寺庙和配套。");
        return;
      }

      if (!name.trim()) {
        setError("请输入您的姓名。");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setError("请输入有效的电子邮件地址。");
        return;
      }
      if (!phone.trim()) {
        setError("请输入您的电话号码。");
        return;
      }

      setLoading(true);

      try {
        // Step 1: Create customer
        const customer = await createCustomer({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          segment: "one_time",
          total_orders: 0,
          total_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Step 2: Create order
        const order = await createOrder({
          customer_id: customer.id,
          temple_id: templeIdParam,
          package_id: packageIdParam || undefined,
          selling_price: totalAmount,
          status: "unassigned",
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          special_instructions: specialInstructions.trim() || undefined,
          evidence_submitted: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Step 3: Create Stripe PaymentIntent
        const amountInCents = Math.round(totalAmount * 100);
        const piRes = await fetch("/api/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountInCents,
            currency: "myr",
            orderId: order.id,
            customerEmail: email.trim(),
          }),
        });

        if (!piRes.ok) {
          const errBody = await piRes.json().catch(() => ({}));
          throw new Error(errBody.error || "支付初始化失败，请重试。");
        }

        const { clientSecret } = await piRes.json();

        // Step 4: Redirect to payment page with client_secret and order details
        const params = new URLSearchParams({
          client_secret: clientSecret,
          order_id: order.id,
          temple_id: templeIdParam,
          package_id: packageIdParam,
          amount: totalAmount.toFixed(2),
        });
        router.push(`/payment?${params.toString()}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "发生错误，请重试。";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [name, email, phone, templeIdParam, packageIdParam, totalAmount, specialInstructions, router]
  );

  // If no temple/package selected, show message
  if (!templeIdParam || !packageIdParam) {
    return (
      <section className="section" style={{ paddingTop: "var(--space-10)" }}>
        <div className="container" style={{ maxWidth: 520, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: "var(--space-3)" }}>⚠️</div>
          <h2 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>请先选择寺庙和配套</h2>
          <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
            请先浏览寺庙页面，选择您想要的配套后再来完成订单。
          </p>
          <Link href="/temples" className="btn btn-primary btn-lg">浏览寺庙</Link>
        </div>
      </section>
    );
  }

  // If still loading temple/package info
  if (!temple || !pkg) {
    return (
      <section className="section" style={{ paddingTop: "var(--space-10)" }}>
        <div className="container" style={{ maxWidth: 520, textAlign: "center" }}>
          <p className="text-muted">加载中...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: "var(--space-8)" }}>
      <div className="container" style={{ maxWidth: 560 }}>
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "var(--space-6)",
          }}
        >
          完成您的订单
        </h1>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ORDER SUMMARY — read-only, no selection */}
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>订单摘要</h3>

            {/* Temple */}
            <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, var(--earth-100), var(--amber-100))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, flexShrink: 0,
                }}
              >
                ⛩️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{temple.name}</div>
                <div className="text-sm text-muted">📍 {temple.city}, {temple.country}</div>
                {temple.short_description_zh && (
                  <div className="text-xs text-muted" style={{ marginTop: 2, lineHeight: 1.5 }}>
                    {temple.short_description_zh}
                  </div>
                )}
              </div>
              <div>
                <span className="badge badge-brown">
                  {temple.verification_status === "verified" ? "已认证" : "待认证"}
                </span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>{pkg.name}</div>
                  {pkg.description && (
                    <div className="text-sm text-muted" style={{ marginTop: 2, lineHeight: 1.6 }}>
                      {pkg.description}
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 700, color: "var(--amber-700)", fontSize: "var(--text-lg)", whiteSpace: "nowrap", marginLeft: "var(--space-4)" }}>
                  RM{pkg.selling_price}
                </div>
              </div>
            </div>

            {/* What's included */}
            <div style={{ background: "var(--stone-50)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>包含内容</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                <span className="badge badge-brown">📸 照片凭证</span>
                <span className="badge badge-brown">🎥 视频记录</span>
                <span className="badge badge-brown">🔳 验证码</span>
                <span className="badge badge-brown">📋 寺庙收据</span>
              </div>
            </div>

            {/* Total */}
            <div
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderTop: "2px solid var(--color-border)", paddingTop: "var(--space-4)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>总计</span>
              <span style={{ fontWeight: 700, color: "var(--amber-700)", fontSize: "var(--text-xl)" }}>
                RM{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* CUSTOMER DETAILS */}
          <div className="card" style={{ marginBottom: "var(--space-5)" }}>
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>您的资料</h3>
              <div className="form-group">
                <label className="form-label">姓名 *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="您的姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">电子邮件 *</label>
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
                  <label className="form-label">电话 (WhatsApp) *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+60 12-345 6789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">特殊说明（可选）</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 140 }}
                  placeholder="请在此写下您的个人祈愿、心愿、偏好时间或任何特殊要求。我们的执行人会在仪式中代为诵读。"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
                <div className="form-hint">例如：祈求事业顺利、身体健康、家庭和睦等。您也可以指定希望在哪个时间段进行仪式。</div>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              textAlign: "center",
              marginBottom: "var(--space-5)",
            }}
          >
            下单即表示您同意我们的服务条款。付款安全处理。资金将保留至订单完成并验证。
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading}
            style={{ marginBottom: "var(--space-4)" }}
          >
            {loading ? "处理中..." : `前往付款 — RM${totalAmount.toFixed(2)}`}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-4)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
            }}
          >
            <span>🔒 安全</span>
            <span>·</span>
            <span>SSL 加密</span>
            <span>·</span>
            <span>Visa / Mastercard / FPX</span>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link href={`/temples/${temple.id}`} className="text-sm text-muted">
            ← 返回{temple.name}
          </Link>
        </div>
      </div>

      <div style={{ height: "var(--space-10)" }} />
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="section" style={{ paddingTop: "var(--space-10)" }}>
        <div className="container" style={{ textAlign: "center" }}>加载结账页面...</div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
