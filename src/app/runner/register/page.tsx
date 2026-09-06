"use client";

import { useState } from "react";
import Link from "next/link";

export default function RunnerRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [experience, setExperience] = useState("");
  const [whyRunner, setWhyRunner] = useState("");
  const [availability, setAvailability] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
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
    if (!city.trim() || !country.trim()) {
      setError("Please enter your city and country.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/runners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          country: country.trim(),
          experience,
          why_runner: whyRunner.trim(),
          availability: availability.trim(),
          status: "probation",
          tier: "bronze",
          quality_score: 0,
          return_rate: 0,
          notes: ""
            .concat(experience ? `Experience: ${experience}. ` : "")
            .concat(whyRunner ? `Motivation: ${whyRunner}. ` : "")
            .concat(availability ? `Availability: ${availability}. ` : "")
            .concat(city && country ? `Location: ${city}, ${country}.` : ""),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Failed to submit registration. Please try again.");
        return;
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="section" style={{ paddingTop: "var(--space-10)" }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="card">
            <div className="card-body" style={{ textAlign: "center", padding: "var(--space-10)" }}>
              <div style={{ fontSize: "var(--text-4xl)", marginBottom: "var(--space-4)" }}>🎉</div>
              <h2
                style={{
                  fontSize: "var(--text-2xl)",
                  fontWeight: 700,
                  marginBottom: "var(--space-3)",
                }}
              >
                Registration Submitted!
              </h2>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "var(--space-6)",
                  lineHeight: 1.7,
                }}
              >
                Thank you for applying to become a YUANCHENG Runner. We&apos;ve
                received your application and will review it within{" "}
                <strong>3–5 business days</strong>.
              </p>

              <div
                style={{
                  background: "var(--amber-50)",
                  border: "1px solid var(--amber-200)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-6)",
                  marginBottom: "var(--space-6)",
                  textAlign: "left",
                }}
              >
                <h3
                  style={{
                    fontSize: "var(--text-base)",
                    fontWeight: 700,
                    marginBottom: "var(--space-4)",
                  }}
                >
                  📋 What happens next?
                </h3>
                <div className="timeline">
                  <div className="timeline-item active">
                    <div className="timeline-dot">1</div>
                    <div className="timeline-title">Application Review</div>
                    <div className="timeline-date">
                      Our team reviews your details and experience
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot">2</div>
                    <div className="timeline-title">Background Check</div>
                    <div className="timeline-date">
                      Quick verification of identity and contact info
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot">3</div>
                    <div className="timeline-title">Welcome & Training</div>
                    <div className="timeline-date">
                      Onboarding call + access to runner portal
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot">4</div>
                    <div className="timeline-title">Start Running!</div>
                    <div className="timeline-date">
                      Receive your first order assignments
                    </div>
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                  marginBottom: "var(--space-6)",
                }}
              >
                We&apos;ll contact you at{" "}
                <strong>{email}</strong> with updates.
              </p>

              <Link href="/" className="btn btn-primary">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: "var(--space-10)" }}>
      <div className="container" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <Link
            href="/"
            style={{
              fontSize: 40,
              display: "block",
              marginBottom: "var(--space-3)",
            }}
          >
            🏃
          </Link>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              marginBottom: "var(--space-2)",
            }}
          >
            Become a YUANCHENG Runner
          </h1>
          <p className="text-muted" style={{ maxWidth: 460, margin: "0 auto" }}>
            Join our trusted network of runners who help connect devotees with
            temples across the region. Flexible schedule, meaningful work.
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          <div className="card-body" style={{ padding: "var(--space-8)" }}>
            {error && (
              <div
                className="alert alert-error"
                style={{ marginBottom: "var(--space-5)" }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Personal Info */}
              <h3
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: 700,
                  marginBottom: "var(--space-4)",
                  color: "var(--amber-700)",
                }}
              >
                Personal Information
              </h3>

              <div className="grid grid-2" style={{ gap: "var(--space-4)" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div
                className="grid grid-2"
                style={{ gap: "var(--space-4)", marginTop: "var(--space-4)" }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+60 12 345 6789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Experience Level
                  </label>
                  <select
                    className="form-select"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="">Select experience</option>
                    <option value="beginner">Beginner — New to this</option>
                    <option value="some">
                      Some Experience — Done similar work
                    </option>
                    <option value="experienced">
                      Experienced — Regular runner / courier
                    </option>
                    <option value="expert">
                      Expert — Professional logistics background
                    </option>
                  </select>
                </div>
              </div>

              <div
                className="grid grid-2"
                style={{ gap: "var(--space-4)", marginTop: "var(--space-4)" }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kuala Lumpur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Country *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Malaysia"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="divider" />

              {/* About */}
              <h3
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: 700,
                  marginBottom: "var(--space-4)",
                  color: "var(--amber-700)",
                }}
              >
                About You
              </h3>

              <div className="form-group">
                <label className="form-label">
                  Why do you want to be a Runner? *
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Tell us what motivates you to join YUANCHENG as a runner..."
                  value={whyRunner}
                  onChange={(e) => setWhyRunner(e.target.value)}
                  required
                />
                <p className="form-hint">
                  Help us understand your motivation and commitment.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Availability</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Weekends only, Weekdays after 6pm, Flexible"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                />
                <p className="form-hint">
                  Let us know when you&apos;re generally available to take
                  orders.
                </p>
              </div>

              <div
                style={{
                  background: "var(--earth-50)",
                  border: "1px solid var(--earth-200)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  marginTop: "var(--space-6)",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--earth-700)",
                    lineHeight: 1.6,
                  }}
                >
                  ℹ️ New runners start at <strong>Bronze tier</strong> on{" "}
                  <strong>probation status</strong>. After completing your first
                  5 orders with a quality score of 4.0+, you&apos;ll advance to
                  Silver tier with higher order priority and better earnings.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                style={{ marginTop: "var(--space-6)" }}
                disabled={loading}
              >
                {loading ? "Submitting Application..." : "🚀 Submit Application"}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div style={{ height: "var(--space-10)" }} />
    </section>
  );
}
