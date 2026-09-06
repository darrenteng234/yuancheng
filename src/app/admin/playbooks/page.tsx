'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOrders, getPackages, getProducts } from '@/lib/api';
import type { Order, Package, Product } from '@/types';

type TabKey = 'evidence' | 'temples' | 'quality' | 'mistakes';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'evidence', label: 'Evidence Collection SOP', icon: '📸' },
  { key: 'temples', label: 'Temple Guidelines', icon: '⛩️' },
  { key: 'quality', label: 'Quality Checklist', icon: '✅' },
  { key: 'mistakes', label: 'Common Mistakes', icon: '⚠️' },
];

export default function PlaybooksPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('evidence');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [packagesData, productsData, ordersData] = await Promise.all([
        getPackages(),
        getProducts(),
        getOrders(),
      ]);
      setPackages(packagesData);
      setProducts(productsData);
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

  // Derive unique package names for evidence SOP sections
  const packageNames = [...new Set(packages.map((p) => p.name))];
  const activePackages = packages.filter((p) => p.status === 'active');
  const activePackageNames = [...new Set(activePackages.map((p) => p.name))];

  // Compute evidence requirements from products
  const productEvidenceMap: Record<string, string[]> = {};
  products.forEach((prod) => {
    if (prod.evidence_required && prod.evidence_required.length > 0) {
      productEvidenceMap[prod.name] = prod.evidence_required;
    }
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>⏳</div>
          <p className="text-muted">Loading playbooks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>🚨</span>
        <span>Error loading playbooks: {error}</span>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Playbooks & SOP</h1>
        <p className="text-muted text-sm">Standard Operating Procedures for runners and admins</p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {TABS.map((tab) => (
          <span
            key={tab.key}
            className={`tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </span>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB: EVIDENCE COLLECTION SOP                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'evidence' && (
        <div>
          <div className="alert alert-info" style={{ marginBottom: 'var(--space-6)' }}>
            <span>📋</span>
            <div className="text-sm">
              <strong>Evidence Collection Protocol:</strong> Every order must be completed with verifiable evidence.
              Follow these steps exactly to ensure OVC (Order Verification Checklist) compliance.
            </div>
          </div>

          {/* Universal SOP Steps */}
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Universal Evidence SOP</h3>
          <div className="sop-steps">
            <div className="sop-step">
              <div className="sop-step-title">1. Prepare Before Arrival</div>
              <div className="sop-step-instructions">
                Review the order details: customer name, temple, package type. Prepare all required offerings/products.
                Ensure phone camera is clean and has sufficient storage. Arrive 10-15 minutes early.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">2. Photo 1 — Receipt of Purchase</div>
              <div className="sop-step-instructions">
                Photograph the purchase receipt clearly showing items bought, date, and amount. This proves you actually
                purchased the offerings requested. Blurry receipts will be rejected.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">3. Photo 2 — Temple Entrance + OVC</div>
              <div className="sop-step-instructions">
                Stand at the temple entrance with the Order Verification Card (OVC) visible in frame. The OVC must show
                the order number and customer name. Temple signage must be identifiable.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">4. Photo 3 — Offerings Arranged + OVC</div>
              <div className="sop-step-instructions">
                Arrange all offerings at the designated area. Hold the OVC next to the offerings so both are clearly
                visible. All items listed in the package must be present and identifiable in the photo.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">5. Photo 4 — Wide Context Shot</div>
              <div className="sop-step-instructions">
                Take a wide-angle photo showing the full ritual area. This proves the location and context of the ritual.
                The OVC should still be visible somewhere in frame.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">6. Photo 5 — During Ritual / Incense</div>
              <div className="sop-step-instructions">
                Capture a photo during the actual ritual or while incense is being offered. This proves the ritual was
                actually performed, not just set up for photos.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">7. Video — Full Ritual Recording</div>
              <div className="sop-step-instructions">
                Record a continuous video of the entire ritual from start to finish (minimum 30 seconds, no maximum).
                Speak the customer's name aloud during the video: "This ritual is performed for [customer name]."
                This is mandatory for all packages.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">8. Submit All Evidence</div>
              <div className="sop-step-instructions">
                Upload all 5 photos + video to the order in the runner app. Add any special notes about the ritual.
                Submit for admin review. Do not leave the temple until submission is confirmed.
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Package-Specific Evidence */}
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Package-Specific Evidence Requirements</h3>
          {activePackageNames.length > 0 ? (
            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              {activePackageNames.map((name) => (
                <div key={name} className="card">
                  <div className="card-body">
                    <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>📦 {name}</h4>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                      <div>✅ 5 photos required (see universal SOP)</div>
                      <div>✅ Full ritual video with customer name spoken</div>
                      <div>✅ OVC visible in minimum 2 photos</div>
                      <div>✅ Receipt showing all items purchased</div>
                      <div>📸 Evidence must match package contents exactly</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <p className="text-muted text-sm">No active packages found. Evidence requirements will appear here once packages are activated.</p>
              </div>
            </div>
          )}

          {/* Product-specific evidence requirements */}
          {Object.keys(productEvidenceMap).length > 0 && (
            <>
              <div className="divider" />
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Product Evidence Requirements</h3>
              <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                {Object.entries(productEvidenceMap).map(([prodName, evidence]) => (
                  <div key={prodName} className="card">
                    <div className="card-body">
                      <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>🛍️ {prodName}</h4>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                        {evidence.map((req, i) => (
                          <div key={i}>📸 {req}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB: TEMPLE-SPECIFIC GUIDELINES                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'temples' && (
        <div>
          <div className="alert alert-info" style={{ marginBottom: 'var(--space-6)' }}>
            <span>⛩️</span>
            <div className="text-sm">
              <strong>Temple Guidelines:</strong> Each temple has unique requirements. Always research the specific temple
              before your first order. When in doubt, ask the admin team.
            </div>
          </div>

          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Temple Types & Approach</h3>
          <div className="sop-steps">
            <div className="sop-step">
              <div className="sop-step-title">1. Chinese Temples (马来西亚华人庙宇)</div>
              <div className="sop-step-instructions">
                Most approachable temple type. Many already have commercial offerings. Look for incense, joss paper,
                and fruit offerings. Runners can usually perform rituals independently. Best starting point for new runners.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">2. Thai Buddhist Temples (วัด)</div>
              <div className="sop-step-instructions">
                Generally non-commercial. Runners should dress modestly (covered shoulders and knees). Offerings typically
                include flowers, incense, and candles. Photography may be restricted in certain areas — always ask first.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">3. Hindu Temples (கோவில்)</div>
              <div className="sop-step-instructions">
                Remove shoes before entering. Many temples have specific prasadam (blessed food) offerings. Some rituals
                require priest involvement — coordinate with temple staff. Fruit and flower offerings are standard.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">4. Burmese Buddhist Temples</div>
              <div className="sop-step-instructions">
                Similar to Thai temples but with unique traditions. Water pouring rituals are common. Dress code is strict.
                Some temples have specific days for merit-making — check the calendar before visiting.
              </div>
            </div>
          </div>

          <div className="divider" />

          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Temple Partnership Levels</h3>
          <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--color-success)' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <h4 style={{ fontWeight: 600 }}>Level 1: Independent Listing</h4>
                  <span className="badge badge-green">Current</span>
                </div>
                <p className="text-sm text-muted">Runners operate independently. No temple partnership required. We list the temple as a service location.</p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <h4 style={{ fontWeight: 600 }}>Level 2: Verified Listing</h4>
                  <span className="badge badge-orange">Phase 2</span>
                </div>
                <p className="text-sm text-muted">Temple acknowledges our service. Verified badge on listing. Temple may provide guidance on proper rituals.</p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <h4 style={{ fontWeight: 600 }}>Level 3: Temple Fulfillment</h4>
                  <span className="badge badge-amber">Phase 3</span>
                </div>
                <p className="text-sm text-muted">Temple staff perform rituals on our behalf. Runners coordinate and document. Highest trust level.</p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <h4 style={{ fontWeight: 600 }}>Level 4: Hybrid Marketplace</h4>
                  <span className="badge badge-brown">Phase 4</span>
                </div>
                <p className="text-sm text-muted">Full integration. Temple manages their own packages. We provide the platform and runner network.</p>
              </div>
            </div>
          </div>

          <div className="divider" />

          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Temple Onboarding SOP (21-Day Process)</h3>
          <div className="sop-steps">
            <div className="sop-step">
              <div className="sop-step-title">Phase 0: Request Intake (Day 0)</div>
              <div className="sop-step-instructions">
                Evaluate temple against 5 criteria: location accessibility, ritual consistency, runner safety, customer demand,
                and cultural sensitivity. Score each 1-5. Minimum 15/25 to proceed.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">Phase 1: Research (Day 1-3)</div>
              <div className="sop-step-instructions">
                Complete 20+ item research checklist: temple hours, offerings available, photography rules, dress code,
                contact person, nearby parking, and ritual procedures. Document everything.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">Phase 2: Product Catalog (Day 4-7)</div>
              <div className="sop-step-instructions">
                Define available products and services. Photograph offerings. Set runner costs. Create initial package
                offerings (Basic, Standard, Premium).
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">Phase 3: SOP Drafting (Day 8-12)</div>
              <div className="sop-step-instructions">
                Write detailed SOP for each package. Include step-by-step ritual instructions, evidence requirements,
                and common issues. Review with at least one runner.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">Phase 4: Runner Recruitment (Day 13-17)</div>
              <div className="sop-step-instructions">
                Recruit minimum 2 runners per temple. Prefer temple-adjacent workers. Conduct training on SOP and
                evidence collection. Run a test order.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">Phase 5: Soft Launch (Day 18-21)</div>
              <div className="sop-step-instructions">
                Accept first 5-10 orders. Monitor closely. Gather feedback from customers and runners. Adjust SOP as needed.
                Target: 21 days. Realistic: 25-47 days.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB: QUALITY CHECKLIST                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'quality' && (
        <div>
          <div className="alert alert-success" style={{ marginBottom: 'var(--space-6)' }}>
            <span>✅</span>
            <div className="text-sm">
              <strong>Quality Checklist:</strong> Use this checklist during evidence review. Every item must pass before
              approving an order for delivery to the customer.
            </div>
          </div>

          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Evidence Quality Standards</h3>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>📸 Photo Quality</h4>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 2 }}>
                    <div>☐ All 5 photos present</div>
                    <div>☐ Photos are clear and not blurry</div>
                    <div>☐ Sufficient lighting in all photos</div>
                    <div>☐ OVC visible in at least 2 photos</div>
                    <div>☐ Order number readable on OVC</div>
                    <div>☐ Customer name readable on OVC</div>
                    <div>☐ Temple identifiable in photos</div>
                    <div>☐ All package items visible</div>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>🎥 Video Quality</h4>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 2 }}>
                    <div>☐ Video is continuous (no cuts)</div>
                    <div>☐ Minimum 30 seconds duration</div>
                    <div>☐ Customer name spoken aloud</div>
                    <div>☐ Ritual is clearly performed</div>
                    <div>☐ Audio is clear and audible</div>
                    <div>☐ Video shows start-to-finish</div>
                    <div>☐ OVC visible at some point</div>
                    <div>☐ No suspicious editing</div>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>📋 Documentation</h4>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 2 }}>
                    <div>☐ Receipt photo included</div>
                    <div>☐ Receipt items match package</div>
                    <div>☐ Receipt date matches order date</div>
                    <div>☐ Receipt amount is reasonable</div>
                    <div>☐ Runner notes provided</div>
                    <div>☐ Special instructions followed</div>
                    <div>☐ Submission timestamp valid</div>
                    <div>☐ No duplicate evidence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Runner Performance Metrics</h3>
          <div className="grid grid-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="card">
              <div className="card-body">
                <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Quality Score Thresholds</h4>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tier</th>
                      <th>Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="badge badge-green">Platinum</span></td>
                      <td>95-100</td>
                      <td className="text-sm">Priority assignment</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-amber">Gold</span></td>
                      <td>85-94</td>
                      <td className="text-sm">Standard assignment</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-gray">Silver</span></td>
                      <td>70-84</td>
                      <td className="text-sm">Limited assignment</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-orange">Bronze</span></td>
                      <td>50-69</td>
                      <td className="text-sm">Probation</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-red">Below</span></td>
                      <td>&lt;50</td>
                      <td className="text-sm">Suspended</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Return Rate Thresholds</h4>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Return Rate</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>0-5%</td>
                      <td><span className="badge badge-green">Excellent</span></td>
                    </tr>
                    <tr>
                      <td>5-10%</td>
                      <td><span className="badge badge-amber">Acceptable</span></td>
                    </tr>
                    <tr>
                      <td>10-20%</td>
                      <td><span className="badge badge-orange">Warning</span></td>
                    </tr>
                    <tr>
                      <td>20%+</td>
                      <td><span className="badge badge-red">Suspension Review</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Admin Review SOP</h3>
          <div className="sop-steps">
            <div className="sop-step">
              <div className="sop-step-title">1. Open Evidence Review</div>
              <div className="sop-step-instructions">
                Navigate to the order in the admin panel. Click "Review Evidence" to open the evidence review panel.
                Check the order status is "In Review" before proceeding.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">2. Verify All Evidence Items</div>
              <div className="sop-step-instructions">
                Check each photo and video against the quality checklist above. Verify OVC visibility, customer name,
                temple identification, and ritual completion. Flag any issues.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">3. Check for Fraud Indicators</div>
              <div className="sop-step-instructions">
                Look for: reused photos across orders, mismatched timestamps, blurry OVC, missing ritual in video,
                or evidence that doesn't match the temple location. Flag suspicious orders immediately.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">4. Make Decision</div>
              <div className="sop-step-instructions">
                <strong>Approve:</strong> All evidence meets standards → Order delivered to customer.<br />
                <strong>Return:</strong> Minor issues → Send back to runner with specific feedback.<br />
                <strong>Reject:</strong> Major issues or fraud → Escalate to dispute resolution.
              </div>
            </div>
            <div className="sop-step">
              <div className="sop-step-title">5. Add Review Notes</div>
              <div className="sop-step-instructions">
                Document your decision with specific notes. If returning, list exactly what needs to be fixed.
                If approving, note any observations for future reference.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB: COMMON MISTAKES                                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'mistakes' && (
        <div>
          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-6)' }}>
            <span>⚠️</span>
            <div className="text-sm">
              <strong>Common Mistakes:</strong> These are the most frequent issues found in evidence reviews.
              Review this list before every order to avoid returns and rejections.
            </div>
          </div>

          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Critical Mistakes (Auto-Reject)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--color-error)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-001: Missing Video</h4>
                  <span className="badge badge-red">CRITICAL</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  Video is mandatory for ALL packages. Photos alone are not sufficient. The video must show the ritual
                  being performed and include the customer's name spoken aloud.
                </p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--color-error)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-002: OVC Not Visible</h4>
                  <span className="badge badge-red">CRITICAL</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  The Order Verification Card must be clearly visible in at least 2 photos. The order number and
                  customer name must be readable. Blurry or distant OVC shots will be rejected.
                </p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--color-error)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-003: Wrong Temple</h4>
                  <span className="badge badge-red">CRITICAL</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  Evidence must show the correct temple specified in the order. Submitting evidence from a different
                  temple is grounds for immediate rejection and runner suspension.
                </p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--color-error)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-004: Reused Evidence</h4>
                  <span className="badge badge-red">CRITICAL</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  Using the same photos/videos across multiple orders is fraud. Each order requires unique evidence
                  taken on the day of the ritual. We check for duplicate submissions.
                </p>
              </div>
            </div>
          </div>

          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Major Mistakes (Return to Runner)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-005: Blurry Photos</h4>
                  <span className="badge badge-orange">MAJOR</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  All photos must be clear and in focus. Blurry photos make it impossible to verify the ritual was
                  performed correctly. Clean your camera lens before shooting. Use good lighting.
                </p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-006: Missing Package Items</h4>
                  <span className="badge badge-orange">MAJOR</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  All items specified in the package must be visible in the photos. If the package includes incense,
                  flowers, and fruit — all three must be shown. Missing items suggest the full ritual wasn't performed.
                </p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-007: Video Too Short</h4>
                  <span className="badge badge-orange">MAJOR</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  Videos must be at least 30 seconds long. Short videos don't prove the ritual was fully performed.
                  Record the entire ritual from start to finish without cuts.
                </p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-008: Customer Name Not Spoken</h4>
                  <span className="badge badge-orange">MAJOR</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  The customer's name must be clearly spoken in the video. Say: "This ritual is performed for [name]."
                  This is the primary anti-fraud measure and cannot be skipped.
                </p>
              </div>
            </div>
          </div>

          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Minor Mistakes (Warning)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--stone-400)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-009: Poor Lighting</h4>
                  <span className="badge badge-gray">MINOR</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  Dark or underexposed photos make verification difficult. Try to shoot during daylight hours or
                  in well-lit areas of the temple.
                </p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--stone-400)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-010: Late Submission</h4>
                  <span className="badge badge-gray">MINOR</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  Evidence should be submitted within 2 hours of completing the ritual. Late submissions delay
                  customer delivery and may trigger automatic review flags.
                </p>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--stone-400)' }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 600 }}>MISTAKE-011: Missing Receipt</h4>
                  <span className="badge badge-gray">MINOR</span>
                </div>
                <p className="text-sm" style={{ marginTop: 'var(--space-2)' }}>
                  While sometimes unavoidable, missing receipts reduce trust. Always try to get a receipt for
                  offerings purchased. Take a photo of the receipt immediately before it fades (thermal paper).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Reference Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--amber-50), var(--earth-50))' }}>
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-3)' }}>🏃 Quick Reference Card</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Before You Go</h4>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                    <div>✅ Check order details</div>
                    <div>✅ Prepare offerings</div>
                    <div>✅ Clean camera lens</div>
                    <div>✅ Charge phone</div>
                    <div>✅ Print/prepare OVC</div>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>At the Temple</h4>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                    <div>📸 Photo 1: Receipt</div>
                    <div>📸 Photo 2: Entrance + OVC</div>
                    <div>📸 Photo 3: Offerings + OVC</div>
                    <div>📸 Photo 4: Wide shot</div>
                    <div>📸 Photo 5: During ritual</div>
                    <div>🎥 Video: Full ritual + name</div>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>After the Ritual</h4>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                    <div>✅ Review all photos</div>
                    <div>✅ Check video audio</div>
                    <div>✅ Upload immediately</div>
                    <div>✅ Add runner notes</div>
                    <div>✅ Submit for review</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
