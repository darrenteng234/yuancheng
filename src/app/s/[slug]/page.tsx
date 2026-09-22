import Link from "next/link";
import { getPublicStorefrontData } from "@/lib/repos/catalog";
import { StorefrontBuy } from "./buy";

export const dynamic = "force-dynamic";

// Public storefront (customer discovery). Server component — reads published data only.
export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let data: Awaited<ReturnType<typeof getPublicStorefrontData>> = null;
  try { data = await getPublicStorefrontData(slug); } catch { data = null; }

  if (!data) {
    return (
      <div className="container" style={{ padding: "var(--space-16) 0", textAlign: "center" }}>
        <div style={{ fontSize: "var(--text-4xl)", marginBottom: "var(--space-3)" }}>🏮</div>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Storefront not found</h1>
        <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>This storefront may be unpublished or does not exist.</p>
        <Link href="/en" className="btn btn-primary" style={{ marginTop: "var(--space-4)" }}>Go to Yuancheng</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "var(--space-10)", paddingBottom: "var(--space-16)", maxWidth: 820 }}>
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700 }}>{data.storefront.name}</h1>
        {data.storefront.description ? <p className="text-muted" style={{ marginTop: "var(--space-2)", maxWidth: "60ch" }}>{data.storefront.description}</p> : null}
      </header>
      <StorefrontBuy storefrontId={data.storefront.id} products={data.products} />
    </div>
  );
}
