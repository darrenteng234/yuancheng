'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDisputes, updateDispute, getOrders } from '@/lib/api';
import type { Dispute, Order } from '@/types';

// ── Helpers ──
function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadge(status: string): string {
  switch (status) {
    case 'open':
    case 'escalated':
      return 'badge-red';
    case 'resolved':
      return 'badge-green';
    default:
      return 'badge-gray';
  }
}

// ── Risk Level Logic ──
type RiskLevel = 'Low' | 'Medium' | 'High';

function getRiskLevel(openDisputeCount: number): RiskLevel {
  if (openDisputeCount === 0) return 'Low';
  if (openDisputeCount <= 2) return 'Medium';
  return 'High';
}

function getRiskGradient(risk: RiskLevel): string {
  switch (risk) {
    case 'Low':
      return 'linear-gradient(135deg, var(--color-success-bg), var(--sage-50))';
    case 'Medium':
      return 'linear-gradient(135deg, var(--color-warning-bg), var(--terracotta-50))';
    case 'High':
      return 'linear-gradient(135deg, var(--color-error-bg), #fef2f2)';
  }
}

function getRiskBorderColor(risk: RiskLevel): string {
  switch (risk) {
    case 'Low':
      return '2px solid var(--sage-500)';
    case 'Medium':
      return '2px solid var(--terracotta-400)';
    case 'High':
      return '2px solid var(--color-error)';
  }
}

function getRiskTextColor(risk: RiskLevel): string {
  switch (risk) {
    case 'Low':
      return 'var(--sage-700)';
    case 'Medium':
      return 'var(--terracotta-600)';
    case 'High':
      return 'var(--color-error)';
  }
}

function getRiskSubtext(risk: RiskLevel): string {
  switch (risk) {
    case 'Low':
      return 'No active alerts. Last incident: 14 days ago (Wichai K. — recycled photos).';
    case 'Medium':
      return 'Some active disputes require attention. Review incident log below.';
    case 'High':
      return 'Multiple active disputes detected. Immediate review recommended.';
  }
}

// ── Fraud Scenarios Data ──
const FRAUD_SCENARIOS = [
  {
    id: 1,
    title: 'Runner Uses Old/Recycled Photos',
    riskLevel: 'HIGH RISK' as const,
    riskBadge: 'badge-red',
    borderLeft: '4px solid var(--color-error)',
    detection: 'OVC date must match photo timestamp (±24hrs). GPS must match temple. Image hashing detects duplicates across orders. Weather cross-check.',
    statusLines: [
      'OVC + timestamp check: ✅ Implemented',
      'GPS check: ❌ Not built',
      'Image hashing: ❌ Not built',
      'Weather check: ❌ Not built',
    ],
  },
  {
    id: 2,
    title: 'Runner Goes to Wrong Temple',
    riskLevel: 'HIGH RISK' as const,
    riskBadge: 'badge-red',
    borderLeft: '4px solid var(--color-error)',
    detection: 'GPS verification (photo location = temple coordinates ±100m). Temple landmark recognition (AI).',
    statusLines: [
      'GPS check: ❌ Not built',
      'Landmark AI: ❌ Not built',
    ],
    fix: 'Require wide shot showing temple entrance + OVC.',
  },
  {
    id: 3,
    title: "Runner Doesn't Perform Ritual",
    riskLevel: 'MEDIUM RISK' as const,
    riskBadge: 'badge-orange',
    borderLeft: '4px solid var(--color-warning)',
    detection: 'Video required for ALL packages. Customer name must be spoken in video. Video must show ritual actions.',
    statusLines: [
      'Video required: ✅ For most packages',
      'Audio name check: ❌ Not built',
    ],
    fix: 'Require video for ALL packages (including Basic).',
  },
  {
    id: 4,
    title: 'Customer Falsely Claims Non-Completion',
    riskLevel: 'MEDIUM RISK' as const,
    riskBadge: 'badge-orange',
    borderLeft: '4px solid var(--color-warning)',
    detection: 'OVC with QR code (customer can independently verify). Pattern detection: flag customers with >2 disputes.',
    statusLines: [
      'OVC QR: ✅ Implemented',
      'Pattern detection: ❌ Not built',
    ],
  },
  {
    id: 5,
    title: 'Admin Approves Bad Evidence',
    riskLevel: 'LOW RISK' as const,
    riskBadge: 'badge-green',
    borderLeft: '4px solid var(--sage-500)',
    detection: 'Evidence checklist (admin must check each item). Random re-audit: 10% of approved orders.',
    statusLines: [
      'Checklist: ✅ Implemented',
      'Random audit: ❌ Manual only',
    ],
    scalingNote: 'Manual review capacity = ~30 orders/day. At 50+ orders/day, need AI-assisted review.',
  },
];

// ── Main Fraud Page ──
export default function FraudPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [disputesData, ordersData] = await Promise.all([
        getDisputes(),
        getOrders(),
      ]);
      setDisputes(disputesData);
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Derived state ──
  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'escalated');
  const openCount = openDisputes.length;
  const riskLevel = getRiskLevel(openCount);
  const totalIncidents = disputes.length;

  // Map order_id to order for display
  const orderMap = new Map<string, Order>();
  orders.forEach((o) => orderMap.set(o.id, o));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>⏳</div>
          <p className="text-muted">Loading fraud data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>🚨</span>
        <span>Error loading fraud data: {error}</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Risk Status Card ── */}
      <div
        className="card"
        style={{
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-5)',
          background: getRiskGradient(riskLevel),
          border: getRiskBorderColor(riskLevel),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ fontSize: 40 }}>🛡️</div>
          <div>
            <div
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                color: getRiskTextColor(riskLevel),
              }}
            >
              {riskLevel} Risk
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: getRiskTextColor(riskLevel),
              }}
            >
              {getRiskSubtext(riskLevel)}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: getRiskTextColor(riskLevel),
              }}
            >
              {totalIncidents}
            </div>
            <div className="text-xs text-muted">Total incidents</div>
          </div>
        </div>
      </div>

      {/* ── Fraud Scenarios & Prevention ── */}
      <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>
        Fraud Scenarios & Prevention
      </h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {FRAUD_SCENARIOS.map((scenario) => (
          <details
            key={scenario.id}
            className="card"
            style={{ borderLeft: scenario.borderLeft }}
          >
            <summary
              style={{
                padding: 'var(--space-4)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {scenario.id}. {scenario.title}{' '}
              <span className={`badge ${scenario.riskBadge}`} style={{ marginLeft: 'var(--space-2)' }}>
                {scenario.riskLevel}
              </span>
            </summary>
            <div
              style={{
                padding: '0 var(--space-4) var(--space-4)',
                fontSize: 'var(--text-sm)',
                lineHeight: 1.8,
              }}
            >
              <strong>Detection:</strong> {scenario.detection}
              <br />
              <strong>Status:</strong>{' '}
              {scenario.statusLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < scenario.statusLines.length - 1 && <br />}
                </span>
              ))}
              {scenario.fix && (
                <>
                  <br />
                  <strong>Fix: {scenario.fix}</strong>
                </>
              )}
              {'scalingNote' in scenario && scenario.scalingNote && (
                <>
                  <br />
                  <strong>Scaling problem:</strong> {scenario.scalingNote}
                </>
              )}
            </div>
          </details>
        ))}
      </div>

      {/* ── Incident Log ── */}
      <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Incident Log</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Runner</th>
            <th>Order</th>
            <th>Status</th>
            <th>Resolution</th>
          </tr>
        </thead>
        <tbody>
          {disputes.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-4)',
                  color: 'var(--color-text-muted)',
                }}
              >
                No incidents recorded
              </td>
            </tr>
          ) : (
            disputes.map((dispute) => {
              const order = orderMap.get(dispute.order_id);
              return (
                <tr key={dispute.id}>
                  <td>{formatDate(dispute.created_at)}</td>
                  <td>
                    <span
                      className={`badge ${dispute.status === 'resolved' ? 'badge-orange' : 'badge-red'}`}
                      style={{ textTransform: 'none' }}
                    >
                      {dispute.reason}
                    </span>
                  </td>
                  <td>{order?.runner?.name || '—'}</td>
                  <td>
                    #{order?.order_number || dispute.order_id.slice(-4)}
                  </td>
                  <td>
                    <span
                      className={`badge ${statusBadge(dispute.status)}`}
                    >
                      {dispute.status === 'open'
                        ? 'Confirmed'
                        : dispute.status === 'escalated'
                        ? 'Escalated'
                        : 'Resolved'}
                    </span>
                  </td>
                  <td>
                    {dispute.resolution
                      ? dispute.resolution === 'full_refund'
                        ? 'Suspended. Customer refunded.'
                        : dispute.resolution === 'partial_refund'
                        ? 'Partial refund issued.'
                        : dispute.resolution === 'redo'
                        ? 'Returned. Re-submitted. SOP updated.'
                        : dispute.resolution === 'rejected'
                        ? 'Dispute rejected.'
                        : dispute.resolution
                      : '—'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </>
  );
}
