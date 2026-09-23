import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container section"><p className="text-muted">Loading…</p></div>}>
      <CheckoutClient />
    </Suspense>
  );
}
