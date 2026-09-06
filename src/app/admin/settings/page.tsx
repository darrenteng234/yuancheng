'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSetting, updateSetting } from '@/lib/api';

// ── Types ──
interface LegalSettings {
  platformDescription: string;
  refundPolicy: string;
  legalEntity: string;
  tosStatus: string;
}

interface NotificationSettings {
  customerOrderPlaced: boolean;
  customerRunnerAssigned: boolean;
  customerOrderCompleted: boolean;
  customerDisputeFiled: boolean;
  adminNewOrder: boolean;
  adminNewDispute: boolean;
  adminRunnerShortage: boolean;
}

interface RunnerConfigSettings {
  defaultFee: string;
  responseTimeout: string;
  minRunnersPerTemple: string;
  probationOrders: string;
  payoutSchedule: string;
}

interface CountryRow {
  country: string;
  flag: string;
  currency: string;
  status: string;
  legalEntity: string;
  payment: string;
  nextStep: string;
}

interface MultiCountrySettings {
  countries: CountryRow[];
}

type TabKey = 'legal' | 'notifications' | 'runner' | 'country';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'legal', label: 'Legal & Compliance' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'runner', label: 'Runner Config' },
  { key: 'country', label: 'Multi-Country' },
];

const KEY_MAP: Record<TabKey, string> = {
  legal: 'legal',
  notifications: 'notifications',
  runner: 'runner_config',
  country: 'multi_country',
};

function defaultLegal(): LegalSettings {
  return {
    platformDescription:
      'We facilitate temple-related services and offerings. We do not guarantee religious or spiritual outcomes.',
    refundPolicy:
      'Full refund if service not completed. Partial refund if evidence quality is poor. Disputes resolved within 48 hours.',
    legalEntity: '',
    tosStatus: '',
  };
}

function defaultNotifications(): NotificationSettings {
  return {
    customerOrderPlaced: true,
    customerRunnerAssigned: true,
    customerOrderCompleted: true,
    customerDisputeFiled: true,
    adminNewOrder: true,
    adminNewDispute: true,
    adminRunnerShortage: true,
  };
}

function defaultRunnerConfig(): RunnerConfigSettings {
  return {
    defaultFee: '20.00',
    responseTimeout: '4',
    minRunnersPerTemple: '2',
    probationOrders: '3',
    payoutSchedule: 'Weekly (every Monday)',
  };
}

function defaultMultiCountry(): MultiCountrySettings {
  return {
    countries: [
      {
        country: 'Thailand',
        flag: '🇹🇭',
        currency: 'THB',
        status: 'Active',
        legalEntity: 'Not registered',
        payment: 'Stripe (test)',
        nextStep: 'Register entity',
      },
      {
        country: 'Malaysia',
        flag: '🇲🇾',
        currency: 'MYR',
        status: 'Not started',
        legalEntity: 'Not registered',
        payment: 'Not configured',
        nextStep: 'Research legal requirements',
      },
      {
        country: 'Singapore',
        flag: '🇸🇬',
        currency: 'SGD',
        status: 'Not started',
        legalEntity: 'Not registered',
        payment: 'Not configured',
        nextStep: 'Research legal requirements',
      },
      {
        country: 'Taiwan',
        flag: '🇹🇼',
        currency: 'TWD',
        status: 'Not started',
        legalEntity: 'Not registered',
        payment: 'Not configured',
        nextStep: 'Research legal requirements',
      },
    ],
  };
}

// ── Tab visibility helper ──
function isTab(key: TabKey, activeTab: TabKey): string {
  return key === activeTab ? 'tab active' : 'tab';
}

// ── Country row status badge ──
function countryBadge(status: string): string {
  switch (status) {
    case 'Active':
    case 'active':
      return 'badge-green';
    default:
      return 'badge-gray';
  }
}

// ── Save Settings Component ──
function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      style={{
        marginTop: 'var(--space-6)',
        display: 'flex',
        gap: 'var(--space-3)',
      }}
    >
      <button className="btn btn-primary" onClick={onClick}>
        Save Settings
      </button>
    </div>
  );
}

// ═══ MAIN COMPONENT ═══
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('legal');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [loading, setLoading] = useState<Record<TabKey, boolean>>({
    legal: true,
    notifications: true,
    runner: true,
    country: true,
  });

  // Legal state
  const [platformDescription, setPlatformDescription] = useState('');
  const [refundPolicy, setRefundPolicy] = useState('');
  const [legalEntity, setLegalEntity] = useState('');

  // Notifications state
  const [customerOrderPlaced, setCustomerOrderPlaced] = useState(true);
  const [customerRunnerAssigned, setCustomerRunnerAssigned] = useState(true);
  const [customerOrderCompleted, setCustomerOrderCompleted] = useState(true);
  const [customerDisputeFiled, setCustomerDisputeFiled] = useState(true);
  const [adminNewOrder, setAdminNewOrder] = useState(true);
  const [adminNewDispute, setAdminNewDispute] = useState(true);
  const [adminRunnerShortage, setAdminRunnerShortage] = useState(true);

  // Runner Config state
  const [defaultFee, setDefaultFee] = useState('20.00');
  const [responseTimeout, setResponseTimeout] = useState('4');
  const [minRunnersPerTemple, setMinRunnersPerTemple] = useState('2');
  const [probationOrders, setProbationOrders] = useState('3');
  const [payoutSchedule, setPayoutSchedule] = useState('Weekly (every Monday)');

  // Multi-Country state
  const [countries, setCountries] = useState<CountryRow[]>(defaultMultiCountry().countries);

  // ── Load settings on mount for all tabs (they persist in DB) ──
  useEffect(() => {
    const load = async () => {
      setLoading((prev) => ({ ...prev, legal: true }));
      try {
        const val = await getSetting('legal');
        if (val && typeof val === 'object') {
          const s = val as Partial<LegalSettings>;
          if (s.platformDescription) setPlatformDescription(s.platformDescription);
          if (s.refundPolicy) setRefundPolicy(s.refundPolicy);
          if (s.legalEntity !== undefined) setLegalEntity(s.legalEntity);
        }
      } catch {
        const d = defaultLegal();
        setPlatformDescription(d.platformDescription);
        setRefundPolicy(d.refundPolicy);
        setLegalEntity('');
      }
      setLoading((prev) => ({ ...prev, legal: false }));
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading((prev) => ({ ...prev, notifications: true }));
      try {
        const val = await getSetting('notifications');
        if (val && typeof val === 'object') {
          const s = val as Partial<NotificationSettings>;
          if (s.customerOrderPlaced !== undefined) setCustomerOrderPlaced(s.customerOrderPlaced);
          if (s.customerRunnerAssigned !== undefined) setCustomerRunnerAssigned(s.customerRunnerAssigned);
          if (s.customerOrderCompleted !== undefined) setCustomerOrderCompleted(s.customerOrderCompleted);
          if (s.customerDisputeFiled !== undefined) setCustomerDisputeFiled(s.customerDisputeFiled);
          if (s.adminNewOrder !== undefined) setAdminNewOrder(s.adminNewOrder);
          if (s.adminNewDispute !== undefined) setAdminNewDispute(s.adminNewDispute);
          if (s.adminRunnerShortage !== undefined) setAdminRunnerShortage(s.adminRunnerShortage);
        }
      } catch {
        const d = defaultNotifications();
        setCustomerOrderPlaced(d.customerOrderPlaced);
        setCustomerRunnerAssigned(d.customerRunnerAssigned);
        setCustomerOrderCompleted(d.customerOrderCompleted);
        setCustomerDisputeFiled(d.customerDisputeFiled);
        setAdminNewOrder(d.adminNewOrder);
        setAdminNewDispute(d.adminNewDispute);
        setAdminRunnerShortage(d.adminRunnerShortage);
      }
      setLoading((prev) => ({ ...prev, notifications: false }));
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading((prev) => ({ ...prev, runner: true }));
      try {
        const val = await getSetting('runner_config');
        if (val && typeof val === 'object') {
          const s = val as Partial<RunnerConfigSettings>;
          if (s.defaultFee) setDefaultFee(s.defaultFee);
          if (s.responseTimeout) setResponseTimeout(s.responseTimeout);
          if (s.minRunnersPerTemple) setMinRunnersPerTemple(s.minRunnersPerTemple);
          if (s.probationOrders) setProbationOrders(s.probationOrders);
          if (s.payoutSchedule) setPayoutSchedule(s.payoutSchedule);
        }
      } catch {
        const d = defaultRunnerConfig();
        setDefaultFee(d.defaultFee);
        setResponseTimeout(d.responseTimeout);
        setMinRunnersPerTemple(d.minRunnersPerTemple);
        setProbationOrders(d.probationOrders);
        setPayoutSchedule(d.payoutSchedule);
      }
      setLoading((prev) => ({ ...prev, runner: false }));
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading((prev) => ({ ...prev, country: true }));
      try {
        const val = await getSetting('multi_country');
        if (val && typeof val === 'object') {
          const s = val as Partial<MultiCountrySettings>;
          if (s.countries && Array.isArray(s.countries)) {
            setCountries(s.countries);
          }
        }
      } catch {
        setCountries(defaultMultiCountry().countries);
      }
      setLoading((prev) => ({ ...prev, country: false }));
    };
    load();
  }, []);

  // ── Save handlers ──
  const saveLegal = useCallback(async () => {
    setSaveStatus('Saving...');
    try {
      await updateSetting('legal', {
        platformDescription,
        refundPolicy,
        legalEntity,
        tosStatus: '',
      });
      setSaveStatus('✓ Saved');
    } catch {
      setSaveStatus('✗ Error saving');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  }, [platformDescription, refundPolicy, legalEntity]);

  const saveNotifications = useCallback(async () => {
    setSaveStatus('Saving...');
    try {
      await updateSetting('notifications', {
        customerOrderPlaced,
        customerRunnerAssigned,
        customerOrderCompleted,
        customerDisputeFiled,
        adminNewOrder,
        adminNewDispute,
        adminRunnerShortage,
      });
      setSaveStatus('✓ Saved');
    } catch {
      setSaveStatus('✗ Error saving');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  }, [
    customerOrderPlaced,
    customerRunnerAssigned,
    customerOrderCompleted,
    customerDisputeFiled,
    adminNewOrder,
    adminNewDispute,
    adminRunnerShortage,
  ]);

  const saveRunnerConfig = useCallback(async () => {
    setSaveStatus('Saving...');
    try {
      await updateSetting('runner_config', {
        defaultFee,
        responseTimeout,
        minRunnersPerTemple,
        probationOrders,
        payoutSchedule,
      });
      setSaveStatus('✓ Saved');
    } catch {
      setSaveStatus('✗ Error saving');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  }, [defaultFee, responseTimeout, minRunnersPerTemple, probationOrders, payoutSchedule]);

  const saveMultiCountry = useCallback(async () => {
    setSaveStatus('Saving...');
    try {
      await updateSetting('multi_country', { countries });
      setSaveStatus('✓ Saved');
    } catch {
      setSaveStatus('✗ Error saving');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  }, [countries]);

  const handleSave = useCallback(() => {
    switch (activeTab) {
      case 'legal':
        saveLegal();
        break;
      case 'notifications':
        saveNotifications();
        break;
      case 'runner':
        saveRunnerConfig();
        break;
      case 'country':
        saveMultiCountry();
        break;
    }
  }, [activeTab, saveLegal, saveNotifications, saveRunnerConfig, saveMultiCountry]);

  // ── Country table row update ──
  const updateCountryRow = (index: number, field: keyof CountryRow, value: string) => {
    setCountries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <>
      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {TABS.map((t) => (
          <a
            key={t.key}
            className={isTab(t.key, activeTab)}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* ── Legal & Compliance Tab ── */}
      {activeTab === 'legal' && (
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                Legal &amp; Compliance
              </h3>
              {loading.legal ? (
                <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                  Loading...
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Platform Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={platformDescription}
                      onChange={(e) => setPlatformDescription(e.target.value)}
                    />
                    <div className="form-hint">Appears in footer and legal pages</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Refund Policy Summary</label>
                    <textarea
                      className="form-textarea"
                      value={refundPolicy}
                      onChange={(e) => setRefundPolicy(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Legal Entity</label>
                    <select
                      className="form-select"
                      value={legalEntity}
                      onChange={(e) => setLegalEntity(e.target.value)}
                    >
                      <option value="">Not registered — ⚠️ Register before launch</option>
                      <option value="malaysia_sdn_bhd">Sdn Bhd (Malaysia)</option>
                      <option value="thai_entity">Thai Entity</option>
                      <option value="singapore_pte">Pte Ltd (Singapore)</option>
                    </select>
                    <div className="form-hint" style={{ color: 'var(--color-error)' }}>
                      Required: Sdn Bhd (Malaysia) or Thai entity before accepting payments
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Terms of Service</label>
                    <div
                      style={{
                        padding: 'var(--space-3)',
                        background: 'var(--color-warning-bg)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--terracotta-600)',
                      }}
                    >
                      ⚠️ Not drafted. Get lawyer review before launch.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <SaveButton onClick={saveLegal} />
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {activeTab === 'notifications' && (
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                Notification Settings
              </h3>
              {loading.notifications ? (
                <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                  Loading...
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                      Customer Notifications
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={customerOrderPlaced}
                          onChange={(e) => setCustomerOrderPlaced(e.target.checked)}
                        />{' '}
                        Order placed — Email + WhatsApp
                      </label>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={customerRunnerAssigned}
                          onChange={(e) => setCustomerRunnerAssigned(e.target.checked)}
                        />{' '}
                        Runner assigned — Email + WhatsApp
                      </label>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={customerOrderCompleted}
                          onChange={(e) => setCustomerOrderCompleted(e.target.checked)}
                        />{' '}
                        Order completed — Email + WhatsApp
                      </label>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={customerDisputeFiled}
                          onChange={(e) => setCustomerDisputeFiled(e.target.checked)}
                        />{' '}
                        Dispute filed — Email + WhatsApp
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <h4
                      style={{
                        fontWeight: 600,
                        marginBottom: 'var(--space-2)',
                        marginTop: 'var(--space-4)',
                      }}
                    >
                      Admin Notifications
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={adminNewOrder}
                          onChange={(e) => setAdminNewOrder(e.target.checked)}
                        />{' '}
                        New order — Email
                      </label>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={adminNewDispute}
                          onChange={(e) => setAdminNewDispute(e.target.checked)}
                        />{' '}
                        New dispute — Email + WhatsApp
                      </label>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={adminRunnerShortage}
                          onChange={(e) => setAdminRunnerShortage(e.target.checked)}
                        />{' '}
                        Runner shortage alert — Email
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <SaveButton onClick={saveNotifications} />
        </div>
      )}

      {/* ── Runner Config Tab ── */}
      {activeTab === 'runner' && (
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                Runner Configuration
              </h3>
              {loading.runner ? (
                <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                  Loading...
                </div>
              ) : (
                <>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Default Runner Fee (RM)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={defaultFee}
                        onChange={(e) => setDefaultFee(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Response Timeout (hours)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={responseTimeout}
                        onChange={(e) => setResponseTimeout(e.target.value)}
                      />
                      <div className="form-hint">Auto-reassign if runner doesn&apos;t respond</div>
                    </div>
                  </div>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Min Runners per Temple</label>
                      <input
                        type="number"
                        className="form-input"
                        value={minRunnersPerTemple}
                        onChange={(e) => setMinRunnersPerTemple(e.target.value)}
                      />
                      <div className="form-hint">Alert when below this</div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Probation Orders</label>
                      <input
                        type="number"
                        className="form-input"
                        value={probationOrders}
                        onChange={(e) => setProbationOrders(e.target.value)}
                      />
                      <div className="form-hint">Number of orders for probation</div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payout Schedule</label>
                    <select
                      className="form-select"
                      value={payoutSchedule}
                      onChange={(e) => setPayoutSchedule(e.target.value)}
                    >
                      <option>Weekly (every Monday)</option>
                      <option>Bi-weekly</option>
                      <option>After each order</option>
                    </select>
                    <div className="form-hint">
                      Method: Bank transfer. No Stripe Connect yet.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <SaveButton onClick={saveRunnerConfig} />
        </div>
      )}

      {/* ── Multi-Country Tab ── */}
      {activeTab === 'country' && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Multi-Country Configuration
          </h3>
          {loading.country ? (
            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
              Loading...
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Legal Entity</th>
                  <th>Payment</th>
                  <th>Next Step</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((row, i) => (
                  <tr key={row.country}>
                    <td>
                      <span style={{ marginRight: 'var(--space-2)' }}>{row.flag}</span>
                      {row.country}
                    </td>
                    <td>{row.currency}</td>
                    <td>
                      <span className={`badge ${countryBadge(row.status)}`}>{row.status}</span>
                    </td>
                    <td>{row.legalEntity}</td>
                    <td>{row.payment}</td>
                    <td>{row.nextStep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <SaveButton onClick={saveMultiCountry} />
        </div>
      )}

      {/* Save status toast */}
      {saveStatus && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--space-6)',
            right: 'var(--space-6)',
            padding: 'var(--space-3) var(--space-5)',
            background: saveStatus.startsWith('✓')
              ? 'var(--color-success)'
              : saveStatus.startsWith('✗')
                ? 'var(--color-error)'
                : 'var(--color-text)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            zIndex: 1000,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {saveStatus}
        </div>
      )}
    </>
  );
}
