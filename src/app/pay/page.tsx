"use client";
import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, Button, Alert, LoadingState, ErrorState, EmptyState } from "@/components/ui";

const PUBLISHABLE = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!PUBLISHABLE) return null;
  if (!stripePromise) stripePromise = loadStripe(PUBLISHABLE);
  return stripePromise;
}

function PayForm({ orderId, token }: { orderId: string; token: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || busy) return;
    setBusy(true); setError("");
    // Confirm on Stripe. The order becomes PAID only via the webhook — never here.
    const { error: err } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/track?id=${orderId}&token=${encodeURIComponent(token)}`,
      },
    });
    // Only reached if confirmation fails immediately (else Stripe redirects).
    if (err) { setError(err.message || "Payment failed"); setBusy(false); }
    else router.push(`/orders/track?id=${orderId}&token=${encodeURIComponent(token)}`);
  }

  return (
    <form onSubmit={pay}>
      {error ? <Alert tone="error" style={{ marginBottom: "var(--space-4)" }}>{error}</Alert> : null}
      <PaymentElement />
      <Button type="submit" full loading={busy} disabled={!stripe} style={{ marginTop: "var(--space-5)" }}>
        Pay now (test mode)
      </Button>
      <p className="text-xs text-muted" style={{ marginTop: "var(--space-3)", textAlign: "center" }}>
        🔒 Stripe test mode · card 4242 4242 4242 4242
      </p>
    </form>
  );
}

function PayInner() {
  const params = useSearchParams();
  const orderId = params.get("order") || "";
  const token = params.get("token") || "";
  const [state, setState] = React.useState<"loading" | "error" | "ready" | "noconfig" | "badlink">("loading");
  const [clientSecret, setClientSecret] = React.useState("");

  React.useEffect(() => {
    if (!orderId) { setState("badlink"); return; }
    if (!getStripe()) { setState("noconfig"); return; }
    fetch("/api/platform/payment-intent", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    }).then(async (r) => {
      const b = await r.json().catch(() => ({}));
      if (!r.ok || !b.clientSecret) throw new Error(b.error || "Could not start payment");
      setClientSecret(b.clientSecret); setState("ready");
    }).catch(() => setState("error"));
  }, [orderId]);

  if (state === "badlink") return <Wrap><EmptyState icon="🔗" title="Invalid payment link" description="This link is missing its order reference." /></Wrap>;
  if (state === "noconfig") return <Wrap><EmptyState icon="⚙️" title="Payments not configured" description="Stripe test keys are not set on this environment yet." /></Wrap>;
  if (state === "loading") return <Wrap><LoadingState label="Starting secure payment…" /></Wrap>;
  if (state === "error") return <Wrap><ErrorState title="Payment unavailable" description="Could not start the payment. The order may already be paid, or the service is unreachable." /></Wrap>;

  const stripe = getStripe();
  return (
    <Wrap>
      {stripe ? (
        <Elements stripe={stripe} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <PayForm orderId={orderId} token={token} />
        </Elements>
      ) : null}
    </Wrap>
  );
}

export default function PayPage() {
  return <Suspense fallback={<Wrap><LoadingState /></Wrap>}><PayInner /></Suspense>;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="container" style={{ maxWidth: 460, paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-4)", textAlign: "center" }}>Complete payment</h1>
      <Card>{children}</Card>
    </div>
  );
}
