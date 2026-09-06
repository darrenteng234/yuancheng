"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getOrders } from "@/lib/api";
import type { Order } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  unassigned: "Unassigned",
  in_progress: "In Progress",
  in_review: "Under Review",
  completed: "Completed",
  disputed: "Disputed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

const STATUS_BADGE: Record<string, string> = {
  paid: "badge-amber",
  unassigned: "badge-gray",
  in_progress: "badge-brown",
  in_review: "badge-orange",
  completed: "badge-green",
  disputed: "badge-red",
  refunded: "badge-gray",
  cancelled: "badge-gray",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price: number): string {
  return `RM${price.toFixed(2)}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    fullName: string;
    phone: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadUser = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      router.push("/en/login");
      return;
    }

    const fullName =
      (authUser.user_metadata?.full_name as string) || "";
    const phoneNumber =
      (authUser.user_metadata?.phone as string) || "";

    setUser({
      id: authUser.id,
      email: authUser.email || "",
      fullName,
      phone: phoneNumber,
    });
    setName(fullName);
    setPhone(phoneNumber);
    setLoading(false);
  }, [router]);

  const loadOrders = useCallback(async (userId: string) => {
    setOrdersLoading(true);
    try {
      const allOrders = await getOrders();
      const filtered = allOrders.filter((o) => o.customer_id === userId);
      setOrders(filtered);
    } catch {
      // silently fail orders
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user?.id) {
      loadOrders(user.id);
    }
  }, [user?.id, loadOrders]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name.trim(), phone: phone.trim() },
      });

      if (authError) {
        setMessage({ type: "error", text: authError.message });
        return;
      }

      const { error: dbError } = await supabase
        .from("customers")
        .upsert(
          {
            id: user.id,
            name: name.trim(),
            email: user.email,
            phone: phone.trim() || null,
          },
          { onConflict: "id" }
        );

      if (dbError) {
        setMessage({ type: "error", text: dbError.message });
        return;
      }

      setUser((prev) =>
        prev ? { ...prev, fullName: name.trim(), phone: phone.trim() } : prev
      );
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/en/login");
    router.refresh();
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="text-center" style={{ padding: "var(--space-16)" }}>
            <div style={{ fontSize: 40, marginBottom: "var(--space-4)" }}>⛩️</div>
            <p className="text-muted">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="section" style={{ paddingTop: "var(--space-10)" }}>
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--amber-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              margin: "0 auto var(--space-4)",
            }}
          >
            🙏
          </div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>
            My Account
          </h1>
          <p className="text-muted">Manage your profile and view order history</p>
        </div>

        {/* Profile Form */}
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-body">
            <h2
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: 600,
                marginBottom: "var(--space-5)",
              }}
            >
              Profile Details
            </h2>

            {message && (
              <div
                className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
                style={{ marginBottom: "var(--space-4)" }}
              >
                <span>{message.type === "success" ? "✅" : "⚠️"}</span>
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={user.email}
                  disabled
                  style={{ background: "var(--stone-50)", cursor: "not-allowed" }}
                />
                <p className="form-hint">Email address cannot be changed</p>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order History */}
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div
              style={{
                padding: "var(--space-6)",
                paddingBottom: 0,
              }}
            >
              <h2
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: 600,
                  marginBottom: "var(--space-1)",
                }}
              >
                Order History
              </h2>
              <p className="text-sm text-muted" style={{ marginBottom: "var(--space-4)" }}>
                All your prayer orders
              </p>
            </div>

            {ordersLoading ? (
              <div className="text-center" style={{ padding: "var(--space-10)" }}>
                <p className="text-muted">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center" style={{ padding: "var(--space-10)" }}>
                <div style={{ fontSize: 40, marginBottom: "var(--space-3)" }}>📿</div>
                <p className="text-muted">No orders found</p>
                <Link
                  href="/en/temples"
                  className="btn btn-primary"
                  style={{ marginTop: "var(--space-4)" }}
                >
                  Browse Temples
                </Link>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Temple</th>
                    <th>Package</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link
                          href={`/en/orders/${order.id}`}
                          style={{ fontWeight: 600, color: "var(--amber-700)" }}
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td>{order.temple?.name ?? "—"}</td>
                      <td>{order.package?.name ?? "—"}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[order.status] ?? "badge-gray"}`}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="text-muted">
                        {formatDate(order.created_at)}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {formatPrice(order.selling_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/en" className="text-sm text-muted">
            ← Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
