"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getOrders } from "@/lib/api";
import type { Order } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  paid: "已付款",
  unassigned: "待分配",
  in_progress: "进行中",
  in_review: "审核中",
  completed: "已完成",
  disputed: "争议中",
  refunded: "已退款",
  cancelled: "已取消",
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
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(price: number): string {
  return `RM${price.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      router.push("/login");
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
      setMessage({ type: "success", text: "个人信息已更新。" });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "保存失败",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="text-center" style={{ padding: "var(--space-16)" }}>
            <div style={{ fontSize: 40, marginBottom: "var(--space-4)" }}>⛩️</div>
            <p className="text-muted">加载中...</p>
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
            我的账户
          </h1>
          <p className="text-muted">管理您的个人信息和查看订单历史</p>
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
              个人信息
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
                <label className="form-label">姓名</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="您的姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">电子邮件</label>
                <input
                  type="email"
                  className="form-input"
                  value={user.email}
                  disabled
                  style={{ background: "var(--stone-50)", cursor: "not-allowed" }}
                />
                <p className="form-hint">电子邮件地址不可更改</p>
              </div>

              <div className="form-group">
                <label className="form-label">手机号码</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="请输入手机号码"
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
                  {saving ? "保存中..." : "保存更改"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={handleSignOut}
                >
                  退出登录
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
                订单历史
              </h2>
              <p className="text-sm text-muted" style={{ marginBottom: "var(--space-4)" }}>
                您的所有祈福订单
              </p>
            </div>

            {ordersLoading ? (
              <div className="text-center" style={{ padding: "var(--space-10)" }}>
                <p className="text-muted">加载订单中...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center" style={{ padding: "var(--space-10)" }}>
                <div style={{ fontSize: 40, marginBottom: "var(--space-3)" }}>📿</div>
                <p className="text-muted">暂无订单记录</p>
                <Link
                  href="/temples"
                  className="btn btn-primary"
                  style={{ marginTop: "var(--space-4)" }}
                >
                  浏览寺庙
                </Link>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>订单编号</th>
                    <th>寺庙</th>
                    <th>套餐</th>
                    <th>状态</th>
                    <th>日期</th>
                    <th>金额</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link
                          href={`/orders/${order.id}`}
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
          <Link href="/" className="text-sm text-muted">
            ← 返回首页
          </Link>
        </div>
      </div>
    </section>
  );
}
