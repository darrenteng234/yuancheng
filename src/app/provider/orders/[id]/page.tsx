"use client";
import { useParams } from "next/navigation";
import { OrderDetailScreen } from "@/components/platform/OrderDetailScreen";

export default function ProviderOrderDetail() {
  const { id } = useParams<{ id: string }>();
  return <OrderDetailScreen orderId={id} role="provider_owner" backHref="/provider/orders" backLabel="Orders" allowAssign />;
}
