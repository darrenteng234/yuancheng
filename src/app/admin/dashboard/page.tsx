'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getOrders,
  getRunners,
  getTemples,
  getCustomers,
  getReceipts,
} from '@/lib/api';
import type { Order, Runner, Temple, Customer, RunnerReceipt } from '@/types';

// ── Status badge color mapping ──
function statusBadge(status: string): string {
  switch (status) {
    case 'completed':
    case 'active':
    case 'verified':
    case 'approved':
      return 'badge-green';
    case 'in_progress':
    case 'in_review':
    case 'probation':
    case 'researching':
    case 'pending':
    case 'paid':
    case 'unassigned':
      return 'badge-orange';
    case 'disputed':
    case 'suspended':
    case 'banned':
    case 'rejected':
    case 'refunded':
    case 'cancelled':
      return 'badge-red';
    default:
      return 'badge-gray';
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return dateStr.split('T')[0];
}

function formatCurrency(amount: number): string {
  return `RM${amount.toFixed(0)}`;
}

// ── Stat Card Component ──
function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value" style={{ color: color || 'var(--stone-900)' }}>{value}</div>
    </div>
  );
}

// ── Main Dashboard Page ──
export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [receipts, setReceipts] = useState<RunnerReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, runnersData, templesData, customersData, receiptsData] = await Promise.all([
        getOrders(),
        getRunners(),
        getTemples(),
        getCustomers(),
        getReceipts(),
      ]);
      setOrders(ordersData);
      setRunners(runnersData);
      setTemples(templesData);
      setCustomers(customersData);
      setReceipts(receiptsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ═══════════════════════════════════════════════════
  // CALCULATIONS
  // ═══════════════════════════════════════════════════

  // ── Key Metrics ──
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders
    .filter(o => o.status === 'completed' || o.status === 'in_review')
    .reduce((sum, o) => sum + (o.selling_price || 0), 0);
  const activeRunners = runners.filter(r => r.status === 'active').length;
  const pendingReviews = orders.filter(o => o.status === 'in_review').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // ── Revenue Bar Chart (Last 7 Days) ──
  const last7Days: { label: string; date: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayRevenue = orders
      .filter(o => o.created_at.startsWith(dateStr) && (o.status === 'completed' || o.status === 'in_review'))
      .reduce((sum, o) => sum + (o.selling_price || 0), 0);
    last7Days.push({ label, date: dateStr, revenue: dayRevenue });
  }
  const maxDayRevenue = Math.max(...last7Days.map(d => d.revenue), 1);

  // ── Order Funnel ──
  const funnelUnassigned = orders.filter(o => o.status === 'unassigned' || o.status === 'paid').length;
  const funnelInProgress = orders.filter(o => o.status === 'in_progress').length;
  const funnelInReview = orders.filter(o => o.status === 'in_review').length;
  const funnelCompleted = orders.filter(o => o.status === 'completed').length;
  const funnelTotal = Math.max(totalOrders, 1);

  // ── Temple Performance ──
  const templePerfMap = new Map<string, { temple: Temple | null; orderCount: number; totalRevenue: number }>();
  for (const o of orders) {
    if (o.status !== 'completed' && o.status !== 'in_review') continue;
    const tid = o.temple_id;
    if (!templePerfMap.has(tid)) {
      const temple = temples.find(t => t.id === tid) || null;
      templePerfMap.set(tid, { temple, orderCount: 0, totalRevenue: 0 });
    }
    const entry = templePerfMap.get(tid)!;
    entry.orderCount++;
    entry.totalRevenue += o.selling_price || 0;
  }
  const templePerformance = Array.from(templePerfMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // ── Recent Orders (Last 10) ──
  const recentOrders = orders.slice(0, 10);

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-main" style={{ marginLeft: 0 }}>
          <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>⏳</div>
              <p className="text-muted">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <div className="admin-main" style={{ marginLeft: 0 }}>
          <div className="admin-content">
            <div className="alert alert-error">
              <span>🚨</span>
              <span>Error loading dashboard: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="admin-main" style={{ marginLeft: 0 }}>
        <div className="admin-header">
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>CEO Dashboard</h2>
            <p className="text-sm text-muted">Comprehensive business analytics · Real-time data</p>
          </div>
        </div>

        <div className="admin-content">

          {/* ═══════════════════════════════════════════ */}
          {/* 1. KEY METRICS ROW                         */}
          {/* ═══════════════════════════════════════════ */}
          <div className="stat-grid">
            <StatCard label="Total Orders" value={totalOrders.toLocaleString()} color="var(--slate-600)" />
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} color="var(--sage-700)" />
            <StatCard label="Active Runners" value={activeRunners} color="var(--earth-700)" />
            <StatCard
              label="Pending Reviews"
              value={pendingReviews}
              color={pendingReviews > 0 ? 'var(--color-warning)' : 'var(--sage-600)'}
            />
            <StatCard label="Avg Order Value" value={formatCurrency(avgOrderValue)} color="var(--slate-600)" />
            <StatCard
              label="Completion Rate"
              value={`${completionRate.toFixed(1)}%`}
              color={completionRate >= 50 ? 'var(--sage-600)' : 'var(--color-warning)'}
            />
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* 2. REVENUE BAR CHART + ORDER FUNNEL         */}
          {/* ═══════════════════════════════════════════ */}
          <div className="grid grid-2" style={{ gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>

            {/* REVENUE BAR CHART */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Revenue — Last 7 Days</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', height: 180, paddingTop: 'var(--space-3)' }}>
                  {last7Days.map((day) => {
                    const pct = maxDayRevenue > 0 ? (day.revenue / maxDayRevenue) * 100 : 0;
                    return (
                      <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <div
                          style={{
                            width: '100%',
                            height: `${Math.max(pct, 2)}%`,
                            background: '#f59e0b',
                            borderRadius: '4px 4px 0 0',
                            minHeight: 4,
                            position: 'relative',
                          }}
                          title={`${day.date}: ${formatCurrency(day.revenue)}`}
                        >
                          {day.revenue > 0 && (
                            <span style={{
                              position: 'absolute',
                              top: -18,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: 'var(--text-xs)',
                              color: 'var(--stone-700)',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}>
                              {formatCurrency(day.revenue)}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--stone-500)', marginTop: 6, fontWeight: 500 }}>
                          {day.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ORDER FUNNEL */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Order Funnel</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { stage: 'Unassigned', count: funnelUnassigned, color: '#94a3b8' },
                    { stage: 'In Progress', count: funnelInProgress, color: '#f59e0b' },
                    { stage: 'In Review', count: funnelInReview, color: '#6366f1' },
                    { stage: 'Completed', count: funnelCompleted, color: '#22c55e' },
                  ].map((step, idx) => {
                    const pct = ((step.count / funnelTotal) * 100);
                    const widths = [100, 78, 56, 34]; // funnel shape percentages
                    return (
                      <div key={step.stage}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                            {idx + 1}. {step.stage}
                          </span>
                          <span style={{ fontSize: 'var(--text-sm)' }}>
                            <strong>{step.count}</strong>
                            <span style={{ color: 'var(--stone-400)' }}> ({pct.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div style={{ background: 'var(--stone-100)', borderRadius: 'var(--radius-sm)', height: 28, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${widths[idx]}%`,
                              height: '100%',
                              background: step.color,
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'width 0.3s ease',
                              opacity: 0.85,
                            }}
                          >
                            {widths[idx] >= 50 && (
                              <span style={{ fontSize: 'var(--text-xs)', color: '#fff', fontWeight: 700 }}>
                                {pct.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* 3. TEMPLE PERFORMANCE TABLE                */}
          {/* ═══════════════════════════════════════════ */}
          <div className="card" style={{ marginTop: 'var(--space-6)' }}>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ padding: 'var(--space-5)', paddingBottom: 0 }}>
                <h3 style={{ fontWeight: 700 }}>Temple Performance — Top Temples by Revenue</h3>
              </div>
              <table className="data-table" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Temple</th>
                    <th>Orders</th>
                    <th>Total Revenue</th>
                    <th>Avg Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {templePerformance.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                        No completed orders yet
                      </td>
                    </tr>
                  ) : (
                    templePerformance.map((tp, idx) => (
                      <tr key={tp.temple?.id ?? idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{tp.temple?.name || 'Unknown Temple'}</strong>
                          {tp.temple && (
                            <span className="text-xs text-muted" style={{ marginLeft: 'var(--space-2)' }}>
                              · {tp.temple.city}, {tp.temple.country}
                            </span>
                          )}
                        </td>
                        <td>{tp.orderCount}</td>
                        <td style={{ fontWeight: 600, color: 'var(--sage-700)' }}>
                          {formatCurrency(tp.totalRevenue)}
                        </td>
                        <td>{formatCurrency(tp.orderCount > 0 ? tp.totalRevenue / tp.orderCount : 0)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* 4. RECENT ORDERS FEED                      */}
          {/* ═══════════════════════════════════════════ */}
          <div className="card" style={{ marginTop: 'var(--space-6)' }}>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ padding: 'var(--space-5)', paddingBottom: 0 }}>
                <h3 style={{ fontWeight: 700 }}>Recent Orders — Last 10</h3>
              </div>
              <table className="data-table" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Temple</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map(o => (
                      <tr key={o.id}>
                        <td><strong>#{o.order_number || o.id.slice(-6).toUpperCase()}</strong></td>
                        <td>{o.temple?.name || o.temple_id || '—'}</td>
                        <td>{o.customer?.name || o.customer_name || '—'}</td>
                        <td>
                          <span className={`badge ${statusBadge(o.status)}`} style={{ textTransform: 'none' }}>
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{o.selling_price ? formatCurrency(o.selling_price) : '—'}</td>
                        <td style={{ color: 'var(--stone-500)' }}>{formatDate(o.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
