'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOrders, getRunners, getReceipts } from '@/lib/api';
import {
  calculateEconomics,
  calculateProfitByRunner,
  formatRM,
  formatPercent,
} from '@/lib/calculations';
import type { Order, Runner, RunnerReceipt } from '@/types';

// ── Stat Card Component ──
function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value" style={{ color: color || 'var(--stone-900)' }}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}

// ── Scaling projection data (static) ──
const SCALING_DATA = [
  {
    phase: 'Phase 1: Launch',
    ordersPerDay: '5-10',
    runners: '2-3',
    monthlyRevenue: 'RM10K-20K',
    monthlyRunnerCosts: 'RM6K-12K',
    yourProfit: 'RM4K-8K',
    bottleneck: 'Customer acquisition',
  },
  {
    phase: 'Phase 2: Growth',
    ordersPerDay: '20-50',
    runners: '10-15',
    monthlyRevenue: 'RM40K-100K',
    monthlyRunnerCosts: 'RM24K-60K',
    yourProfit: 'RM16K-40K',
    bottleneck: 'Runner supply',
  },
  {
    phase: 'Phase 3: Scale',
    ordersPerDay: '50-200',
    runners: '30-60',
    monthlyRevenue: 'RM100K-400K',
    monthlyRunnerCosts: 'RM60K-240K',
    yourProfit: 'RM40K-160K',
    bottleneck: 'Evidence review',
  },
  {
    phase: 'Phase 4: Marketplace',
    ordersPerDay: '200+',
    runners: '100+',
    monthlyRevenue: 'RM400K+',
    monthlyRunnerCosts: 'RM240K+',
    yourProfit: 'RM160K+',
    bottleneck: 'Quality control',
  },
];

// ── Main Economics Page ──
export default function EconomicsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [receipts, setReceipts] = useState<RunnerReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, runnersData, receiptsData] = await Promise.all([
        getOrders(),
        getRunners(),
        getReceipts(),
      ]);
      setOrders(ordersData);
      setRunners(runnersData);
      setReceipts(receiptsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load economics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-main" style={{ marginLeft: 0 }}>
          <div
            className="admin-content"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>
                ⏳
              </div>
              <p className="text-muted">Loading economics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="admin-layout">
        <div className="admin-main" style={{ marginLeft: 0 }}>
          <div className="admin-content">
            <div className="alert alert-error">
              <span>🚨</span>
              <span>Error loading economics data: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Calculations ──
  // Filter completed/in_review orders for revenue calculations
  const completedOrders = orders.filter(
    (o) => o.status === 'completed' || o.status === 'in_review'
  );

  // Build order data for calculateEconomics (map receipt fields from receipts)
  const ordersForCalculation = completedOrders.map((o) => {
    // Find receipts for this order
    const orderReceipts = receipts.filter((r) => r.order_id === o.id);
    const verifiedReceipt = orderReceipts.find((r) => r.status === 'verified');
    return {
      sellingPrice: o.selling_price || 0,
      receiptProductCost: verifiedReceipt?.product_cost || 0,
      receiptTransportCost: verifiedReceipt?.transport_cost || 0,
      receiptOtherCost: verifiedReceipt?.other_cost || 0,
      status: o.status,
    };
  });

  const economics = calculateEconomics(ordersForCalculation);

  // Calculate profit by runner
  const runnerProfits = runners.map((runner) => {
    const runnerOrders = completedOrders.filter((o) => o.runner_id === runner.id);
    const runnerReceiptsList = receipts.filter(
      (r) => r.runner_id === runner.id && r.status === 'verified'
    );

    const ordersForRunnerCalc = runnerOrders.map((o) => {
      const verifiedReceipt = runnerReceiptsList.find((r) => r.order_id === o.id);
      return {
        sellingPrice: o.selling_price || 0,
        receiptProductCost: verifiedReceipt?.product_cost || 0,
        receiptTransportCost: verifiedReceipt?.transport_cost || 0,
        receiptOtherCost: verifiedReceipt?.other_cost || 0,
        status: o.status,
      };
    });

    const profit = calculateProfitByRunner(runner.id, runner.name, ordersForRunnerCalc);

    // Payment due = sum of verified receipt amounts for this runner
    const paymentDue = runnerReceiptsList.reduce(
      (sum, r) => sum + (r.product_cost || 0) + (r.transport_cost || 0) + (r.other_cost || 0),
      0
    );

    return {
      runner,
      ...profit,
      paymentDue,
    };
  });

  // Break-even: based on avg profit per order
  const avgProfitPerOrder =
    completedOrders.length > 0 ? economics.grossProfit / completedOrders.length : 0;
  // Assuming fixed costs of RM0 for now (same as calculateEconomics)
  const breakEvenOrders = avgProfitPerOrder > 0 ? Math.ceil(0 / avgProfitPerOrder) : 0;

  // Runner payment due details for sub text
  const runnerPaymentDetails = runnerProfits
    .filter((rp) => rp.paymentDue > 0)
    .map((rp) => `${rp.runner.name}: ${formatRM(rp.paymentDue)}`)
    .join(' + ');

  return (
    <div className="admin-layout">
      <div className="admin-main" style={{ marginLeft: 0 }}>
        <div className="admin-header">
          <div>
            <h2 style={{ fontWeight: 700 }}>Economics &amp; Pricing</h2>
            <p className="text-sm text-muted">
              Overview of profitability. Runner costs are tracked from actual receipts — costs
              become accurate over time.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="notif-container">
              <div className="notif-bell">
                <span style={{ fontSize: 20 }}>🔔</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-content">
          {/* Success Alert */}
          <div className="alert alert-success" style={{ marginBottom: 'var(--space-6)' }}>
            <span>✅</span>
            <div>
              <strong>Pricing model updated:</strong> You set selling price → Runner submits
              receipts weekly → System calculates actual costs → Profit = selling price − actual
              costs. All prices in Products &amp; Packages page are editable.
            </div>
          </div>

          {/* KEY METRICS — 6 Stat Cards */}
          <div className="stat-grid" style={{ marginBottom: 'var(--space-8)' }}>
            <StatCard
              label="Total Revenue (Month)"
              value={formatRM(economics.totalRevenue)}
              sub={`From ${completedOrders.length} orders`}
            />
            <StatCard
              label="Runner Costs (Actual)"
              value={formatRM(economics.totalRunnerCosts)}
              sub="From runner receipts"
            />
            <StatCard
              label="Gross Profit"
              value={formatRM(economics.grossProfit)}
              sub="Revenue − runner costs"
              color="var(--sage-600)"
            />
            <StatCard
              label="Blended Margin"
              value={formatPercent(economics.blendedMargin)}
              sub={economics.blendedMargin >= 15 ? 'Target: 15% ✓' : 'Target: 15%'}
              color="var(--sage-600)"
            />
            <StatCard
              label="Break-Even"
              value={breakEvenOrders + '/month'}
              sub="At current avg profit"
            />
            <StatCard
              label="Runner Payment Due"
              value={formatRM(economics.runnerPaymentDue)}
              sub={runnerPaymentDetails || 'No payments due'}
              color="var(--earth-700)"
            />
          </div>

          {/* PROFIT BY RUNNER */}
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Profit by Runner (June 2026)
          </h3>
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
            Runner payment = actual receipt amounts. Your profit = selling price − runner costs.
            Tracked weekly/monthly.
          </p>
          <table className="data-table" style={{ marginBottom: 'var(--space-8)' }}>
            <thead>
              <tr>
                <th>Runner</th>
                <th>Orders</th>
                <th>Reimbursable (Receipts)</th>
                <th>Selling Price Total</th>
                <th>Your Profit</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {runnerProfits.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: 'var(--space-4)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    No runner data yet
                  </td>
                </tr>
              ) : (
                runnerProfits.map((rp) => (
                  <tr key={rp.runner.id}>
                    <td>
                      <strong>{rp.runner.name}</strong>
                      {rp.runner.status === 'suspended' && (
                        <br />
                      )}
                      {rp.runner.status === 'suspended' && (
                        <span className="text-xs text-muted">Suspended</span>
                      )}
                    </td>
                    <td>{rp.orders}</td>
                    <td>{formatRM(rp.reimbursable)}</td>
                    <td>{formatRM(rp.sellingPriceTotal)}</td>
                    <td
                      style={{
                        color: rp.profit >= 0 ? 'var(--sage-600)' : 'var(--color-error)',
                        fontWeight: 600,
                      }}
                    >
                      {formatRM(rp.profit)}
                    </td>
                    <td>
                      {rp.runner.status === 'suspended' ? (
                        <span className="badge badge-red" style={{ textTransform: 'none' }}>
                          Not paid (suspended)
                        </span>
                      ) : rp.paymentDue > 0 ? (
                        <button className="btn btn-primary btn-sm">
                          Pay {formatRM(rp.paymentDue)}
                        </button>
                      ) : (
                        <button className="btn btn-secondary btn-sm">Pay {formatRM(0)}</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* SCALING PROJECTIONS */}
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Scaling Projections
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Phase</th>
                <th>Orders/Day</th>
                <th>Runners</th>
                <th>Monthly Revenue</th>
                <th>Monthly Runner Costs</th>
                <th>Your Profit</th>
                <th>Bottleneck</th>
              </tr>
            </thead>
            <tbody>
              {SCALING_DATA.map((row) => (
                <tr key={row.phase}>
                  <td>{row.phase}</td>
                  <td>{row.ordersPerDay}</td>
                  <td>{row.runners}</td>
                  <td>{row.monthlyRevenue}</td>
                  <td>{row.monthlyRunnerCosts}</td>
                  <td>{row.yourProfit}</td>
                  <td>{row.bottleneck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
