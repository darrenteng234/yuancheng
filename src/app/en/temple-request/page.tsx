"use client";

import Link from "next/link";

export default function TempleRequestPage() {
  return (
    <>
      <section style={{
        background: "linear-gradient(135deg, var(--stone-900) 0%, var(--earth-900) 50%, var(--amber-900) 100%)",
        color: "white",
        padding: "var(--space-10) 0",
        textAlign: "center",
      }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ fontSize: 48, marginBottom: "var(--space-4)" }}>🔍</div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-3)" }}>
            Request a Temple
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "var(--text-lg)" }}>
            Can&apos;t find your temple? Tell us which temple you&apos;d like us to add and we&apos;ll work on it.
          </p>
        </div>
      </section>

      <section style={{ padding: "var(--space-8) 0" }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontWeight: 700, marginBottom: "var(--space-5)" }}>
                Temple Request Form
              </h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = Object.fromEntries(new FormData(form));
                try {
                  const res = await fetch("/api/temple-requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      temple_name: data.temple_name,
                      city: data.city,
                      country: data.country || "Thailand",
                      requester_name: data.requester_name,
                      requester_email: data.requester_email,
                      notes: data.notes || null,
                      status: "pending",
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    }),
                  });
                  if (res.ok) {
                    alert("Thank you! Your temple request has been submitted. We'll review it shortly.");
                    form.reset();
                  } else {
                    alert("Something went wrong. Please try again.");
                  }
                } catch {
                  alert("Network error. Please try again.");
                }
              }}>
                <div className="form-group">
                  <label className="form-label">Temple Name *</label>
                  <input type="text" name="temple_name" className="form-input" placeholder="e.g., Wat Phra Kaew" required />
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input type="text" name="city" className="form-input" placeholder="e.g., Bangkok" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input type="text" name="country" className="form-input" placeholder="Thailand" defaultValue="Thailand" />
                  </div>
                </div>
                <div className="divider" />
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input type="text" name="requester_name" className="form-input" placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Email *</label>
                  <input type="email" name="requester_email" className="form-input" placeholder="your@email.com" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Additional Notes (Optional)</label>
                  <textarea name="notes" className="form-textarea" placeholder="Any details about the temple, location, or why you'd like it added..." />
                </div>
                <div style={{ marginTop: "var(--space-5)" }}>
                  <button type="submit" className="btn btn-primary btn-lg btn-full">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/en/temples" className="text-sm text-muted">
              ← Back to Temples
            </Link>
          </div>
        </div>
      </section>

      <div style={{ height: "var(--space-10)" }} />
    </>
  );
}
