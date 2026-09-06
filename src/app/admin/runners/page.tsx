'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getRunners,
  updateRunner,
} from '@/lib/api';
import {
  getOrders,
} from '@/lib/api';
import {
  getReceipts,
} from '@/lib/api';
import {
  getTemples,
} from '@/lib/api';
import type { Runner, Order, RunnerReceipt, Temple } from '@/types';

// ── Helpers ──
function statusBadge(status: string): string {
  switch (status) {
    case 'completed':
    case 'active':
    case 'verified':
    case 'approved':
    case 'runner_ready':
      return 'badge-green';
    case 'in_progress':
    case 'in_review':
    case 'probation':
    case 'researching':
    case 'pending':
    case 'sop_drafted':
      return 'badge-orange';
    case 'disputed':
    case 'suspended':
    case 'banned':
    case 'rejected':
      return 'badge-red';
    default:
      return 'badge-gray';
  }
}

function tierBadge(tier: string): string {
  switch (tier) {
    case 'gold':
      return 'badge-amber';
    case 'platinum':
      return 'badge-brown';
    case 'silver':
      return 'badge-green';
    default:
      return 'badge-gray';
  }
}

function tierEmoji(tier: string): string {
  switch (tier) {
    case 'gold': return '🥇';
    case 'silver': return '🥈';
    case 'platinum': return '💎';
    default: return '🥉';
  }
}

function qualityColor(score: number): string {
  if (score >= 80) return 'var(--color-success)';
  if (score >= 60) return 'var(--color-warning)';
  return 'var(--color-error)';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return dateStr.split('T')[0];
}

// ── Quality Score Circle ──
function QualityCircle({ score }: { score: number }) {
  const color = qualityColor(score);
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: `conic-gradient(${color} ${score}%, var(--slate-200) 0)`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      {score}
    </div>
  );
}

// ── Modal Component ──
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', margin: 'var(--space-4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        <div className="card-body">{children}</div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-2) var(--space-3)',
  border: '1px solid var(--stone-300)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  background: 'var(--stone-50)',
  color: 'var(--color-text)',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

// ── Runner Detail Modal ──
function RunnerDetailModal({
  runner,
  orders,
  receipts,
  temples,
  onClose,
  onUpdate,
  onMessage,
  saving,
  setSaving,
}: {
  runner: Runner;
  orders: Order[];
  receipts: RunnerReceipt[];
  temples: Temple[];
  onClose: () => void;
  onUpdate: () => Promise<void>;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingTier, setEditingTier] = useState(false);
  const [newStatus, setNewStatus] = useState(runner.status);
  const [newTier, setNewTier] = useState(runner.tier);

  const runnerOrders = orders.filter(o => o.runner_id === runner.id);
  const runnerReceipts = receipts.filter(r => r.runner_id === runner.id && r.status === 'verified');
  const earnings = runnerReceipts.reduce((sum, r) => sum + (r.product_cost || 0) + (r.transport_cost || 0) + (r.other_cost || 0), 0);
  const runnerTempleIds = new Set(runnerOrders.map(o => o.temple_id));
  const runnerTemples = Array.from(runnerTempleIds).map(id => temples.find(t => t.id === id)?.name || id);

  const handleStatusUpdate = async () => {
    try {
      setSaving(true);
      await updateRunner(runner.id, { status: newStatus });
      onMessage({ type: 'success', text: `Runner status updated to ${newStatus}` });
      await onUpdate();
      setEditingStatus(false);
    } catch (err) {
      onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update status' });
    } finally {
      setSaving(false);
    }
  };

  const handleTierUpdate = async () => {
    try {
      setSaving(true);
      await updateRunner(runner.id, { tier: newTier });
      onMessage({ type: 'success', text: `Runner tier updated to ${newTier}` });
      await onUpdate();
      setEditingTier(false);
    } catch (err) {
      onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update tier' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Runner Info */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Name:</span>{' '}
            <strong>{runner.name}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Joined:</span>{' '}
            {formatDate(runner.created_at)}
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Phone:</span>{' '}
            {runner.phone || '—'}
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Email:</span>{' '}
            {runner.email || '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
            {!editingStatus ? (
              <>
                <span className={`badge ${statusBadge(runner.status)}`} style={{ textTransform: 'none' }}>
                  {runner.status.charAt(0).toUpperCase() + runner.status.slice(1)}
                </span>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingStatus(true)} style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}>
                  Edit
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                <select
                  style={{ ...selectStyle, padding: '2px 6px', fontSize: 'var(--text-xs)' }}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Runner['status'])}
                >
                  <option value="active">Active</option>
                  <option value="probation">Probation</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
                <button className="btn btn-sm btn-primary" disabled={saving} onClick={handleStatusUpdate} style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}>
                  ✓
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingStatus(false)} style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}>
                  ✕
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Tier:</span>
            {!editingTier ? (
              <>
                <span className={`badge ${tierBadge(runner.tier)}`} style={{ textTransform: 'none' }}>
                  {tierEmoji(runner.tier)} {runner.tier.charAt(0).toUpperCase() + runner.tier.slice(1)}
                </span>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingTier(true)} style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}>
                  Edit
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                <select
                  style={{ ...selectStyle, padding: '2px 6px', fontSize: 'var(--text-xs)' }}
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as Runner['tier'])}
                >
                  <option value="bronze">🥉 Bronze</option>
                  <option value="silver">🥈 Silver</option>
                  <option value="gold">🥇 Gold</option>
                  <option value="platinum">💎 Platinum</option>
                </select>
                <button className="btn btn-sm btn-primary" disabled={saving} onClick={handleTierUpdate} style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}>
                  ✓
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingTier(false)} style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}>
                  ✕
                </button>
              </div>
            )}
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Quality Score:</span>{' '}
            <QualityCircle score={runner.quality_score} />
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Return Rate:</span>{' '}
            <span style={{
              color: runner.return_rate > 40 ? 'var(--color-error)' : runner.return_rate > 20 ? 'var(--color-warning)' : 'var(--color-success)',
            }}>
              {runner.return_rate}%
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Orders:</span>{' '}
            <strong>{runnerOrders.length}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Earnings:</span>{' '}
            <strong>{earnings > 0 ? `RM${earnings.toFixed(0)}` : '—'}</strong>
          </div>
        </div>
      </div>

      {/* Assigned Temples */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Assigned Temples</h4>
        {runnerTemples.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
            {runnerTemples.map((name, i) => (
              <span key={i} className="badge badge-gray" style={{ textTransform: 'none' }}>{name}</span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted">No temple assignments yet</span>
        )}
      </div>

      {/* Notes */}
      {runner.notes && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Notes</h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', background: 'var(--stone-50)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)' }}>
            {runner.notes}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Quick Actions</h4>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {runner.status === 'probation' && (
            <>
              <button
                className="btn btn-primary btn-sm"
                disabled={saving}
                onClick={async () => {
                  try {
                    setSaving(true);
                    await updateRunner(runner.id, { status: 'active' });
                    onMessage({ type: 'success', text: 'Runner approved! Congratulations email sent.' });
                    await onUpdate();
                  } catch (err) {
                    onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to approve' });
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                ✓ Approve
              </button>
              <button
                className="btn btn-sm"
                disabled={saving}
                style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
                onClick={async () => {
                  try {
                    setSaving(true);
                    await updateRunner(runner.id, { status: 'banned' });
                    onMessage({ type: 'success', text: 'Runner rejected.' });
                    await onUpdate();
                  } catch (err) {
                    onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to reject' });
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                ✕ Reject
              </button>
            </>
          )}
          {runner.status === 'active' && (
            <button
              className="btn btn-sm"
              disabled={saving}
              style={{ background: 'var(--color-warning-bg)', color: 'var(--terracotta-600)' }}
              onClick={async () => {
                try {
                  setSaving(true);
                  await updateRunner(runner.id, { status: 'suspended' });
                  onMessage({ type: 'success', text: 'Runner suspended.' });
                  await onUpdate();
                } catch (err) {
                  onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to suspend' });
                } finally {
                  setSaving(false);
                }
              }}
            >
              Suspend
            </button>
          )}
          {runner.status === 'suspended' && (
            <button
              className="btn btn-sm"
              disabled={saving}
              style={{ background: 'var(--color-warning-bg)', color: 'var(--terracotta-600)' }}
              onClick={async () => {
                try {
                  setSaving(true);
                  await updateRunner(runner.id, { status: 'probation' });
                  onMessage({ type: 'success', text: 'Runner moved to probation for re-training.' });
                  await onUpdate();
                } catch (err) {
                  onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update' });
                } finally {
                  setSaving(false);
                }
              }}
            >
              Re-train
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function RunnersPage() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [receipts, setReceipts] = useState<RunnerReceipt[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [runnersData, ordersData, receiptsData, templesData] = await Promise.all([
        getRunners(),
        getOrders(),
        getReceipts(),
        getTemples(),
      ]);
      setRunners(runnersData);
      setOrders(ordersData);
      setReceipts(receiptsData);
      setTemples(templesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Derived data ──
  const getRunnerOrderCount = (runnerId: string) =>
    orders.filter(o => o.runner_id === runnerId).length;

  const getRunnerEarnings = (runnerId: string): number =>
    receipts
      .filter(r => r.runner_id === runnerId && r.status === 'verified')
      .reduce((sum, r) => sum + (r.product_cost || 0) + (r.transport_cost || 0) + (r.other_cost || 0), 0);

  const getRunnerTemples = (runnerId: string): string[] => {
    const templeIds = new Set(
      orders.filter(o => o.runner_id === runnerId).map(o => o.temple_id)
    );
    return Array.from(templeIds).map(id => temples.find(t => t.id === id)?.name || id);
  };

  const filteredRunners = statusFilter === 'all'
    ? runners
    : runners.filter(r => r.status === statusFilter);

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-main" style={{ marginLeft: 0 }}>
          <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>⏳</div>
              <p className="text-muted">Loading runners...</p>
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
              <span>Error loading data: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="admin-main" style={{ marginLeft: 0 }}>
        <div className="admin-content">
          {/* Save message toast */}
          {saveMessage && (
            <div className={`alert ${saveMessage.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span>{saveMessage.type === 'success' ? '✅' : '🚨'}</span>
                <span>{saveMessage.text}</span>
              </div>
              <button onClick={() => setSaveMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
          )}

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontWeight: 600 }}>Runner Management</h2>
          </div>

          {/* Status Filter */}
          <div className="filter-bar" style={{ marginBottom: 'var(--space-4)' }}>
            <span
              className={`category-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({runners.length})
            </span>
            <span
              className={`category-pill ${statusFilter === 'probation' ? 'active' : ''}`}
              onClick={() => setStatusFilter('probation')}
            >
              Probation ({runners.filter(r => r.status === 'probation').length})
            </span>
            <span
              className={`category-pill ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              Active ({runners.filter(r => r.status === 'active').length})
            </span>
            <span
              className={`category-pill ${statusFilter === 'suspended' ? 'active' : ''}`}
              onClick={() => setStatusFilter('suspended')}
            >
              Suspended ({runners.filter(r => r.status === 'suspended').length})
            </span>
            <span
              className={`category-pill ${statusFilter === 'banned' ? 'active' : ''}`}
              onClick={() => setStatusFilter('banned')}
            >
              Banned ({runners.filter(r => r.status === 'banned').length})
            </span>
          </div>

          {/* Runners Table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>Runner</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Tier</th>
                <th>Quality</th>
                <th>Temples</th>
                <th>Orders</th>
                <th>Earnings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRunners.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                    No runners found.
                  </td>
                </tr>
              ) : (
                filteredRunners.map(runner => {
                  const runnerTemples = getRunnerTemples(runner.id);
                  const orderCount = getRunnerOrderCount(runner.id);
                  const earnings = getRunnerEarnings(runner.id);
                  return (
                    <tr key={runner.id}>
                      <td>
                        <strong>{runner.name}</strong>
                        <div className="text-xs text-muted">Joined {formatDate(runner.created_at)}</div>
                      </td>
                      <td style={{ fontSize: 'var(--text-sm)' }}>{runner.email || '—'}</td>
                      <td style={{ fontSize: 'var(--text-sm)' }}>{runner.phone || '—'}</td>
                      <td>
                        <span className={`badge ${tierBadge(runner.tier)}`} style={{ textTransform: 'none' }}>
                          {tierEmoji(runner.tier)} {runner.tier.charAt(0).toUpperCase() + runner.tier.slice(1)}
                        </span>
                      </td>
                      <td>
                        <QualityCircle score={runner.quality_score} />
                      </td>
                      <td style={{ fontSize: 'var(--text-sm)' }}>
                        {runnerTemples.length > 0 ? runnerTemples.join(', ') : '—'}
                      </td>
                      <td>{orderCount}</td>
                      <td>{earnings > 0 ? `RM${earnings.toFixed(0)}` : '—'}</td>
                      <td>
                        <span className={`badge ${statusBadge(runner.status)}`} style={{ textTransform: 'none' }}>
                          {runner.status === 'active' ? '● ' : runner.status === 'probation' ? '🟡 ' : runner.status === 'suspended' ? '🔴 ' : runner.status === 'banned' ? '🚫 ' : '○ '}
                          {runner.status.charAt(0).toUpperCase() + runner.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                        {runner.status === 'probation' && (
                          <>
                            <button className="btn btn-primary btn-sm" disabled={saving} onClick={async () => {
                              try {
                                setSaving(true);
                                await updateRunner(runner.id, { status: 'active' });
                                setSaveMessage({ type: 'success', text: `${runner.name} approved!` });
                                await loadData();
                              } catch (err) {
                                setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to approve' });
                              } finally {
                                setSaving(false);
                              }
                            }}>
                              Approve
                            </button>
                            <button
                              className="btn btn-sm"
                              disabled={saving}
                              style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
                              onClick={async () => {
                                try {
                                  setSaving(true);
                                  await updateRunner(runner.id, { status: 'banned' });
                                  setSaveMessage({ type: 'success', text: `${runner.name} rejected.` });
                                  await loadData();
                                } catch (err) {
                                  setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to reject' });
                                } finally {
                                  setSaving(false);
                                }
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {runner.status === 'active' && (
                          <button
                            className="btn btn-sm"
                            disabled={saving}
                            style={{ background: 'var(--color-warning-bg)', color: 'var(--terracotta-600)' }}
                            onClick={async () => {
                              try {
                                setSaving(true);
                                await updateRunner(runner.id, { status: 'suspended' });
                                setSaveMessage({ type: 'success', text: `${runner.name} suspended.` });
                                await loadData();
                              } catch (err) {
                                setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to suspend' });
                              } finally {
                                setSaving(false);
                              }
                            }}
                          >
                            Suspend
                          </button>
                        )}
                        {runner.status === 'suspended' && (
                          <button
                            className="btn btn-sm"
                            disabled={saving}
                            style={{ background: 'var(--color-warning-bg)', color: 'var(--terracotta-600)' }}
                            onClick={async () => {
                              try {
                                setSaving(true);
                                await updateRunner(runner.id, { status: 'probation' });
                                setSaveMessage({ type: 'success', text: `${runner.name} moved to probation.` });
                                await loadData();
                              } catch (err) {
                                setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update' });
                              } finally {
                                setSaving(false);
                              }
                            }}
                          >
                            Re-train
                          </button>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRunner(runner)}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Tier Explanation Cards */}
          <div className="grid grid-4" style={{ gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
            <div style={{ background: 'var(--stone-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>🥉</div>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Bronze</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>0-50 orders<br />Score &lt;70</div>
            </div>
            <div style={{ background: 'var(--stone-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>🥈</div>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Silver</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>50-200 orders<br />Score 70-85</div>
            </div>
            <div style={{ background: 'var(--amber-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>🥇</div>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Gold</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>200+ orders<br />Score 85-95<br />+15% fee</div>
            </div>
            <div style={{ background: 'var(--earth-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>💎</div>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Platinum</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>500+ orders<br />Score 95+<br />Retainer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Runner Detail Modal */}
      <Modal
        open={!!selectedRunner}
        onClose={() => { setSelectedRunner(null); setSaveMessage(null); }}
        title="Runner Details"
      >
        {selectedRunner && (
          <RunnerDetailModal
            runner={selectedRunner}
            orders={orders}
            receipts={receipts}
            temples={temples}
            onClose={() => setSelectedRunner(null)}
            onUpdate={loadData}
            onMessage={setSaveMessage}
            saving={saving}
            setSaving={setSaving}
          />
        )}
      </Modal>
    </div>
  );
}
