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
        setError("Unable to load order info. Please go back and try again.");
      }
    }
    loadSelected();
  }, [templeIdParam, packageIdParam]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!templeIdParam || !packageIdParam) {
        setError("Please select a temple and package first.");
        return;
      }

      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!phone.trim()) {
        setError("Please enter your phone number.");
        return;
      }

      setLoading(true);

      try {
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
          throw new Error(errBody.error || "Payment initialization failed. Please try again.");
        }

        const { clientSecret } = await piRes.json();

        // Step 4: Redirect to payment page
        const params = new URLSearchParams({
          client_secret: clientSecret,
          order_id: order.id,
          temple_id: templeIdParam,
          package_id: packageIdParam,
          amount: totalAmount.toFixed(2),
        });
        router.push(`/en/payment?${params.toString()}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [name, email, phone, templeIdParam, packageIdParam, totalAmount, specialInstructions, router]
  );

  if (!templeIdParam || !packageIdParam) {
    return (
      <section className="section" style={{ paddingTop: "var(--space-10)" }}>
        <div className="container" style={{ maxWidth: 520, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: "var(--space-3)" }}>⚠️</div>
          <h2 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>Please select a temple and package first</h2>
          <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
            Browse our temples and choose a package before completing your order.
          </p>
          <Link href="/en/temples" className="btn btn-primary btn-lg">Browse Temples</Link>
        </div>
      </section>
    );
  }

  if (!temple || !pkg) {
    return (
      <section className="section" style={{ paddingTop: "var(--space-10)" }}>
        <div className="container" style={{ maxWidth: 520, textAlign: "center" }}>
          <p className="text-muted">Loading...</p>
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
          Complete Your Order
        </h1>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ORDER SUMMARY — read-only */}
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>Order Summary</h3>

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
                {temple.short_description && (
                  <div className="text-xs text-muted" style={{ marginTop: 2, lineHeight: 1.5 }}>
                    {temple.short_description}
                  </div>
                )}
              </div>
              <div>
                <span className="badge badge-brown">
                  {temple.verification_status === "verified" ? "Verified" : "Pending"}
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

            <div style={{ background: "var(--stone-50)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>What's Included</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                <span className="badge badge-brown">📸 Photos</span>
                <span className="badge badge-brown">🎥 Video</span>
                <span className="badge badge-brown">🔳 OVC</span>
                <span className="badge badge-brown">📋 Receipts</span>
              </div>
            </div>

            <div
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderTop: "2px solid var(--color-border)", paddingTop: "var(--space-4)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>Total</span>
              <span style={{ fontWeight: 700, color: "var(--amber-700)", fontSize: "var(--text-xl)" }}>
                RM{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: "var(--space-5)" }}>
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>Your Details</h3>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone (WhatsApp) *</label>
                  <input type="tel" className="form-input" placeholder="+60 12-345 6789" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Special Instructions (Optional)</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 140 }}
                  placeholder="Write your personal prayer, wishes, preferred timing, or any special requests. Our runner will read it aloud during the ritual."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
                <div className="form-hint">e.g., Pray for career success, good health, family harmony. You can also specify a preferred time for the ritual.</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textAlign: "center", marginBottom: "var(--space-5)" }}>
            By placing this order, you agree to our Terms of Service. Payment processed securely. Funds are held until your order is completed and verified.
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginBottom: "var(--space-4)" }}>
            {loading ? "Processing..." : `Proceed to Payment — RM${totalAmount.toFixed(2)}`}
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            <span>🔒 Secure</span><span>·</span><span>SSL Encrypted</span><span>·</span><span>Visa / Mastercard / FPX</span>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link href={`/en/temples/${temple.id}`} className="text-sm text-muted">
            ← Back to {temple.name}
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
        <div className="container" style={{ textAlign: "center" }}>Loading checkout...</div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
