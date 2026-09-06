"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe, StripeElementsOptions, Appearance } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getTemple, getPackages } from "@/lib/api";

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder";
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const appearance: Appearance = {
  theme: "stripe",
  variables: { colorPrimary: "#b8860b", colorBackground: "#ffffff", colorText: "#2a2420", colorDanger: "#b94a4a", borderRadius: "8px" },
};

function PaymentForm({ clientSecret, orderId, templeName, packageName, amount }: {
  clientSecret: string; orderId: string; templeName: string; packageName: string; amount: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) { setError("Payment system not loaded yet. Please wait..."); return; }
    setLoading(true); setError(null);
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/en/order-success?order=${orderId}` },
    });
    if (submitError) { setError(submitError.message || "Payment failed. Please try again."); setLoading(false); }
  }, [stripe, elements, orderId]);

  return (
    <section style={{ padding: "var(--space-8) 0" }}>
      <div className="container" style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, textAlign: "center", marginBottom: "var(--space-2)" }}>Secure Payment</h1>
        <p className="text-muted" style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>Complete your payment using credit or debit card</p>

        {error && <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}><span>⚠️</span><span>{error}</span></div>}

        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>Order Summary</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}><span className="text-muted">Temple</span><strong>{templeName}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}><span className="text-muted">Package</span><strong>{packageName}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid var(--color-border)", paddingTop: "var(--space-3)", marginTop: "var(--space-3)" }}>
              <span style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>Total</span>
              <span style={{ fontWeight: 700, color: "var(--amber-700)", fontSize: "var(--text-xl)" }}>RM{amount}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>Payment Details</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "var(--space-4)" }}><PaymentElement /></div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={!stripe || loading} style={{ marginBottom: "var(--space-3)" }}>
                {loading ? "Processing..." : `Pay Now — RM${amount}`}
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                <span>🔒 Secure</span><span>·</span><span>Visa / Mastercard</span><span>·</span><span>Stripe</span>
              </div>
            </form>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
          Your payment is securely processed by Stripe. We never store your card details.
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
  const [templeName, setTempleName] = useState("Loading...");
  const [packageName, setPackageName] = useState("Loading...");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (templeId) { const t = await getTemple(templeId); if (t) setTempleName(t.name); }
        if (packageId) { const pkgs = await getPackages(templeId); const found = pkgs.find(p => p.id === packageId); if (found) setPackageName(found.name); }
      } catch {} finally { setInitialized(true); }
    })();
  }, [templeId, packageId]);

  useEffect(() => {
    if (!clientSecret && initialized) router.push("/en/checkout");
  }, [clientSecret, initialized, router]);

  if (!clientSecret) return (
    <section style={{ padding: "var(--space-10) 0" }}>
      <div className="container" style={{ maxWidth: 520, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: "var(--space-3)" }}>⚠️</div>
        <h2 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>Invalid Payment Link</h2>
        <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>Please return to checkout and try again.</p>
        <a href="/en/checkout" className="btn btn-primary btn-lg">Back to Checkout</a>
      </div>
    </section>
  );

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance } as StripeElementsOptions}>
      <PaymentForm clientSecret={clientSecret} orderId={orderId} templeName={templeName} packageName={packageName} amount={amount} />
    </Elements>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "var(--space-10) 0" }}>
        <div className="container" style={{ textAlign: "center" }}>Loading payment...</div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
