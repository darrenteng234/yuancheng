import { redirect } from "next/navigation";

// Phase 8A: subscriptions / plan limits / commission are removed from the demo.
// The route remains but is unlinked and simply returns to Orders.
export default function ProviderSubscription() {
  redirect("/provider/orders");
}
