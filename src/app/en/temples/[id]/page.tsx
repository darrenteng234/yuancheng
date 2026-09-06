import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemple, getPackages } from "@/lib/server-data";
import PhotoCarousel from "@/components/PhotoCarousel";
import PackageCard from "@/components/PackageCard";

export const dynamic = "force-dynamic";

export default async function TempleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const temple = await getTemple(id);

  if (!temple) {
    notFound();
  }

  const packages = await getPackages(temple.id);
  const activePackages = packages.filter((pkg) => pkg.status === "active");
  const isActive = temple.status === "active";

  return (
    <>
      {/* HERO BANNER */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--earth-800), var(--amber-900))",
          color: "white",
          padding: "var(--space-8) 0",
        }}
      >
        <div className="container">
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              marginBottom: "var(--space-3)",
            }}
          >
            <Link
              href="/en/temples"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--text-sm)" }}
            >
              Temples
            </Link>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
            <span style={{ fontSize: "var(--text-sm)" }}>{temple.name}</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            {temple.name}
            {temple.verification_status === "verified" && (
              <span
                className="badge badge-brown"
                style={{ fontSize: "var(--text-sm)", marginLeft: "var(--space-2)", verticalAlign: "middle" }}
              >
                ✓ Verified
              </span>
            )}
          </h1>

          {/* Location */}
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "var(--space-2)" }}>
            📍 {temple.city}, {temple.country}
            {temple.address && <> · {temple.address}</>}
          </p>

          {/* Short Description */}
          {temple.short_description && (
            <p
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "var(--text-base)",
                lineHeight: 1.7,
                maxWidth: 640,
                marginTop: "var(--space-3)",
              }}
            >
              {temple.short_description}
            </p>
          )}

          {/* Prayer Tags */}
          {temple.prayer_tags && temple.prayer_tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
              {temple.prayer_tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "var(--text-sm)",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PHOTO CAROUSEL */}
      {temple.photos && temple.photos.length > 0 && (
        <section style={{ paddingTop: "var(--space-5)" }}>
          <div className="container">
            <PhotoCarousel photos={temple.photos} alt={temple.name} height={360} />
          </div>
        </section>
      )}

      {/* PACKAGES SECTION */}
      <section className="section" style={{ paddingTop: "var(--space-6)" }}>
        <div className="container">
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              marginBottom: "var(--space-1)",
            }}
          >
            Choose Your Package
          </h2>
          <p
            className="text-sm text-muted"
            style={{ marginBottom: "var(--space-5)" }}
          >
            All packages include photo evidence. Video available on selected packages.
          </p>

          {activePackages.length === 0 ? (
            <div className="card text-center" style={{ padding: "var(--space-8)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-3)" }}>📭</div>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>No Packages Available</h3>
              <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
                Packages for this temple are being prepared. Please check back soon.
              </p>
              <Link href="/en/temples" className="btn btn-secondary">← Back to Temples</Link>
            </div>
          ) : (
            <div className="grid grid-3">
              {activePackages.map((pkg, index) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  templeId={temple.id}
                  isPopular={index === 1}
                  href={`/en/checkout?temple=${temple.id}&package=${pkg.id}`}
                  labels={{
                    popular: "Most Popular",
                    photos: "📸 Photos",
                    video: "🎥 Video",
                    ovc: "🔳 OVC",
                    select: "Select Package",
                    comingSoon: "Product images coming soon",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TRUST SECTION */}
      <section style={{ padding: "var(--space-8) 0", background: "var(--stone-50)" }}>
        <div className="container">
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "var(--space-6)",
            }}
          >
            What You Will Receive
          </h2>

          <div className="grid grid-3" style={{ gap: "var(--space-4)" }}>
            {/* Step 1 */}
            <div className="card text-center" style={{ padding: "var(--space-5)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>📸</div>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>Photo Evidence</h4>
              <p className="text-sm text-muted">
                Clear photos of the ritual being performed at the temple, showing all offerings.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card text-center" style={{ padding: "var(--space-5)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>🎥</div>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>Video Recording</h4>
              <p className="text-sm text-muted">
                Video documentation of the prayer ritual (included in Devotion package and above).
              </p>
            </div>

            {/* Step 3 */}
            <div className="card text-center" style={{ padding: "var(--space-5)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>📋</div>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>Receipt Verification</h4>
              <p className="text-sm text-muted">
                Actual receipts from the temple for all offerings and donations made on your behalf.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="card" style={{ marginTop: "var(--space-6)", padding: "var(--space-5)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)", textAlign: "center" }}>
              How It Works
            </h3>
            <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", minWidth: 120 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--amber-600)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    margin: "0 auto var(--space-2)",
                  }}
                >
                  1
                </div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>Place Order</div>
                <div className="text-xs text-muted">Choose package & pay</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: "var(--stone-300)", fontSize: 20 }}>→</div>
              <div style={{ textAlign: "center", minWidth: 120 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--amber-600)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    margin: "0 auto var(--space-2)",
                  }}
                >
                  2
                </div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>Runner Performs</div>
                <div className="text-xs text-muted">At the temple, same day</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: "var(--stone-300)", fontSize: 20 }}>→</div>
              <div style={{ textAlign: "center", minWidth: 120 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--amber-600)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    margin: "0 auto var(--space-2)",
                  }}
                >
                  3
                </div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>Evidence Sent</div>
                <div className="text-xs text-muted">Photos, video, receipts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="section">
        <div className="container">
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "var(--space-6)",
            }}
          >
            Frequently Asked Questions
          </h2>

          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>
                How do I know the ritual was actually performed?
              </h4>
              <p className="text-sm text-muted">
                Every order includes photo evidence taken at the temple. Higher packages include video.
                You will also receive actual receipts from the temple for all offerings purchased.
              </p>
            </div>

            <div className="card" style={{ padding: "var(--space-4)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>
                Can I include a personal message or specific prayer?
              </h4>
              <p className="text-sm text-muted">
                Yes. During checkout, you can add special instructions with your personal prayer
                or message. Our runner will read it aloud during the ritual.
              </p>
            </div>

            <div className="card" style={{ padding: "var(--space-4)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>
                What if I need to fulfill a vow later?
              </h4>
              <p className="text-sm text-muted">
                You can place a new order anytime. Many customers return to fulfill vows.
                Your order history is saved in your account.
              </p>
            </div>

            <div className="card" style={{ padding: "var(--space-4)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>
                How long does it take?
              </h4>
              <p className="text-sm text-muted">
                Most orders are completed within 24 hours. Evidence is sent to you via
                email and available in your account dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {activePackages.length > 0 && (
        <section style={{ padding: "var(--space-6) 0", background: "var(--stone-50)" }}>
          <div className="container text-center">
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
              Ready to proceed?
            </h2>
            <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
              Select a package above to begin.
            </p>
            <Link href={`/en/checkout?temple=${temple.id}`} className="btn btn-primary btn-lg">
              Order Now
            </Link>
          </div>
        </section>
      )}

      <div style={{ height: "var(--space-6)" }} />
    </>
  );
}
