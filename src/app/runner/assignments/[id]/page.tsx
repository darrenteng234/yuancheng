"use client";
import { useParams } from "next/navigation";
import { OrderDetailScreen } from "@/components/platform/OrderDetailScreen";

export default function RunnerAssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  return <OrderDetailScreen orderId={id} role="fulfiller" backHref="/runner/assignments" backLabel="Assignments" />;
}
