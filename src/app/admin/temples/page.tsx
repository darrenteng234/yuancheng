'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getTemples,
  createTemple,
  updateTemple,
  getProducts,
} from '@/lib/api';
import {
  getRunners,
  createRunner,
  updateRunner,
} from '@/lib/api';
import {
  getTempleRequests,
  createTempleRequest,
} from '@/lib/api';
import {
  getOrders,
} from '@/lib/api';
import {
  getReceipts,
} from '@/lib/api';
import type { Temple, Runner, TempleRequest, Order, RunnerReceipt, Product } from '@/types';
import PhotoUpload from '@/components/PhotoUpload';

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

function verificationBadge(status: string): string {
  return status === 'verified' ? 'badge-brown' : 'badge-gray';
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
        style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', margin: 'var(--space-4)' }}
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

// ── Input Field Component ──
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>
        {label}
        {required && <span style={{ color: 'var(--color-error)' }}> *</span>}
      </label>
      {children}
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

// ── Main Page ──
export default function TemplesPage() {
  const [activeTab, setActiveTab] = useState<'temples' | 'runners' | 'requests'>('temples');

  const [temples, setTemples] = useState<Temple[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [templeRequests, setTempleRequests] = useState<TempleRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [receipts, setReceipts] = useState<RunnerReceipt[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product[]>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Modal States ──
  const [showAddTemple, setShowAddTemple] = useState(false);
  const [showEditTemple, setShowEditTemple] = useState<Temple | null>(null);
  const [showAddRunner, setShowAddRunner] = useState(false);
  const [showViewRunner, setShowViewRunner] = useState<Runner | null>(null);
  const [showViewRequest, setShowViewRequest] = useState<TempleRequest | null>(null);

  // ── Form Loading States ──
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [templesData, runnersData, requestsData, ordersData, receiptsData] = await Promise.all([
        getTemples(),
        getRunners(),
        getTempleRequests(),
        getOrders(),
        getReceipts(),
      ]);
      setTemples(templesData);
      setRunners(runnersData);
      setTempleRequests(requestsData);
      setOrders(ordersData);
      setReceipts(receiptsData);

      // Load products per temple
      const pMap: Record<string, Product[]> = {};
      for (const t of templesData) {
        try {
          pMap[t.id] = await getProducts(t.id);
        } catch {
          pMap[t.id] = [];
        }
      }
      setProductsMap(pMap);
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
  const getTempleOrderCount = (templeId: string) =>
    orders.filter(o => o.temple_id === templeId).length;

  const getTempleRunnerCount = (templeId: string) =>
    runners.filter(r => (r as unknown as { temple_id?: string }).temple_id === templeId).length;

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

  // ── Action Handlers ──
  const handleManageTemple = (temple: Temple) => {
    setShowEditTemple(temple);
  };

  const handleApproveRunner = async (runner: Runner) => {
    try {
      setSaving(true);
      await updateRunner(runner.id, { status: 'active' });
      setSaveMessage({ type: 'success', text: `${runner.name} approved! Congratulations email sent.` });
      await loadData();
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to approve runner' });
    } finally {
      setSaving(false);
    }
  };

  const handleRejectRunner = async (runner: Runner) => {
    try {
      setSaving(true);
      await updateRunner(runner.id, { status: 'banned' });
      setSaveMessage({ type: 'success', text: `${runner.name} rejected.` });
      await loadData();
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to reject runner' });
    } finally {
      setSaving(false);
    }
  };

  const handleSuspendRunner = async (runner: Runner) => {
    try {
      setSaving(true);
      await updateRunner(runner.id, { status: 'suspended' });
      setSaveMessage({ type: 'success', text: `${runner.name} suspended.` });
      await loadData();
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to suspend runner' });
    } finally {
      setSaving(false);
    }
  };

  const handleRetrainRunner = async (runner: Runner) => {
    try {
      setSaving(true);
      await updateRunner(runner.id, { status: 'probation' });
      setSaveMessage({ type: 'success', text: `${runner.name} moved to probation for re-training.` });
      await loadData();
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update runner' });
    } finally {
      setSaving(false);
    }
  };

  const handleViewRunner = (runner: Runner) => {
    setShowViewRunner(runner);
  };

  const handleStartResearch = async (req: TempleRequest) => {
    try {
      setSaving(true);
      await createTempleRequest({
        id: req.id,
        status: 'researching',
      } as Partial<TempleRequest>);
      await loadData();
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update request' });
    } finally {
      setSaving(false);
    }
  };

  const handleViewRequest = (req: TempleRequest) => {
    setShowViewRequest(req);
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-main" style={{ marginLeft: 0 }}>
          <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>⏳</div>
              <p className="text-muted">Loading temples & runners...</p>
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

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
            <button
              className={`tab ${activeTab === 'temples' ? 'active' : ''}`}
              onClick={() => setActiveTab('temples')}
            >
              Temples ({temples.length})
            </button>
            <button
              className={`tab ${activeTab === 'runners' ? 'active' : ''}`}
              onClick={() => setActiveTab('runners')}
            >
              Runners ({runners.length})
            </button>
            <button
              className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Requests ({templeRequests.length})
            </button>
          </div>

          {/* ═══════════════════════════════════════════
              TEMPLES TAB
              ═══════════════════════════════════════════ */}
          {activeTab === 'temples' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontWeight: 600 }}>Temple Management</h2>
                <button className="btn btn-primary" onClick={() => { setSaveMessage(null); setShowAddTemple(true); }}>
                  + Add Temple
                </button>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Temple</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Products</th>
                    <th>Runners</th>
                    <th>Orders</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {temples.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                        No temples yet. Click "Add Temple" to create one.
                      </td>
                    </tr>
                  ) : (
                    temples.map(temple => (
                      <tr key={temple.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            {temple.photos && temple.photos.length > 0 && (
                              <img
                                src={temple.photos[0]}
                                alt={temple.name}
                                style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
                              />
                            )}
                            <strong>{temple.name}</strong>
                          </div>
                        </td>
                        <td>{temple.city}, {temple.country}</td>
                        <td>
                          <span className={`badge ${statusBadge(temple.status)}`} style={{ textTransform: 'none' }}>
                            {temple.status === 'active' ? '● ' : temple.status === 'researching' ? '🟡 ' : '○ '}
                            {temple.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${verificationBadge(temple.verification_status)}`} style={{ textTransform: 'none' }}>
                            {temple.verification_status === 'verified' ? '✓ Verified' : '○ Unverified'}
                          </span>
                        </td>
                        <td>{productsMap[temple.id]?.length ?? '—'}</td>
                        <td>
                          {getTempleRunnerCount(temple.id) > 0 ? (
                            <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                              {getTempleRunnerCount(temple.id)} ⚠️
                            </span>
                          ) : '0'}
                        </td>
                        <td>{getTempleOrderCount(temple.id)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleManageTemple(temple)}>Manage</button>
                            <a className="btn btn-primary btn-sm" href={`/admin/temple-content?id=${temple.id}`}>Content</a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Research Workflow */}
              <div className="card mt-6">
                <div className="card-body">
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Research Workflow</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', fontSize: 'var(--text-sm)' }}>
                    <span className="badge badge-gray" style={{ textTransform: 'none' }}>○ Requested</span>
                    <span>→</span>
                    <span className="badge badge-orange" style={{ textTransform: 'none' }}>🟡 Researching</span>
                    <span>→</span>
                    <span className="badge badge-brown" style={{ textTransform: 'none' }}>📋 SOP Drafted</span>
                    <span>→</span>
                    <span className="badge badge-brown" style={{ textTransform: 'none' }}>🏃 Runner Ready</span>
                    <span>→</span>
                    <span className="badge badge-green" style={{ textTransform: 'none' }}>● Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              RUNNERS TAB
              ═══════════════════════════════════════════ */}
          {activeTab === 'runners' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div className="filter-bar" style={{ marginBottom: 0 }}>
                  <span className="category-pill active">All ({runners.length})</span>
                  <span className="category-pill">Active ({runners.filter(r => r.status === 'active').length})</span>
                  <span className="category-pill">Probation ({runners.filter(r => r.status === 'probation').length})</span>
                  <span className="category-pill">Bronze</span>
                  <span className="category-pill">Gold</span>
                </div>
                <button className="btn btn-primary" onClick={() => { setSaveMessage(null); setShowAddRunner(true); }}>
                  + Add Runner
                </button>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Runner</th>
                    <th>Tier</th>
                    <th>Temples</th>
                    <th>Quality</th>
                    <th>Orders</th>
                    <th>Return Rate</th>
                    <th>Status</th>
                    <th>Earnings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {runners.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                        No runners yet. Click "Add Runner" to create one.
                      </td>
                    </tr>
                  ) : (
                    runners.map(runner => {
                      const runnerTemples = getRunnerTemples(runner.id);
                      const orderCount = getRunnerOrderCount(runner.id);
                      const earnings = getRunnerEarnings(runner.id);
                      return (
                        <tr key={runner.id}>
                          <td>
                            <strong>{runner.name}</strong>
                            <div className="text-xs text-muted">Joined {formatDate(runner.created_at)}</div>
                          </td>
                          <td>
                            <span className={`badge ${tierBadge(runner.tier)}`} style={{ textTransform: 'none' }}>
                              {tierEmoji(runner.tier)} {runner.tier.charAt(0).toUpperCase() + runner.tier.slice(1)}
                            </span>
                          </td>
                          <td>{runnerTemples.length > 0 ? runnerTemples.join(', ') : '—'}</td>
                          <td>
                            <QualityCircle score={runner.quality_score} />
                          </td>
                          <td>{orderCount}</td>
                          <td style={{
                            color: runner.return_rate > 40 ? 'var(--color-error)' : runner.return_rate > 20 ? 'var(--color-warning)' : 'var(--color-success)',
                          }}>
                            {runner.return_rate}%
                          </td>
                          <td>
                            <span className={`badge ${statusBadge(runner.status)}`} style={{ textTransform: 'none' }}>
                              {runner.status === 'active' ? '● ' : runner.status === 'probation' ? '🟡 ' : runner.status === 'suspended' ? '🔴 ' : '○ '}
                              {runner.status.charAt(0).toUpperCase() + runner.status.slice(1)}
                            </span>
                          </td>
                          <td>{earnings > 0 ? `RM${earnings.toFixed(0)}` : '—'}</td>
                          <td style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                            {runner.status === 'probation' ? (
                              <>
                                <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => handleApproveRunner(runner)}>
                                  {saving ? '...' : '✓ Approve'}
                                </button>
                                <button
                                  className="btn btn-sm"
                                  disabled={saving}
                                  style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
                                  onClick={() => handleRejectRunner(runner)}
                                >
                                  {saving ? '...' : '✕ Reject'}
                                </button>
                              </>
                            ) : runner.status === 'active' ? (
                              <button
                                className="btn btn-sm"
                                disabled={saving}
                                style={{ background: 'var(--color-warning-bg)', color: 'var(--terracotta-600)' }}
                                onClick={() => handleSuspendRunner(runner)}
                              >
                                {saving ? '...' : 'Suspend'}
                              </button>
                            ) : runner.status === 'suspended' ? (
                              <button
                                className="btn btn-sm"
                                disabled={saving}
                                style={{ background: 'var(--color-warning-bg)', color: 'var(--terracotta-600)' }}
                                onClick={() => handleRetrainRunner(runner)}
                              >
                                {saving ? '...' : 'Re-train'}
                              </button>
                            ) : null}
                            <button className="btn btn-secondary btn-sm" onClick={() => handleViewRunner(runner)}>View</button>
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
          )}

          {/* ═══════════════════════════════════════════
              REQUESTS TAB
              ═══════════════════════════════════════════ */}
          {activeTab === 'requests' && (
            <div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Temple</th>
                    <th>Country</th>
                    <th>Requested By</th>
                    <th>Count</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templeRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                        No temple requests yet
                      </td>
                    </tr>
                  ) : (
                    templeRequests.map(req => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.temple_name}</strong>
                          {req.city && <div className="text-xs text-muted">{req.city}</div>}
                        </td>
                        <td>{req.country}</td>
                        <td>{req.requested_by || '—'}</td>
                        <td>{req.request_count}</td>
                        <td>
                          <span className={`badge ${statusBadge(req.status)}`} style={{ textTransform: 'none' }}>
                            {req.status === 'researching' ? '🟡 ' : '○ '}
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {req.status === 'pending' ? (
                            <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => handleStartResearch(req)}>
                              {saving ? '...' : 'Start Research'}
                            </button>
                          ) : (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleViewRequest(req)}>View</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Multi-country info alert */}
              <div className="alert alert-info" style={{ marginTop: 'var(--space-4)' }}>
                <span>💡</span>
                <div>
                  <strong>Multi-country note:</strong> Temples in different countries require localized setup — local entity, currency pricing, payment methods, and data protection compliance.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          ADD TEMPLE MODAL
          ═══════════════════════════════════════════ */}
      <Modal
        open={showAddTemple}
        onClose={() => { setShowAddTemple(false); setSaveMessage(null); }}
        title="Add New Temple"
      >
        <AddTempleForm
          onClose={() => setShowAddTemple(false)}
          onSave={loadData}
          onMessage={setSaveMessage}
          saving={saving}
          setSaving={setSaving}
        />
      </Modal>

      {/* ═══════════════════════════════════════════
          EDIT TEMPLE MODAL
          ═══════════════════════════════════════════ */}
      <Modal
        open={!!showEditTemple}
        onClose={() => { setShowEditTemple(null); setSaveMessage(null); }}
        title={`Manage Temple: ${showEditTemple?.name || ''}`}
      >
        {showEditTemple && (
          <EditTempleForm
            temple={showEditTemple}
            onClose={() => setShowEditTemple(null)}
            onSave={loadData}
            onMessage={setSaveMessage}
            saving={saving}
            setSaving={setSaving}
          />
        )}
      </Modal>

      {/* ═══════════════════════════════════════════
          ADD RUNNER MODAL
          ═══════════════════════════════════════════ */}
      <Modal
        open={showAddRunner}
        onClose={() => { setShowAddRunner(false); setSaveMessage(null); }}
        title="Add New Runner"
      >
        <AddRunnerForm
          onClose={() => setShowAddRunner(false)}
          onSave={loadData}
          onMessage={setSaveMessage}
          saving={saving}
          setSaving={setSaving}
        />
      </Modal>

      {/* ═══════════════════════════════════════════
          VIEW RUNNER MODAL
          ═══════════════════════════════════════════ */}
      <Modal
        open={!!showViewRunner}
        onClose={() => { setShowViewRunner(null); setSaveMessage(null); }}
        title="Runner Details"
      >
        {showViewRunner && (
          <ViewRunnerForm
            runner={showViewRunner}
            orders={orders}
            receipts={receipts}
            temples={temples}
            onClose={() => setShowViewRunner(null)}
            onUpdate={loadData}
            onMessage={setSaveMessage}
            saving={saving}
            setSaving={setSaving}
          />
        )}
      </Modal>

      {/* ═══════════════════════════════════════════
          VIEW REQUEST MODAL
          ═══════════════════════════════════════════ */}
      <Modal
        open={!!showViewRequest}
        onClose={() => { setShowViewRequest(null); setSaveMessage(null); }}
        title="Temple Request Details"
      >
        {showViewRequest && (
          <ViewRequestForm
            request={showViewRequest}
            onClose={() => setShowViewRequest(null)}
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

// ═══════════════════════════════════════════════════
// ADD TEMPLE FORM
// ═══════════════════════════════════════════════════
function AddTempleForm({
  onClose,
  onSave,
  onMessage,
  saving,
  setSaving,
}: {
  onClose: () => void;
  onSave: () => Promise<void>;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    country: '',
    city: '',
    address: '',
    status: 'pending' as Temple['status'],
    verification_status: 'unverified' as Temple['verification_status'],
    notes: '',
    short_description: '',
    short_description_zh: '',
    prayer_tags: '',
    prayer_tags_zh: '',
  });
  const [formPhotos, setFormPhotos] = useState<string[]>([]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.country || !form.city) {
      onMessage({ type: 'error', text: 'Name, Country, and City are required.' });
      return;
    }
    try {
      setSaving(true);
      await createTemple({
        ...form,
        prayer_tags: form.prayer_tags ? form.prayer_tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        prayer_tags_zh: form.prayer_tags_zh ? form.prayer_tags_zh.split(',').map(t => t.trim()).filter(Boolean) : [],
        photos: formPhotos,
      });
      onMessage({ type: 'success', text: 'Temple created successfully!' });
      await onSave();
      onClose();
    } catch (err) {
      onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create temple' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Temple Name" required>
        <input
          style={inputStyle}
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g. Kek Lok Si Temple"
          required
        />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <FormField label="Country" required>
          <input
            style={inputStyle}
            value={form.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="e.g. Malaysia"
            required
          />
        </FormField>
        <FormField label="City" required>
          <input
            style={inputStyle}
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="e.g. Penang"
            required
          />
        </FormField>
      </div>
      <FormField label="Address">
        <input
          style={inputStyle}
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Full address (optional)"
        />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <FormField label="Status">
          <select
            style={selectStyle}
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="researching">Researching</option>
            <option value="sop_drafted">SOP Drafted</option>
            <option value="runner_ready">Runner Ready</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </FormField>
        <FormField label="Verification">
          <select
            style={selectStyle}
            value={form.verification_status}
            onChange={(e) => handleChange('verification_status', e.target.value)}
          >
            <option value="unverified">Unverified</option>
            <option value="verified">Verified</option>
          </select>
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: 'vertical' as const }}
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional notes..."
        />
      </FormField>
      <FormField label="Short Description (English)">
        <textarea
          style={{ ...inputStyle, minHeight: 50, resize: 'vertical' as const }}
          value={form.short_description}
          onChange={(e) => handleChange('short_description', e.target.value)}
          placeholder="e.g. Four-Faced Brahma shrine in central Bangkok. Known for career, wealth, health, and relationships."
        />
      </FormField>
      <FormField label="Short Description (中文)">
        <textarea
          style={{ ...inputStyle, minHeight: 50, resize: 'vertical' as const }}
          value={form.short_description_zh}
          onChange={(e) => handleChange('short_description_zh', e.target.value)}
          placeholder="e.g. 位于曼谷市中心的四面佛。掌管事业、财富、健康、感情。"
        />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <FormField label="Prayer Tags (English)">
          <input
            style={inputStyle}
            value={form.prayer_tags}
            onChange={(e) => handleChange('prayer_tags', e.target.value)}
            placeholder="Career, Wealth, Health, Relationships"
          />
        </FormField>
        <FormField label="Prayer Tags (中文)">
          <input
            style={inputStyle}
            value={form.prayer_tags_zh}
            onChange={(e) => handleChange('prayer_tags_zh', e.target.value)}
            placeholder="事业, 财富, 健康, 感情"
          />
        </FormField>
      </div>
      <FormField label="Photos">
        <PhotoUpload
          photos={formPhotos}
          onChange={setFormPhotos}
          folder="temples"
          maxPhotos={10}
        />
      </FormField>
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Creating...' : 'Create Temple'}
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════
// EDIT TEMPLE FORM
// ═══════════════════════════════════════════════════
function EditTempleForm({
  temple,
  onClose,
  onSave,
  onMessage,
  saving,
  setSaving,
}: {
  temple: Temple;
  onClose: () => void;
  onSave: () => Promise<void>;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: temple.name,
    country: temple.country,
    city: temple.city,
    address: temple.address || '',
    status: temple.status,
    verification_status: temple.verification_status,
    notes: temple.notes || '',
    short_description: temple.short_description || '',
    short_description_zh: temple.short_description_zh || '',
    prayer_tags: (temple.prayer_tags || []).join(', '),
    prayer_tags_zh: (temple.prayer_tags_zh || []).join(', '),
  });
  const [formPhotos, setFormPhotos] = useState<string[]>(temple.photos || []);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.country || !form.city) {
      onMessage({ type: 'error', text: 'Name, Country, and City are required.' });
      return;
    }
    try {
      setSaving(true);
      await updateTemple(temple.id, {
        ...form,
        prayer_tags: form.prayer_tags ? form.prayer_tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        prayer_tags_zh: form.prayer_tags_zh ? form.prayer_tags_zh.split(',').map(t => t.trim()).filter(Boolean) : [],
        photos: formPhotos,
      });
      onMessage({ type: 'success', text: 'Temple updated successfully!' });
      await onSave();
      onClose();
    } catch (err) {
      onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update temple' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Temple Name" required>
        <input
          style={inputStyle}
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <FormField label="Country" required>
          <input
            style={inputStyle}
            value={form.country}
            onChange={(e) => handleChange('country', e.target.value)}
            required
          />
        </FormField>
        <FormField label="City" required>
          <input
            style={inputStyle}
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            required
          />
        </FormField>
      </div>
      <FormField label="Address">
        <input
          style={inputStyle}
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Full address (optional)"
        />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <FormField label="Status">
          <select
            style={selectStyle}
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="researching">Researching</option>
            <option value="sop_drafted">SOP Drafted</option>
            <option value="runner_ready">Runner Ready</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </FormField>
        <FormField label="Verification">
          <select
            style={selectStyle}
            value={form.verification_status}
            onChange={(e) => handleChange('verification_status', e.target.value)}
          >
            <option value="unverified">Unverified</option>
            <option value="verified">Verified</option>
          </select>
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: 'vertical' as const }}
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional notes..."
        />
      </FormField>
      <FormField label="Short Description (English)">
        <textarea
          style={{ ...inputStyle, minHeight: 50, resize: 'vertical' as const }}
          value={form.short_description}
          onChange={(e) => handleChange('short_description', e.target.value)}
          placeholder="e.g. Four-Faced Brahma shrine in central Bangkok. Known for career, wealth, health, and relationships."
        />
      </FormField>
      <FormField label="Short Description (中文)">
        <textarea
          style={{ ...inputStyle, minHeight: 50, resize: 'vertical' as const }}
          value={form.short_description_zh}
          onChange={(e) => handleChange('short_description_zh', e.target.value)}
          placeholder="e.g. 位于曼谷市中心的四面佛。掌管事业、财富、健康、感情。"
        />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <FormField label="Prayer Tags (English)">
          <input
            style={inputStyle}
            value={form.prayer_tags}
            onChange={(e) => handleChange('prayer_tags', e.target.value)}
            placeholder="Career, Wealth, Health, Relationships"
          />
        </FormField>
        <FormField label="Prayer Tags (中文)">
          <input
            style={inputStyle}
            value={form.prayer_tags_zh}
            onChange={(e) => handleChange('prayer_tags_zh', e.target.value)}
            placeholder="事业, 财富, 健康, 感情"
          />
        </FormField>
      </div>
      <FormField label="Photos">
        <PhotoUpload
          photos={formPhotos}
          onChange={setFormPhotos}
          folder="temples"
          maxPhotos={10}
        />
      </FormField>
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════
// ADD RUNNER FORM
// ═══════════════════════════════════════════════════
function AddRunnerForm({
  onClose,
  onSave,
  onMessage,
  saving,
  setSaving,
}: {
  onClose: () => void;
  onSave: () => Promise<void>;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    tier: 'bronze' as Runner['tier'],
    quality_score: 70,
    status: 'active' as Runner['status'],
    return_rate: 0,
    notes: '',
  });

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      onMessage({ type: 'error', text: 'Runner name is required.' });
      return;
    }
    try {
      setSaving(true);
      await createRunner(form);
      onMessage({ type: 'success', text: 'Runner created successfully!' });
      await onSave();
      onClose();
    } catch (err) {
      onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create runner' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Runner Name" required>
        <input
          style={inputStyle}
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g. Ahmad bin Ismail"
          required
        />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <FormField label="Phone">
          <input
            style={inputStyle}
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="e.g. +6012-3456789"
          />
        </FormField>
        <FormField label="Email">
          <input
            style={inputStyle}
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="e.g. ahmad@email.com"
          />
        </FormField>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <FormField label="Tier">
          <select
            style={selectStyle}
            value={form.tier}
            onChange={(e) => handleChange('tier', e.target.value)}
          >
            <option value="bronze">🥉 Bronze</option>
            <option value="silver">🥈 Silver</option>
            <option value="gold">🥇 Gold</option>
            <option value="platinum">💎 Platinum</option>
          </select>
        </FormField>
        <FormField label="Status">
          <select
            style={selectStyle}
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="active">● Active</option>
            <option value="probation">🟡 Probation</option>
            <option value="suspended">🔴 Suspended</option>
            <option value="banned">🚫 Banned</option>
          </select>
        </FormField>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <FormField label="Quality Score (0-100)">
          <input
            style={inputStyle}
            type="number"
            min={0}
            max={100}
            value={form.quality_score}
            onChange={(e) => handleChange('quality_score', parseInt(e.target.value) || 0)}
          />
        </FormField>
        <FormField label="Return Rate (%)">
          <input
            style={inputStyle}
            type="number"
            min={0}
            max={100}
            value={form.return_rate}
            onChange={(e) => handleChange('return_rate', parseInt(e.target.value) || 0)}
          />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: 'vertical' as const }}
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional notes..."
        />
      </FormField>
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Creating...' : 'Create Runner'}
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════
// VIEW RUNNER DETAIL FORM
// ═══════════════════════════════════════════════════
function ViewRunnerForm({
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
  const [newStatus, setNewStatus] = useState(runner.status);

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
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Tier:</span>{' '}
            <span className={`badge ${tierBadge(runner.tier)}`} style={{ textTransform: 'none' }}>
              {tierEmoji(runner.tier)} {runner.tier.charAt(0).toUpperCase() + runner.tier.slice(1)}
            </span>
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

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// VIEW REQUEST DETAIL FORM
// ═══════════════════════════════════════════════════
function ViewRequestForm({
  request,
  onClose,
  onUpdate,
  onMessage,
  saving,
  setSaving,
}: {
  request: TempleRequest;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(request.status);

  const handleStatusUpdate = async () => {
    try {
      setSaving(true);
      await createTempleRequest({ id: request.id, status: newStatus } as Partial<TempleRequest>);
      onMessage({ type: 'success', text: `Request status updated to ${newStatus}` });
      await onUpdate();
      setEditingStatus(false);
    } catch (err) {
      onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update request' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Temple:</span>{' '}
            <strong>{request.temple_name}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Country:</span>{' '}
            {request.country}
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>City:</span>{' '}
            {request.city || '—'}
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Requested By:</span>{' '}
            {request.requested_by || '—'}
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Request Count:</span>{' '}
            <strong>{request.request_count}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
            {!editingStatus ? (
              <>
                <span className={`badge ${statusBadge(request.status)}`} style={{ textTransform: 'none' }}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
                  onChange={(e) => setNewStatus(e.target.value as TempleRequest['status'])}
                >
                  <option value="pending">Pending</option>
                  <option value="researching">Researching</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
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
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Created:</span>{' '}
            {formatDate(request.created_at)}
          </div>
        </div>
      </div>

      {request.notes && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Notes</h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', background: 'var(--stone-50)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)' }}>
            {request.notes}
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Quick Actions</h4>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {request.status === 'pending' && (
            <button
              className="btn btn-primary btn-sm"
              disabled={saving}
              onClick={async () => {
                try {
                  setSaving(true);
                  await createTempleRequest({ id: request.id, status: 'researching' } as Partial<TempleRequest>);
                  onMessage({ type: 'success', text: 'Research started!' });
                  await onUpdate();
                } catch (err) {
                  onMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update' });
                } finally {
                  setSaving(false);
                }
              }}
            >
              🟡 Start Research
            </button>
          )}
          {(request.status === 'researching' || request.status === 'pending') && (
            <button
              className="btn btn-primary btn-sm"
              disabled={saving}
              onClick={async () => {
                try {
                  setSaving(true);
                  await createTempleRequest({ id: request.id, status: 'approved' } as Partial<TempleRequest>);
                  onMessage({ type: 'success', text: 'Request approved!' });
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
          )}
          {request.status !== 'rejected' && (
            <button
              className="btn btn-sm"
              disabled={saving}
              style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
              onClick={async () => {
                try {
                  setSaving(true);
                  await createTempleRequest({ id: request.id, status: 'rejected' } as Partial<TempleRequest>);
                  onMessage({ type: 'success', text: 'Request rejected.' });
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
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
