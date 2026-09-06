"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
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

export default function MyOrdersPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const allOrders = await getOrders();
      const filtered = allOrders.filter(
        (o) =>
          o.customer?.email === email.trim() ||
          o.customer_name === email.trim()
      );
      setOrders(filtered);
    } catch {
      setError("获取订单失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-header">
      <div className="container">
        <h1>我的订单</h1>
        <p>查看您的祈福订单及进度追踪</p>
      </div>

      <div className="container">
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <div style={{ flex: 1 }}>
                <label className="form-label">输入您的邮箱查看订单</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="请输入您的邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ alignSelf: "flex-end" }}
              >
                {loading ? "查询中…" : "查询订单"}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
            {error}
          </div>
        )}

        {searched && !loading && orders.length === 0 && !error && (
          <div className="card">
            <div className="card-body text-center" style={{ padding: "var(--space-12)" }}>
              <div style={{ fontSize: "var(--text-3xl)", marginBottom: "var(--space-4)" }}>
                📿
              </div>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                暂无订单
              </h2>
              <p className="text-muted">
                未找到与此邮箱关联的订单。请确认邮箱地址是否正确，或联系客服协助查询。
              </p>
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
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
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <p className="text-muted text-sm" style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
            共找到 {orders.length} 个订单 · 点击订单编号查看追踪详情
          </p>
        )}
      </div>
    </div>
  );
}
