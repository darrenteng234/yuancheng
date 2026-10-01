import { redirect } from "next/navigation";

// Phase 7: Orders is the provider's default landing. The dashboard's
// "needs attention" list now lives at the top of /provider/orders.
export default function ProviderHome() {
  redirect("/provider/orders");
}
