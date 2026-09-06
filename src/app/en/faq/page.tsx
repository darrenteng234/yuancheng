import Link from "next/link";

const faqs = [
  {
    q: "What is YUANCHENG?",
    a: "YUANCHENG is a trusted religious services marketplace. We connect you with verified local runners who perform rituals, offerings, and prayers at temples in Bangkok and beyond. You place an order, we handle the fulfillment, and you receive photo and video evidence.",
  },
  {
    q: "How do I know the ritual was actually performed?",
    a: "Every order includes photo and video evidence with a unique QR verification code. Our runners follow strict SOPs and document each step. You can verify the evidence matches your order details.",
  },
  {
    q: "Who are the runners?",
    a: "Our runners are verified local individuals trained in temple procedures. They undergo background checks and training on proper ritual conduct. Each runner is assigned to specific temples they know well.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, and FPX bank transfers. Payment is processed securely and held until your order is completed and verified.",
  },
  {
    q: "How long does an order take?",
    a: "Most orders are completed within 1-3 business days. Once you place an order, we assign a runner who will coordinate the timing with you via WhatsApp.",
  },
  {
    q: "Can I request a specific temple?",
    a: "Yes! If your temple isn't listed, use our Temple Request form. We review all requests and add new temples based on demand and feasibility.",
  },
  {
    q: "What if I'm not satisfied with the service?",
    a: "If the evidence doesn't match your order or you have concerns, you can raise a dispute within 48 hours. We review all disputes and provide refunds when appropriate.",
  },
  {
    q: "Is my personal information safe?",
    a: "Yes. We use industry-standard encryption and never share your personal information with third parties. Your data is stored securely in our database.",
  },
  {
    q: "Do you guarantee spiritual outcomes?",
    a: "No. YUANCHENG is a service fulfillment platform. We guarantee that the ritual is performed correctly and documented, but we do not guarantee any religious or spiritual outcomes.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. After placing an order, you'll receive updates via email and can track progress through the order status timeline — from placement to runner assignment to completion.",
  },
];

export default function FAQPage() {
  return (
    <>
      <section style={{
        background: "linear-gradient(135deg, var(--stone-900) 0%, var(--earth-900) 50%, var(--amber-900) 100%)",
        color: "white",
        padding: "var(--space-10) 0",
        textAlign: "center",
      }}>
        <div className="container">
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-3)" }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "var(--text-lg)" }}>
            Everything you need to know about YUANCHENG.
          </p>
        </div>
      </section>

      <section style={{ padding: "var(--space-8) 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          {faqs.map((faq, i) => (
            <div key={i} className="card" style={{ marginBottom: "var(--space-4)" }}>
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)", fontSize: "var(--text-base)" }}>
                  {faq.q}
                </h3>
                <p className="text-muted" style={{ lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}

          <div className="card text-center" style={{ padding: "var(--space-8)", marginTop: "var(--space-6)" }}>
            <div style={{ fontSize: 32, marginBottom: "var(--space-3)" }}>💬</div>
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>
              Still have questions?
            </h3>
            <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
              We&apos;re here to help. Reach out to us anytime.
            </p>
            <Link href="/en/temple-request" className="btn btn-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <div style={{ height: "var(--space-10)" }} />
    </>
  );
}
