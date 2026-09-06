'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  getPackages,
  createPackage,
  updatePackage,
  getProducts,
  createProduct,
  updateProduct,
  getTemples,
  getRunners,
  getReceipts,
  createReceipt,
  updateReceipt,
} from '@/lib/api';
import {
  calculatePackage,
  formatRM,
  formatPercent,
  type ProductCost,
  type PackageCalculation,
} from '@/lib/calculations';
import type {
  Temple,
  Product,
  Package,
  Runner,
  RunnerReceipt,
  PackageProduct,
} from '@/types';
import PhotoUpload from '@/components/PhotoUpload';

// ── Toast notification component ──
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === 'success'
      ? 'var(--sage-600)'
      : type === 'error'
        ? 'var(--color-error)'
        : 'var(--earth-600)';

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        background: bgColor,
        color: 'white',
        padding: 'var(--space-3) var(--space-5)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        maxWidth: 400,
        animation: 'slideIn 0.2s ease-out',
      }}
    >
      <span style={{ fontSize: 'var(--text-lg)' }}>
        {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span style={{ fontSize: 'var(--text-sm)', flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '18px',
          padding: 0,
          opacity: 0.8,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── Helpers ──
function statusBadge(status: string): string {
  switch (status) {
    case 'active':
    case 'completed':
    case 'verified':
      return 'badge-green';
    case 'draft':
    case 'pending':
    case 'received':
      return 'badge-orange';
    case 'archived':
    case 'paused':
      return 'badge-gray';
    case 'rejected':
      return 'badge-red';
    default:
      return 'badge-gray';
  }
}

function evidenceBadges(evidence: string[]): string[] {
  return evidence.map((e) =>
    e === 'photo' ? '📸' : e === 'video' ? '🎥' : e === 'receipt' ? '🧾' : e === 'ovc' ? '🔳' : ''
  );
}

type TabKey = 'packages' | 'products' | 'runners';

// ── Package card with expandable breakdown ──
function PackageCard({
  pkg,
  products,
  onRefresh,
}: {
  pkg: Package & { package_products?: (PackageProduct & { product?: Product })[] };
  products: Product[];
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // Build product cost list for the calculator
  const productCosts: ProductCost[] = useMemo(() => {
    const pp = pkg.package_products || [];
    return pp
      .filter((p) => p.product)
      .map((p) => ({
        id: p.product_id,
        name: p.product!.name,
        costToRunner: p.product!.cost_to_runner,
        quantity: p.quantity,
      }));
  }, [pkg.package_products]);

  // Default transport cost — in a real app this would come from receipts or settings
  const transportCost = 10;

  const calc: PackageCalculation = useMemo(
    () => calculatePackage(pkg.selling_price, productCosts, transportCost),
    [pkg.selling_price, productCosts]
  );

  const marginGood = calc.marginPercent >= 15;
  const profitPositive = calc.profit >= 0;

  const statusBorderLeft =
    pkg.status === 'draft'
      ? '4px solid var(--color-warning)'
      : pkg.status === 'archived'
        ? '4px solid var(--stone-300)'
        : '4px solid var(--sage-500)';

  const handleStatusChange = async (newStatus: 'active' | 'draft' | 'archived') => {
    setStatusLoading(newStatus);
    try {
      await updatePackage(pkg.id, { status: newStatus });
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setStatusLoading(null);
    }
  };

  return (
    <div
      className="card"
      style={{
        marginBottom: 'var(--space-4)',
        borderLeft: statusBorderLeft,
        opacity: pkg.status === 'archived' ? 0.7 : 1,
      }}
      data-status={pkg.status}
    >
      <div className="card-body" style={{ padding: 'var(--space-5)' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h4 style={{ fontWeight: 700 }}>{pkg.name}</h4>
              <span className={`badge ${statusBadge(pkg.status)}`} style={{ textTransform: 'none' }}>
                ● {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-muted" style={{ marginTop: 'var(--space-1)' }}>
              {productCosts.length} products · {pkg.description || '48 hours'}
            </div>
            {pkg.photos && pkg.photos.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                {pkg.photos.slice(0, 5).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Package photo ${i + 1}`}
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                ))}
                {pkg.photos.length > 5 && (
                  <span
                    style={{
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--stone-100)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    +{pkg.photos.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
              {formatRM(pkg.selling_price)}
            </div>
            <div
              className="text-xs"
              style={{
                color: marginGood ? 'var(--sage-600)' : 'var(--color-error)',
                fontWeight: 600,
              }}
            >
              Margin: {formatPercent(calc.marginPercent)} · Profit: {formatRM(calc.profit)}
            </div>
          </div>
        </div>

        {/* Product badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', margin: 'var(--space-3) 0' }}>
          {productCosts.map((pc) => (
            <span
              key={pc.id}
              className="badge badge-gray"
              style={{ textTransform: 'none' }}
            >
              {pc.name} × {pc.quantity}
            </span>
          ))}
        </div>

        {/* Expandable cost breakdown */}
        <details
          open={expanded}
          onToggle={(e) => setExpanded((e.target as HTMLDetailsElement).open)}
          style={{ marginBottom: 'var(--space-3)' }}
        >
          <summary
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--earth-600)',
              cursor: 'pointer',
            }}
          >
            View cost breakdown & runner payment
          </summary>
          <div
            style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-3)',
              background: 'var(--stone-50)',
              borderRadius: 'var(--radius-sm)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)',
            }}
          >
            {/* Costs column */}
            <div style={{ fontSize: 'var(--text-sm)' }}>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Your Cost</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Products:</span>
                <span>{formatRM(calc.productCost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Transport:</span>
                <span>{formatRM(calc.transportCost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Gateway (2.5%):</span>
                <span>{formatRM(calc.gatewayFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Refund reserve (3%):</span>
                <span>{formatRM(calc.refundReserve)}</span>
              </div>
              <hr style={{ borderStyle: 'dashed', margin: 'var(--space-2) 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Total cost:</span>
                <span>{formatRM(calc.totalCost)}</span>
              </div>
            </div>
            {/* Revenue column */}
            <div style={{ fontSize: 'var(--text-sm)' }}>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Your Revenue</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Selling price:</span>
                <span>{formatRM(calc.sellingPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Your cost:</span>
                <span>{formatRM(calc.totalCost)}</span>
              </div>
              <hr style={{ borderStyle: 'dashed', margin: 'var(--space-2) 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Your profit:</span>
                <span
                  style={{
                    color: profitPositive ? 'var(--sage-600)' : 'var(--color-error)',
                  }}
                >
                  {formatRM(calc.profit)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>Runner gets:</span>
                <span style={{ fontStyle: 'italic', fontSize: 'var(--text-xs)' }}>
                  Receipt amounts (weekly payout)
                </span>
              </div>
            </div>
          </div>
        </details>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {pkg.status !== 'active' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleStatusChange('active')}
              disabled={statusLoading !== null}
            >
              {statusLoading === 'active' ? '⏳ Activating…' : 'Activate'}
            </button>
          )}
          {pkg.status === 'active' && (
            <button
              className="btn btn-warning btn-sm"
              onClick={() => handleStatusChange('draft')}
              disabled={statusLoading !== null}
            >
              {statusLoading === 'draft' ? '⏳ Saving…' : 'Set Draft'}
            </button>
          )}
          {pkg.status !== 'archived' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleStatusChange('archived')}
              disabled={statusLoading !== null}
            >
              {statusLoading === 'archived' ? '⏳ Archiving…' : 'Archive'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create Package Form (inline on the packages tab) ──
function CreatePackageForm({
  products,
  templeId,
  onCreated,
}: {
  products: Product[];
  templeId: string;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [fulfillmentTime, setFulfillmentTime] = useState('48 hours');
  const [sellingPrice, setSellingPrice] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<
    Record<string, { checked: boolean; quantity: number; cost: number; name: string }>
  >({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pkgPhotos, setPkgPhotos] = useState<string[]>([]);

  // Build selected product costs for real-time calculation
  const productCosts: ProductCost[] = useMemo(() => {
    return Object.entries(selectedProducts)
      .filter(([, v]) => v.checked && v.quantity > 0)
      .map(([id, v]) => ({
        id,
        name: v.name,
        costToRunner: v.cost,
        quantity: v.quantity,
      }));
  }, [selectedProducts]);

  const calc = useMemo(
    () => calculatePackage(sellingPrice, productCosts, 10),
    [sellingPrice, productCosts]
  );

  const handleCheck = (productId: string, checked: boolean) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        checked,
        quantity: checked ? (prev[productId]?.quantity || 1) : 0,
      },
    }));
  };

  const handleQty = (productId: string, qty: number) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], quantity: Math.max(1, qty) },
    }));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a package name.');
      return;
    }
    const selected = Object.entries(selectedProducts)
      .filter(([, v]) => v.checked && v.quantity > 0)
      .map(([id, v]) => ({ product_id: id, quantity: v.quantity }));

    if (selected.length === 0) {
      setError('Select at least one product.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createPackage(
        {
          temple_id: templeId,
          name: name.trim(),
          selling_price: sellingPrice,
          description: fulfillmentTime,
          status: 'active',
          photos: pkgPhotos,
        },
        selected
      );
      setName('');
      setSellingPrice(0);
      setSelectedProducts({});
      setPkgPhotos([]);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create package.');
    } finally {
      setSaving(false);
    }
  };

  if (products.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          color: 'var(--color-text-muted)',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: 'var(--space-3)' }}>📦</div>
        <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>
          No products yet
        </h3>
        <p className="text-sm">
          Add some products first to build packages from them.
        </p>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--amber-500)' }}
    >
      <div className="card-body" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          ✨ Create New Package
        </h3>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
            <span>🚨</span>
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Package Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Business Wish — Premium"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fulfillment Time</label>
            <input
              type="text"
              className="form-input"
              value={fulfillmentTime}
              onChange={(e) => setFulfillmentTime(e.target.value)}
              placeholder="e.g. 48 hours"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
          <label className="form-label">Package Photos</label>
          <PhotoUpload
            photos={pkgPhotos}
            onChange={setPkgPhotos}
            folder="packages"
          />
        </div>

        <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          Select Products & Quantities
        </h4>
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <table className="data-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Product</th>
                <th>Cost to Runner</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const sp = selectedProducts[p.id] || {
                  checked: false,
                  quantity: 1,
                  cost: p.cost_to_runner,
                  name: p.name,
                };
                return (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={sp.checked}
                        onChange={(e) => handleCheck(p.id, e.target.checked)}
                      />
                    </td>
                    <td>{p.name}</td>
                    <td>{formatRM(p.cost_to_runner)}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={sp.quantity}
                        style={{
                          width: 50,
                          textAlign: 'center',
                          padding: 'var(--space-1)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        onChange={(e) => handleQty(p.id, parseInt(e.target.value) || 1)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Live cost calculator */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--stone-50)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Products total:</span>
                <strong>{formatRM(calc.productCost)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Transport (est.):</span>
                <strong>{formatRM(calc.transportCost)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Gateway fee:</span>
                <strong>{formatRM(calc.gatewayFee)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Refund reserve:</span>
                <strong>{formatRM(calc.refundReserve)}</strong>
              </div>
              <hr style={{ borderStyle: 'dashed', margin: 'var(--space-2) 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Your total cost:</span>
                <strong>{formatRM(calc.totalCost)}</strong>
              </div>
            </div>
            <div>
              <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
                <label className="form-label">Selling Price (RM) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={sellingPrice || ''}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  step={1}
                  min={0}
                />
              </div>
              <hr style={{ borderStyle: 'dashed', margin: 'var(--space-3) 0' }} />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                }}
              >
                <span>Your Profit:</span>
                <strong
                  style={{
                    color: calc.profit >= 0 ? 'var(--sage-600)' : 'var(--color-error)',
                  }}
                >
                  {formatRM(calc.profit)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Margin:</span>
                <strong
                  style={{
                    color: calc.marginPercent >= 15 ? 'var(--sage-600)' : 'var(--color-error)',
                  }}
                >
                  {formatPercent(calc.marginPercent)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-4)',
          }}
        >
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? '⏳ Creating…' : 'Create Package'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Product Modal ──
function AddProductModal({
  templeId,
  onClose,
  onSuccess,
}: {
  templeId: string;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'physical' | 'service' | 'donation'>('physical');
  const [costToRunner, setCostToRunner] = useState('');
  const [evidenceRequired, setEvidenceRequired] = useState<string[]>(['photo', 'ovc']);
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a product name.');
      return;
    }
    const cost = parseFloat(costToRunner);
    if (isNaN(cost) || cost < 0) {
      setError('Please enter a valid cost.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const prod = await createProduct({
        temple_id: templeId,
        name: name.trim(),
        type,
        cost_to_runner: cost,
        evidence_required: evidenceRequired,
        photos: formPhotos,
        is_active: true,
      });
      onSuccess(prod);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        padding: 'var(--space-4)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="card-body"
          style={{ padding: 'var(--space-6)' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-5)',
            }}
          >
            <h3 style={{ fontWeight: 700 }}>Add New Product</h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
              <span>🚨</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jasmine Garland"
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as 'physical' | 'service' | 'donation')
                  }
                >
                  <option value="physical">Physical Offering</option>
                  <option value="service">Service</option>
                  <option value="donation">Donation</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cost to Runner (RM) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={costToRunner}
                  onChange={(e) => setCostToRunner(e.target.value)}
                  placeholder="0.00"
                  step={0.5}
                  min={0}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
              <label className="form-label">Evidence Required</label>
              <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                {[
                  { key: 'photo', label: '📸 Photo' },
                  { key: 'video', label: '🎥 Video' },
                  { key: 'receipt', label: '🧾 Receipt' },
                  { key: 'ovc', label: '🔳 OVC' },
                ].map((ev) => (
                  <label
                    key={ev.key}
                    style={{
                      fontSize: 'var(--text-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={evidenceRequired.includes(ev.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEvidenceRequired((prev) => [...prev, ev.key]);
                        } else {
                          setEvidenceRequired((prev) =>
                            prev.filter((v) => v !== ev.key)
                          );
                        }
                      }}
                    />
                    {ev.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
              <label className="form-label">Product Photos</label>
              <PhotoUpload
                photos={formPhotos}
                onChange={setFormPhotos}
                folder="products"
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? '⏳ Adding…' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Submit Receipt Modal ──
function SubmitReceiptModal({
  runners,
  onClose,
  onSuccess,
}: {
  runners: Runner[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [runnerId, setRunnerId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [productCost, setProductCost] = useState('');
  const [transportCost, setTransportCost] = useState('');
  const [otherCost, setOtherCost] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runnerId) {
      setError('Please select a runner.');
      return;
    }
    const pCost = parseFloat(productCost) || 0;
    const tCost = parseFloat(transportCost) || 0;
    const oCost = parseFloat(otherCost) || 0;

    setSaving(true);
    setError(null);
    try {
      await createReceipt({
        runner_id: runnerId,
        order_id: orderId || `manual-${Date.now()}`,
        product_cost: pCost,
        transport_cost: tCost,
        other_cost: oCost,
        status: 'pending',
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit receipt.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        padding: 'var(--space-4)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body" style={{ padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-5)',
            }}
          >
            <h3 style={{ fontWeight: 700 }}>🧾 Submit Receipt</h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
              <span>🚨</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Runner *</label>
              <select
                className="form-select"
                value={runnerId}
                onChange={(e) => setRunnerId(e.target.value)}
              >
                <option value="">— Select runner —</option>
                {runners.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.tier})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Order ID (optional)</label>
              <input
                type="text"
                className="form-input"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Leave blank for manual entry"
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div className="form-group">
                <label className="form-label">Product Cost (RM)</label>
                <input
                  type="number"
                  className="form-input"
                  value={productCost}
                  onChange={(e) => setProductCost(e.target.value)}
                  placeholder="0.00"
                  step={0.5}
                  min={0}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Transport (RM)</label>
                <input
                  type="number"
                  className="form-input"
                  value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  placeholder="0.00"
                  step={0.5}
                  min={0}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Other (RM)</label>
                <input
                  type="number"
                  className="form-input"
                  value={otherCost}
                  onChange={(e) => setOtherCost(e.target.value)}
                  placeholder="0.00"
                  step={0.5}
                  min={0}
                />
              </div>
            </div>

            {/* Live total */}
            <div
              style={{
                padding: 'var(--space-3)',
                background: 'var(--stone-50)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 600 }}>Total Receipt Amount:</span>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--earth-700)' }}>
                {formatRM(
                  (parseFloat(productCost) || 0) +
                    (parseFloat(transportCost) || 0) +
                    (parseFloat(otherCost) || 0)
                )}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
              <label className="form-label">Notes</label>
              <textarea
                className="form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details..."
                rows={2}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? '⏳ Submitting…' : 'Submit Receipt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Main Products Page ──
export default function ProductsPage() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [selectedTempleId, setSelectedTempleId] = useState('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [receipts, setReceipts] = useState<RunnerReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('packages');
  const [productFilterType, setProductFilterType] = useState('');
  const [packageFilterStatus, setPackageFilterStatus] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showSubmitReceipt, setShowSubmitReceipt] = useState(false);

  // Editable product cost inline
  const [editingCost, setEditingCost] = useState<string | null>(null);
  const [editCostValue, setEditCostValue] = useState('');
  const [savingCostId, setSavingCostId] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const selectedTemple = temples.find((t) => t.id === selectedTempleId) || null;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [templesData, productsData, packagesData, runnersData, receiptsData] =
        await Promise.all([
          getTemples(),
          getProducts(),
          getPackages(),
          getRunners(),
          getReceipts(),
        ]);
      setTemples(templesData);
      setProducts(productsData);
      setPackages(packagesData);
      setRunners(runnersData);
      setReceipts(receiptsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter by selected temple
  const templeProducts = useMemo(
    () => products.filter((p) => !selectedTempleId || p.temple_id === selectedTempleId),
    [products, selectedTempleId]
  );

  const filteredProducts = useMemo(
    () =>
      productFilterType
        ? templeProducts.filter((p) => p.type === productFilterType)
        : templeProducts,
    [templeProducts, productFilterType]
  );

  const templePackages = useMemo(
    () => packages.filter((p) => !selectedTempleId || p.temple_id === selectedTempleId),
    [packages, selectedTempleId]
  );

  const filteredPackages = useMemo(
    () =>
      packageFilterStatus
        ? templePackages.filter((p) => p.status === packageFilterStatus)
        : templePackages,
    [templePackages, packageFilterStatus]
  );

  const templeRunners = useMemo(
    () => runners.filter((r) => !selectedTempleId || (r as unknown as { temple_id?: string }).temple_id === selectedTempleId),
    [runners, selectedTempleId]
  );

  // Count how many packages use a given product
  const countPackagesUsingProduct = (productId: string): number => {
    return (packages as unknown as { package_products?: { product_id: string }[] }[])
      .filter((pkg) =>
        pkg.package_products?.some(
          (pp: { product_id: string }) => pp.product_id === productId
        )
      ).length;
  };

  // Inline cost edit handler
  const handleSaveInlineCost = async (productId: string) => {
    const newCost = parseFloat(editCostValue);
    if (isNaN(newCost) || newCost < 0) {
      setEditingCost(null);
      setEditCostValue('');
      return;
    }
    setSavingCostId(productId);
    try {
      await updateProduct(productId, { cost_to_runner: newCost });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, cost_to_runner: newCost } : p))
      );
      showToast('Cost updated successfully');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update cost', 'error');
    } finally {
      setSavingCostId(null);
      setEditingCost(null);
      setEditCostValue('');
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await updateProduct(productId, { is_active: false });
      setProducts((prev) => prev.filter((x) => x.id !== productId));
      showToast('Product deleted');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete product', 'error');
    }
  };

  // Runner payment summary
  const getRunnerPaymentSummary = (runnerId: string) => {
    const runnerReceipts = receipts.filter((r) => r.runner_id === runnerId);
    const totalReceipts = runnerReceipts.reduce(
      (sum, r) => sum + (r.product_cost || 0) + (r.transport_cost || 0) + (r.other_cost || 0),
      0
    );
    const orderCount = runnerReceipts.length;
    const avgCost = orderCount > 0 ? totalReceipts / orderCount : 0;
    return { orderCount, totalReceipts, avgCost };
  };

  // Receipt status update handler
  const handleReceiptStatusUpdate = async (
    receiptId: string,
    newStatus: 'verified' | 'rejected' | 'pending'
  ) => {
    try {
      const updates: Partial<RunnerReceipt> = { status: newStatus };
      if (newStatus === 'verified') {
        updates.verified_at = new Date().toISOString();
      }
      await updateReceipt(receiptId, updates);
      setReceipts((prev) =>
        prev.map((r) => (r.id === receiptId ? { ...r, ...updates } : r))
      );
      showToast(`Receipt ${newStatus}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update receipt', 'error');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>⏳</div>
          <p className="text-muted">Loading products & packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>🚨</span>
        <span>Error loading data: {error}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductModal
          templeId={selectedTempleId}
          onClose={() => setShowAddProduct(false)}
          onSuccess={(prod) => {
            setProducts((prev) => [...prev, prod]);
            showToast(`Product "${prod.name}" added successfully`);
          }}
        />
      )}

      {/* Submit Receipt Modal */}
      {showSubmitReceipt && (
        <SubmitReceiptModal
          runners={templeRunners}
          onClose={() => setShowSubmitReceipt(false)}
          onSuccess={() => {
            loadData();
            showToast('Receipt submitted successfully');
          }}
        />
      )}

      {/* Step flow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: 'var(--stone-50)',
          borderRadius: 'var(--radius-lg)',
          flexWrap: 'wrap',
        }}
      >
        {[
          { n: 1, label: 'Select Temple' },
          { n: 2, label: 'Manage Products' },
          { n: 3, label: 'Create Packages' },
          { n: 4, label: 'Set Selling Price' },
        ].map((step, i) => (
          <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {i > 0 && <span style={{ color: 'var(--color-text-muted)' }}>→</span>}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: step.n <= 3 ? 'var(--sage-600)' : 'var(--amber-500)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
              }}
            >
              {step.n}
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: step.n === 4 ? 'var(--amber-700)' : undefined }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Temple selector */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label className="form-label">Select Temple</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <select
            className="form-select"
            value={selectedTempleId}
            onChange={(e) => setSelectedTempleId(e.target.value)}
            style={{ maxWidth: 400 }}
          >
            <option value="">— Select a temple —</option>
            {temples.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.country})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main area or empty state */}
      {!selectedTemple ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-12)',
            color: 'var(--color-text-muted)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>⛩️</div>
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            Select a temple to get started
          </h3>
          <p className="text-sm">
            Choose a temple above to manage its products and packages.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
            <a
              className={`tab ${activeTab === 'packages' ? 'active' : ''}`}
              onClick={() => setActiveTab('packages')}
            >
              📦 Package Builder ({filteredPackages.length})
            </a>
            <a
              className={`tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              🛍️ Product Catalog ({filteredProducts.length})
            </a>
            <a
              className={`tab ${activeTab === 'runners' ? 'active' : ''}`}
              onClick={() => setActiveTab('runners')}
            >
              🏃 Runner Cost Tracking ({templeRunners.length})
            </a>
          </div>

          {/* ═══════════════════ PACKAGE BUILDER TAB ═══════════════════ */}
          {activeTab === 'packages' && (
            <div>
              <CreatePackageForm
                products={templeProducts}
                templeId={selectedTempleId}
                onCreated={() => {
                  loadData();
                  showToast('Package created successfully');
                }}
              />

              {/* Filter */}
              {filteredPackages.length > 0 && (
                <div
                  className="filter-bar"
                  style={{ marginBottom: 'var(--space-4)' }}
                >
                  <select
                    className="form-select"
                    value={packageFilterStatus}
                    onChange={(e) => setPackageFilterStatus(e.target.value)}
                    style={{ minWidth: 140 }}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}

              {/* Package list */}
              {filteredPackages.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-8)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  No packages created yet. Use the form above to create one.
                </div>
              ) : (
                filteredPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    products={templeProducts}
                    onRefresh={() => {
                      loadData();
                    }}
                  />
                ))
              )}
            </div>
          )}

          {/* ═══════════════════ PRODUCT CATALOG TAB ═══════════════════ */}
          {activeTab === 'products' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <div className="filter-bar" style={{ marginBottom: 0 }}>
                  <select
                    className="form-select"
                    value={productFilterType}
                    onChange={(e) => setProductFilterType(e.target.value)}
                    style={{ minWidth: 140 }}
                  >
                    <option value="">All Types</option>
                    <option value="physical">Physical</option>
                    <option value="service">Service</option>
                    <option value="donation">Donation</option>
                  </select>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddProduct(true)}
                >
                  + Add Product
                </button>
              </div>

              {/* Product info hint */}
              {templeProducts.length > 0 && (
                <div
                  style={{
                    marginBottom: 'var(--space-3)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {templeProducts.length} product(s). Click cost to edit. Runner
                  submits receipts after each order — system tracks actual costs
                  over time.
                </div>
              )}

              {/* Products table */}
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Cost to Runner</th>
                    <th>Evidence</th>
                    <th>Photos</th>
                    <th>Used In</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: 'center',
                          padding: 'var(--space-6)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        No products yet. Add products to create packages.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const usedCount = countPackagesUsingProduct(p.id);
                      const evBadges = evidenceBadges(p.evidence_required || []);
                      const typeLabel =
                        p.type === 'physical' ? (
                          <span className="badge badge-gray" style={{ textTransform: 'none' }}>
                            Physical
                          </span>
                        ) : p.type === 'service' ? (
                          <span className="badge badge-brown" style={{ textTransform: 'none' }}>
                            Service
                          </span>
                        ) : (
                          <span className="badge badge-green" style={{ textTransform: 'none' }}>
                            Donation
                          </span>
                        );

                      return (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.name}</strong>
                          </td>
                          <td>{typeLabel}</td>
                          <td>
                            {editingCost === p.id ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                <input
                                  type="number"
                                  step={0.5}
                                  min={0}
                                  autoFocus
                                  value={editCostValue}
                                  onChange={(e) => setEditCostValue(e.target.value)}
                                  onBlur={() => handleSaveInlineCost(p.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveInlineCost(p.id);
                                    if (e.key === 'Escape') {
                                      setEditingCost(null);
                                      setEditCostValue('');
                                    }
                                  }}
                                  style={{
                                    width: 80,
                                    padding: 'var(--space-1)',
                                    border: '2px solid var(--amber-400)',
                                    borderRadius: 'var(--radius-sm)',
                                  }}
                                />
                                {savingCostId === p.id && (
                                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                                    ⏳
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span
                                style={{
                                  cursor: 'pointer',
                                  borderBottom: '1px dashed var(--color-border)',
                                }}
                                className="editable-cost"
                                onClick={() => {
                                  setEditingCost(p.id);
                                  setEditCostValue(p.cost_to_runner.toString());
                                }}
                              >
                                {formatRM(p.cost_to_runner)}
                              </span>
                            )}
                          </td>
                          <td>{evBadges.join(' ')}</td>
                          <td>
                            {p.photos && p.photos.length > 0 ? (
                              <img
                                src={p.photos[0]}
                                alt={p.name}
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: 'cover',
                                  borderRadius: 'var(--radius-sm)',
                                }}
                              />
                            ) : (
                              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>—</span>
                            )}
                          </td>
                          <td>
                            <span
                              style={{ color: 'var(--earth-600)', cursor: 'pointer' }}
                              onClick={() => {
                                const pkgNames: string[] = [];
                                (
                                  packages as unknown as {
                                    package_products?: { product_id: string }[];
                                    name: string;
                                  }[]
                                ).forEach((pkg) => {
                                  if (
                                    pkg.package_products?.some(
                                      (pp) => pp.product_id === p.id
                                    )
                                  ) {
                                    pkgNames.push(pkg.name);
                                  }
                                });
                                alert(
                                  pkgNames.length
                                    ? 'Used in:\n• ' + pkgNames.join('\n• ')
                                    : 'Not used in any package yet.'
                                );
                              }}
                            >
                              Used in {usedCount} package{usedCount !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                              {usedCount === 0 && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleDeleteProduct(p.id)}
                                >
                                  Delete
                                </button>
                              )}
                              {usedCount > 0 && (
                                <span
                                  style={{
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--color-text-muted)',
                                    padding: 'var(--space-1)',
                                  }}
                                >
                                  In use
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══════════════════ RUNNER COST TRACKING TAB ═══════════════════ */}
          {activeTab === 'runners' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <h3 style={{ fontWeight: 600 }}>Runner Receipts & Payments</h3>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowSubmitReceipt(true)}
                >
                  🧾 Submit Receipt
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Runner payment summary cards */}
                {templeRunners.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 'var(--space-8)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: 'var(--space-2)' }}>🏃</div>
                    <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                      No runners for this temple
                    </h3>
                    <p className="text-sm">
                      Runners will appear here once assigned to this temple.
                    </p>
                  </div>
                ) : (
                  templeRunners.map((runner) => {
                    const summary = getRunnerPaymentSummary(runner.id);
                    const runnerReceiptsForHistory = receipts
                      .filter((r) => r.runner_id === runner.id)
                      .slice(0, 10);

                    return (
                      <div key={runner.id} className="card">
                        <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              marginBottom: 'var(--space-4)',
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--space-2)',
                                }}
                              >
                                <h4 style={{ fontWeight: 700 }}>{runner.name}</h4>
                                <span
                                  className={`badge ${statusBadge(runner.status)}`}
                                  style={{ textTransform: 'none' }}
                                >
                                  {runner.status}
                                </span>
                                <span className="badge badge-gray" style={{ textTransform: 'none' }}>
                                  {runner.tier}
                                </span>
                              </div>
                              <div className="text-sm text-muted">
                                {runner.phone || 'No phone'} · Quality Score:{' '}
                                {runner.quality_score}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
                                {formatRM(summary.totalReceipts)}
                              </div>
                              <div className="text-xs text-muted">
                                Total verified receipts
                              </div>
                            </div>
                          </div>

                          {/* Stats row */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: 'var(--space-4)',
                              padding: 'var(--space-4)',
                              background: 'var(--stone-50)',
                              borderRadius: 'var(--radius-md)',
                              marginBottom: 'var(--space-4)',
                            }}
                          >
                            <div>
                              <div className="text-xs text-muted">Orders Fulfilled</div>
                              <div
                                style={{
                                  fontSize: 'var(--text-lg)',
                                  fontWeight: 700,
                                }}
                              >
                                {summary.orderCount}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted">Avg Cost/Order</div>
                              <div
                                style={{
                                  fontSize: 'var(--text-lg)',
                                  fontWeight: 700,
                                }}
                              >
                                {formatRM(summary.avgCost)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted">Payment Due</div>
                              <div
                                style={{
                                  fontSize: 'var(--text-lg)',
                                  fontWeight: 700,
                                  color:
                                    summary.totalReceipts > 0
                                      ? 'var(--color-warning)'
                                      : 'var(--sage-600)',
                                }}
                              >
                                {formatRM(summary.totalReceipts)}
                              </div>
                            </div>
                          </div>

                          {/* Cost history */}
                          <h5
                            style={{
                              fontWeight: 600,
                              marginBottom: 'var(--space-2)',
                              fontSize: 'var(--text-sm)',
                            }}
                          >
                            Recent Receipts
                          </h5>
                          {runnerReceiptsForHistory.length === 0 ? (
                            <div
                              style={{
                                padding: 'var(--space-4)',
                                textAlign: 'center',
                                color: 'var(--color-text-muted)',
                                fontSize: 'var(--text-sm)',
                                background: 'var(--stone-50)',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              No receipts submitted yet.
                            </div>
                          ) : (
                            <table className="data-table" style={{ border: 'none' }}>
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Product Cost</th>
                                  <th>Transport</th>
                                  <th>Other</th>
                                  <th>Total</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {runnerReceiptsForHistory.map((r) => {
                                  const total =
                                    (r.product_cost || 0) +
                                    (r.transport_cost || 0) +
                                    (r.other_cost || 0);
                                  return (
                                    <tr key={r.id}>
                                      <td>
                                        {r.created_at
                                          ? r.created_at.split('T')[0]
                                          : '—'}
                                      </td>
                                      <td>{formatRM(r.product_cost || 0)}</td>
                                      <td>{formatRM(r.transport_cost || 0)}</td>
                                      <td>{formatRM(r.other_cost || 0)}</td>
                                      <td>
                                        <strong>{formatRM(total)}</strong>
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            r.status === 'verified'
                                              ? 'badge-green'
                                              : r.status === 'rejected'
                                                ? 'badge-red'
                                                : 'badge-orange'
                                          }`}
                                          style={{ textTransform: 'none' }}
                                        >
                                          {r.status}
                                        </span>
                                      </td>
                                      <td>
                                        {r.status === 'pending' && (
                                          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                            <button
                                              className="btn btn-secondary btn-sm"
                                              onClick={() => handleReceiptStatusUpdate(r.id, 'verified')}
                                              style={{
                                                background: 'var(--sage-100)',
                                                color: 'var(--sage-700)',
                                                border: '1px solid var(--sage-300)',
                                              }}
                                            >
                                              ✓ Verify
                                            </button>
                                            <button
                                              className="btn btn-secondary btn-sm"
                                              onClick={() => handleReceiptStatusUpdate(r.id, 'rejected')}
                                              style={{
                                                background: 'var(--color-error-light, #fef2f2)',
                                                color: 'var(--color-error)',
                                                border: '1px solid var(--color-error, #ef4444)',
                                              }}
                                            >
                                              ✕ Reject
                                            </button>
                                          </div>
                                        )}
                                        {r.status !== 'pending' && (
                                          <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleReceiptStatusUpdate(r.id, 'pending')}
                                          >
                                            Reset
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
