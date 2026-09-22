import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center", padding: "var(--space-8)", gap: "var(--space-3)",
      background: "var(--color-bg)", color: "var(--color-text)",
    }}>
      <div style={{ fontSize: "var(--text-5xl)" }} aria-hidden>⛩️</div>
      <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700 }}>Page not found</h1>
      <p style={{ color: "var(--color-text-secondary)", maxWidth: "44ch" }}>
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/en" className="btn btn-primary">Home</Link>
        <Link href="/provider" className="btn btn-secondary">Provider portal</Link>
      </div>
    </div>
  );
}
