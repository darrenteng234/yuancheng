"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  loadStripe,
  StripeElementsOptions,
  Appearance,
} from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getTemple, getPackages } from "@/lib/api";

const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#b8860b",
    colorBackground: "#ffffff",
    colorText: "#2a2420",
    colorDanger: "#b94a4a",
    borderRadius: "8px",
  },
};

function PaymentForm({
  clientSecret,
  orderId,
  templeName,
  packageName,
  amount,
}: {
  clientSecret: string;
  orderId: string;
  templeName: string;
  packageName: string;
  amount: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) {
        setError("支付系统尚未加载，请稍候...");
        return;
      }

      setLoading(true);
      setError(null);

      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success?order=${orderId}`,
        },
      });

      if (submitError) {
        setError(submitError.message || "付款失败，请重试。");
        setLoading(false);
      }
      // If successful, Stripe redirects to return_url automatically
    },
    [stripe, elements, orderId]
  );

  return (
    <section className="section" style={{ paddingTop: "var(--space-8)" }}>
      <div className="container" style={{ maxWidth: 520 }}>
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "var(--space-2)",
          }}
        >
          安全付款
        </h1>
        <p
          className="text-muted"
          style={{ textAlign: "center", marginBottom: "var(--space-6)" }}
        >
          请使用您的信用卡或借记卡完成付款
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ORDER SUMMARY */}
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>订单摘要</h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-2)",
              }}
            >
              <span className="text-muted">寺庙</span>
              <span style={{ fontWeight: 600 }}>{templeName}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-2)",
              }}
            >
              <span className="text-muted">配套</span>
              <span style={{ fontWeight: 600 }}>{packageName}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "2px solid var(--color-border)",
                paddingTop: "var(--space-3)",
                marginTop: "var(--space-3)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>应付金额</span>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--amber-700)",
                  fontSize: "var(--text-xl)",
                }}
              >
                RM{amount}
              </span>
            </div>
          </div>
        </div>

        {/* PAYMENT FORM */}
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>付款资料</h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <PaymentElement />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={!stripe || loading}
                style={{ marginBottom: "var(--space-3)" }}
              >
                {loading ? "处理中..." : `立即付款 — RM${amount}`}
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
                <span>🔒 安全加密</span>
                <span>·</span>
                <span>Visa / Mastercard</span>
                <span>·</span>
                <span>Stripe</span>
              </div>
            </form>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
          }}
        >
          您的付款由 Stripe 安全处理。我们不会存储您的卡片信息。
        </div>
      </div>

      <div style={{ height: "var(--space-10)" }} />
    </section>
  );
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const clientSecret = searchParams.get("client_secret") || "";
  const orderId = searchParams.get("order_id") || "";
  const templeId = searchParams.get("temple_id") || "";
  const packageId = searchParams.get("package_id") || "";
  const amount = searchParams.get("amount") || "0.00";

  const [templeName, setTempleName] = useState("加载中...");
  const [packageName, setPackageName] = useState("加载中...");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function loadInfo() {
      try {
        if (templeId) {
          const t = await getTemple(templeId);
          if (t) setTempleName(t.name);
        }
        if (packageId) {
          const pkgs = await getPackages(templeId);
          const found = pkgs.find((p) => p.id === packageId);
          if (found) setPackageName(found.name);
        }
      } catch {
        // silently fail — show IDs as fallback
      } finally {
        setInitialized(true);
      }
    }
    loadInfo();
  }, [templeId, packageId]);

  // Redirect if no client_secret
  useEffect(() => {
    if (!clientSecret && initialized) {
      router.push("/checkout");
    }
  }, [clientSecret, initialized, router]);

  if (!clientSecret) {
    return (
      <section className="section" style={{ paddingTop: "var(--space-10)" }}>
        <div className="container" style={{ maxWidth: 520, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: "var(--space-3)" }}>⚠️</div>
          <h2 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>付款链接无效</h2>
          <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
            请返回结账页面重新下单。
          </p>
          <a href="/checkout" className="btn btn-primary btn-lg">返回结账</a>
        </div>
      </section>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        clientSecret={clientSecret}
        orderId={orderId}
        templeName={templeName}
        packageName={packageName}
        amount={amount}
      />
    </Elements>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="section" style={{ paddingTop: "var(--space-10)" }}>
        <div className="container" style={{ textAlign: "center" }}>加载付款页面...</div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
