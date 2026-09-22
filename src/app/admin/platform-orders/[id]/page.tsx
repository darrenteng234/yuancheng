"use client";
import { useParams } from "next/navigation";
import { OrderDetailScreen } from "@/components/platform/OrderDetailScreen";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  return <OrderDetailScreen orderId={id} role="admin" backHref="/admin/platform-orders" backLabel="Orders" allowAssign />;
}
