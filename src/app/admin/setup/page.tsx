"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getTemples, createTemple, updateTemple,
  getProducts, createProduct,
  getPackages, createPackage,
  getRunners, createRunner,
} from "@/lib/api";
import type { Temple, Product, Package, Runner } from "@/types";

type Step = 1 | 2 | 3 | 4 | 5;

// ── Step indicators ──
const STEPS = [
  { n: 1, label: "寺庙 Temple" },
  { n: 2, label: "产品 Products" },
  { n: 3, label: "配套 Packages" },
  { n: 4, label: "执行人 Runner" },
  { n: 5, label: "上线 Launch" },
];

export default function SetupWizardPage() {
  const [step, setStep] = useState<Step>(1);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selected items
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p, pkg, r] = await Promise.all([
        getTemples(), getProducts(), getPackages(), getRunners(),
      ]);
      setTemples(t);
      setProducts(p);
      setPackages(pkg);
      setRunners(r);
    } catch (err) {
      showToast("error", "加载数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Validation for each step
  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!selectedTemple;
      case 2: return selectedProducts.length > 0;
      case 3: return !!selectedPackage;
      case 4: return !!selectedRunner;
      case 5: return true;
      default: return false;
    }
  };

  // Get temple-specific data
  const templeProducts = selectedTemple
    ? products.filter((p) => p.temple_id === selectedTemple.id)
    : [];
  const templePackages = selectedTemple
    ? packages.filter((p) => p.temple_id === selectedTemple.id)
    : [];

  // ── STEP 1: Create/Select Temple ──
  const handleCreateTemple = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const temple = await createTemple({
        name: fd.get("name") as string,
        country: fd.get("country") as string || "Thailand",
        city: fd.get("city") as string || "Bangkok",
        address: fd.get("address") as string || "",
        status: "pending",
        verification_status: "unverified",
        short_description_zh: fd.get("short_description_zh") as string || "",
        short_description: fd.get("short_description") as string || "",
      });
      await loadData();
      setSelectedTemple(temple);
      showToast("success", `寺庙 "${temple.name}" 已创建`);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "创建失败");
    } finally {
      setSaving(false);
    }
  };

  // ── STEP 2: Create Products ──
  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTemple) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const product = await createProduct({
        temple_id: selectedTemple.id,
        name: fd.get("name") as string,
        type: (fd.get("type") as "physical" | "service" | "donation") || "physical",
        cost_to_runner: parseFloat(fd.get("cost_to_runner") as string) || 0,
        is_active: true,
      });
      await loadData();
      setSelectedProducts((prev) => [...prev, product]);
      showToast("success", `产品 "${product.name}" 已创建`);
      e.currentTarget.reset();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "创建失败");
    } finally {
      setSaving(false);
    }
  };

  // ── STEP 3: Create Package ──
  const handleCreatePackage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTemple || selectedProducts.length === 0) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const pkg = await createPackage(
        {
          temple_id: selectedTemple.id,
          name: fd.get("name") as string,
          description: (fd.get("description") as string) || "",
          selling_price: parseFloat(fd.get("selling_price") as string) || 0,
          status: "active",
        },
        selectedProducts.map((p) => ({ product_id: p.id, quantity: 1 }))
      );
      await loadData();
      setSelectedPackage(pkg);
      showToast("success", `配套 "${pkg.name}" 已创建`);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "创建失败");
    } finally {
      setSaving(false);
    }
  };

  // ── STEP 4: Create/Select Runner ──
  const handleCreateRunner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const runner = await createRunner({
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        phone: fd.get("phone") as string || "",
        status: "probation",
        tier: "bronze",
        quality_score: 0,
      });
      await loadData();
      setSelectedRunner(runner);
      showToast("success", `执行人 "${runner.name}" 已创建`);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "创建失败");
    } finally {
      setSaving(false);
    }
  };

  // ── STEP 5: Launch ──
  const handleLaunch = async () => {
    if (!selectedTemple || !selectedPackage || !selectedRunner) return;
    setSaving(true);
    try {
      // Update temple to active
      await updateTemple(selectedTemple.id, {
        status: "active",
        verification_status: "verified",
      });
      showToast("success", "🎉 寺庙已上线！客户现在可以下单了。");
      await loadData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "上线失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p className="text-muted">加载中...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
          🚀 快速设置向导
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          按照步骤设置寺庙、产品、配套和执行人。每一步都会验证数据完整性。
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-8)", flexWrap: "wrap" }}>
        {STEPS.map((s) => (
          <button
            key={s.n}
            onClick={() => setStep(s.n as Step)}
            style={{
              padding: "var(--space-2) var(--space-4)",
              borderRadius: "var(--radius-full)",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--text-sm)",
              fontWeight: step === s.n ? 700 : 500,
              background: step === s.n
                ? "var(--amber-600)"
                : step > s.n
                  ? "var(--sage-100)"
                  : "var(--stone-100)",
              color: step === s.n ? "white" : step > s.n ? "var(--sage-700)" : "var(--stone-500)",
            }}
          >
            {step > s.n ? "✅" : s.n} {s.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "var(--space-4)" }}
        >
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* ── STEP 1: Temple ── */}
      {step === 1 && (
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
              步骤 1：选择或创建寺庙
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)", fontSize: "var(--text-sm)" }}>
              选择一个已有寺庙，或创建一个新的。
            </p>

            {/* Existing temples */}
            {temples.length > 0 && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
                  选择已有寺庙
                </h3>
                <div style={{ display: "grid", gap: "var(--space-2)" }}>
                  {temples.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemple(t)}
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        border: selectedTemple?.id === t.id ? "2px solid var(--amber-600)" : "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        background: selectedTemple?.id === t.id ? "var(--amber-50)" : "white",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                        {t.city}, {t.country} · <span className={`badge ${t.status === "active" ? "badge-green" : "badge-orange"}`}>{t.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="divider" style={{ margin: "var(--space-6) 0" }} />

            {/* Create new temple */}
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
              创建新寺庙
            </h3>
            <form onSubmit={handleCreateTemple} style={{ display: "grid", gap: "var(--space-4)" }}>
              <div className="grid grid-2" style={{ gap: "var(--space-4)" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">寺庙名称 *</label>
                  <input name="name" className="form-input" required placeholder="例如：Erawan Shrine" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">城市 *</label>
                  <input name="city" className="form-input" required placeholder="例如：Bangkok" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">国家</label>
                  <input name="country" className="form-input" defaultValue="Thailand" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">地址</label>
                  <input name="address" className="form-input" placeholder="寺庙地址" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">简介（中文）</label>
                <textarea name="short_description_zh" className="form-input" rows={2} placeholder="简短描述这座寺庙..." />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">简介（英文）</label>
                <textarea name="short_description" className="form-input" rows={2} placeholder="Short description..." />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "创建中..." : "创建寺庙"}
              </button>
            </form>

            {/* Next button */}
            <div style={{ marginTop: "var(--space-6)", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceed()}
                className="btn btn-primary btn-lg"
              >
                下一步：添加产品 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Products ── */}
      {step === 2 && (
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
              步骤 2：添加产品
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-2)", fontSize: "var(--text-sm)" }}>
              为 <strong>{selectedTemple?.name}</strong> 添加需要购买的产品（如香、花、蜡烛等）。
            </p>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)", fontSize: "var(--text-sm)" }}>
              💡 产品是执行人需要在寺庙购买的物品。设置成本价用于计算利润。
            </p>

            {/* Existing products for this temple */}
            {templeProducts.length > 0 && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
                  已有产品 ({templeProducts.length})
                </h3>
                <div style={{ display: "grid", gap: "var(--space-2)" }}>
                  {templeProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (!selectedProducts.find((sp) => sp.id === p.id)) {
                          setSelectedProducts((prev) => [...prev, p]);
                        }
                      }}
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        border: selectedProducts.find((sp) => sp.id === p.id) ? "2px solid var(--amber-600)" : "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        background: selectedProducts.find((sp) => sp.id === p.id) ? "var(--amber-50)" : "white",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginLeft: "var(--space-2)" }}>
                          {p.type}
                        </span>
                      </div>
                      <span style={{ fontWeight: 600, color: "var(--amber-700)" }}>RM{p.cost_to_runner.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="divider" style={{ margin: "var(--space-6) 0" }} />

            {/* Create new product */}
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
              添加新产品
            </h3>
            <form onSubmit={handleCreateProduct} style={{ display: "grid", gap: "var(--space-4)" }}>
              <div className="grid grid-2" style={{ gap: "var(--space-4)" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">产品名称 *</label>
                  <input name="name" className="form-input" required placeholder="例如：香" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">类型</label>
                  <select name="type" className="form-input">
                    <option value="physical">实物 (Physical)</option>
                    <option value="service">服务 (Service)</option>
                    <option value="donation">捐赠 (Donation)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">成本价 (RM) *</label>
                  <input name="cost_to_runner" type="number" step="0.01" min="0" className="form-input" required placeholder="0.00" />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary" disabled={saving} style={{ alignSelf: "flex-start" }}>
                {saving ? "添加中..." : "+ 添加产品"}
              </button>
            </form>

            {/* Selected products summary */}
            {selectedProducts.length > 0 && (
              <div style={{ marginTop: "var(--space-4)", padding: "var(--space-4)", background: "var(--amber-50)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                  已选择 {selectedProducts.length} 个产品（总成本: RM{selectedProducts.reduce((s, p) => s + p.cost_to_runner, 0).toFixed(2)}）
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                  {selectedProducts.map((p) => (
                    <span key={p.id} className="badge badge-amber">
                      {p.name} (RM{p.cost_to_runner.toFixed(2)})
                      <button
                        onClick={() => setSelectedProducts((prev) => prev.filter((sp) => sp.id !== p.id))}
                        style={{ marginLeft: "4px", background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ marginTop: "var(--space-6)", display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">← 上一步</button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceed()}
                className="btn btn-primary btn-lg"
              >
                下一步：创建配套 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Package ── */}
      {step === 3 && (
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
              步骤 3：创建配套
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-2)", fontSize: "var(--text-sm)" }}>
              为 <strong>{selectedTemple?.name}</strong> 创建客户可见的配套。
            </p>

            {/* Validation warnings */}
            {selectedProducts.length === 0 && (
              <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
                <span>⚠️</span>
                <span>请先返回步骤2添加产品。没有产品的配套无法使用。</span>
              </div>
            )}

            {/* Existing packages */}
            {templePackages.length > 0 && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
                  已有配套
                </h3>
                <div style={{ display: "grid", gap: "var(--space-2)" }}>
                  {templePackages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        border: selectedPackage?.id === pkg.id ? "2px solid var(--amber-600)" : "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        background: selectedPackage?.id === pkg.id ? "var(--amber-50)" : "white",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600 }}>{pkg.name}</span>
                        <span style={{ fontWeight: 700, color: "var(--amber-700)" }}>RM{pkg.selling_price.toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="divider" style={{ margin: "var(--space-6) 0" }} />

            {/* Create package form */}
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
              创建新配套
            </h3>
            <form onSubmit={handleCreatePackage} style={{ display: "grid", gap: "var(--space-4)" }}>
              <div className="grid grid-2" style={{ gap: "var(--space-4)" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">配套名称 *</label>
                  <input name="name" className="form-input" required placeholder="例如：精要套餐" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">售价 (RM) *</label>
                  <input name="selling_price" type="number" step="0.01" min="0" className="form-input" required placeholder="198.00" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">描述</label>
                <textarea name="description" className="form-input" rows={2} placeholder="配套包含什么..." />
              </div>

              {/* Product selection */}
              {selectedProducts.length > 0 && (
                <div style={{ padding: "var(--space-4)", background: "var(--stone-50)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                    包含产品（已选 {selectedProducts.length} 个）
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                    {selectedProducts.map((p) => p.name).join("、")}
                  </div>
                  <div style={{ marginTop: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--amber-700)", fontWeight: 600 }}>
                    产品成本: RM{selectedProducts.reduce((s, p) => s + p.cost_to_runner, 0).toFixed(2)}
                    {" → "}
                    建议售价: RM{(selectedProducts.reduce((s, p) => s + p.cost_to_runner, 0) * 1.5).toFixed(2)} 以上
                  </div>
                </div>
              )}

              {/* Profit preview */}
              {selectedProducts.length > 0 && (
                <div style={{ padding: "var(--space-3)", background: "var(--sage-50)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>
                  💡 <strong>利润预览：</strong>
                  如果售价 ≥ RM{(selectedProducts.reduce((s, p) => s + p.cost_to_runner, 0) * 1.3).toFixed(2)}，利润率约 30%
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={saving || selectedProducts.length === 0}>
                {saving ? "创建中..." : "创建配套"}
              </button>
            </form>

            <div style={{ marginTop: "var(--space-6)", display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(2)} className="btn btn-secondary">← 上一步</button>
              <button
                onClick={() => setStep(4)}
                disabled={!canProceed()}
                className="btn btn-primary btn-lg"
              >
                下一步：分配执行人 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: Runner ── */}
      {step === 4 && (
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
              步骤 4：分配执行人
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)", fontSize: "var(--text-sm)" }}>
              为 <strong>{selectedTemple?.name}</strong> 分配执行人。执行人将在此寺庙完成仪式。
            </p>

            {/* Existing runners */}
            {runners.length > 0 && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
                  选择已有执行人
                </h3>
                <div style={{ display: "grid", gap: "var(--space-2)" }}>
                  {runners.filter((r) => r.status !== "banned" && r.status !== "suspended").map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRunner(r)}
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        border: selectedRunner?.id === r.id ? "2px solid var(--amber-600)" : "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        background: selectedRunner?.id === r.id ? "var(--amber-50)" : "white",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{r.name}</span>
                          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginLeft: "var(--space-2)" }}>
                            {r.tier} · ⭐ {r.quality_score.toFixed(1)}
                          </span>
                        </div>
                        <span className={`badge ${r.status === "active" ? "badge-green" : "badge-orange"}`}>
                          {r.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="divider" style={{ margin: "var(--space-6) 0" }} />

            {/* Create new runner */}
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
              创建新执行人
            </h3>
            <form onSubmit={handleCreateRunner} style={{ display: "grid", gap: "var(--space-4)" }}>
              <div className="grid grid-2" style={{ gap: "var(--space-4)" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">姓名 *</label>
                  <input name="name" className="form-input" required placeholder="执行人姓名" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">邮箱 *</label>
                  <input name="email" type="email" className="form-input" required placeholder="runner@example.com" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">电话</label>
                  <input name="phone" className="form-input" placeholder="+66..." />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary" disabled={saving} style={{ alignSelf: "flex-start" }}>
                {saving ? "创建中..." : "+ 创建执行人"}
              </button>
            </form>

            <div style={{ marginTop: "var(--space-6)", display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(3)} className="btn btn-secondary">← 上一步</button>
              <button
                onClick={() => setStep(5)}
                disabled={!canProceed()}
                className="btn btn-primary btn-lg"
              >
                下一步：上线 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 5: Launch ── */}
      {step === 5 && (
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
              步骤 5：检查并上线
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)", fontSize: "var(--text-sm)" }}>
              检查所有设置，确认无误后上线。
            </p>

            {/* Summary */}
            <div style={{ display: "grid", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
              {/* Temple */}
              <div className="card" style={{ background: selectedTemple ? "var(--sage-50)" : "var(--stone-50)" }}>
                <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>寺庙</div>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>{selectedTemple?.name || "❌ 未选择"}</div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                      {selectedTemple?.city}, {selectedTemple?.country}
                    </div>
                  </div>
                  <span className={`badge ${selectedTemple?.status === "active" ? "badge-green" : "badge-orange"}`}>
                    {selectedTemple?.status || "pending"}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div className="card" style={{ background: selectedProducts.length > 0 ? "var(--sage-50)" : "var(--stone-50)" }}>
                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>产品</div>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>
                        {selectedProducts.length > 0 ? `${selectedProducts.length} 个产品` : "❌ 未添加"}
                      </div>
                    </div>
                    <span className="badge badge-amber">
                      RM{selectedProducts.reduce((s, p) => s + p.cost_to_runner, 0).toFixed(2)} 成本
                    </span>
                  </div>
                  {selectedProducts.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
                      {selectedProducts.map((p) => (
                        <span key={p.id} className="badge badge-gray">{p.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Package */}
              <div className="card" style={{ background: selectedPackage ? "var(--sage-50)" : "var(--stone-50)" }}>
                <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>配套</div>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>{selectedPackage?.name || "❌ 未创建"}</div>
                    {selectedPackage && (
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                        {selectedPackage.description}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "var(--amber-700)", fontSize: "var(--text-lg)" }}>
                      RM{selectedPackage?.selling_price.toFixed(2) || "0.00"}
                    </div>
                    {selectedPackage && selectedProducts.length > 0 && (
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--sage-600)" }}>
                        利润: RM{(selectedPackage.selling_price - selectedProducts.reduce((s, p) => s + p.cost_to_runner, 0)).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Runner */}
              <div className="card" style={{ background: selectedRunner ? "var(--sage-50)" : "var(--stone-50)" }}>
                <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>执行人</div>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>{selectedRunner?.name || "❌ 未分配"}</div>
                    {selectedRunner && (
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                        {selectedRunner.tier} · ⭐ {selectedRunner.quality_score.toFixed(1)} · {selectedRunner.status}
                      </div>
                    )}
                  </div>
                  <span className={`badge ${selectedRunner?.status === "active" ? "badge-green" : "badge-orange"}`}>
                    {selectedRunner?.status || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation checklist */}
            <div style={{ padding: "var(--space-4)", background: "var(--stone-50)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-6)" }}>
              <div style={{ fontWeight: 600, marginBottom: "var(--space-3)" }}>✅ 上线前检查</div>
              <div style={{ display: "grid", gap: "var(--space-2)", fontSize: "var(--text-sm)" }}>
                <div>{selectedTemple ? "✅" : "❌"} 寺庙已选择</div>
                <div>{selectedProducts.length > 0 ? "✅" : "❌"} 至少1个产品</div>
                <div>{selectedPackage ? "✅" : "❌"} 配套已创建</div>
                <div>{selectedRunner ? "✅" : "❌"} 执行人已分配</div>
                {selectedPackage && selectedProducts.length > 0 && (
                  <div style={{ color: selectedPackage.selling_price > selectedProducts.reduce((s, p) => s + p.cost_to_runner, 0) ? "var(--sage-600)" : "var(--color-error)" }}>
                    {selectedPackage.selling_price > selectedProducts.reduce((s, p) => s + p.cost_to_runner, 0) ? "✅" : "⚠️"}
                    售价 {selectedPackage.selling_price > selectedProducts.reduce((s, p) => s + p.cost_to_runner, 0) ? "高于" : "低于"} 产品成本
                  </div>
                )}
              </div>
            </div>

            {/* Launch button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setStep(4)} className="btn btn-secondary">← 上一步</button>
              <button
                onClick={handleLaunch}
                disabled={saving || !selectedTemple || !selectedPackage || !selectedRunner}
                className="btn btn-primary btn-lg"
                style={{ padding: "var(--space-4) var(--space-8)", fontSize: "var(--text-lg)" }}
              >
                {saving ? "上线中..." : "🚀 上线寺庙"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div style={{ marginTop: "var(--space-8)", textAlign: "center", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
        或者使用独立管理页面：
        <Link href="/admin/temples" style={{ margin: "0 var(--space-2)", color: "var(--amber-600)" }}>寺庙</Link> ·
        <Link href="/admin/products" style={{ margin: "0 var(--space-2)", color: "var(--amber-600)" }}>产品</Link> ·
        <Link href="/admin/runners" style={{ margin: "0 var(--space-2)", color: "var(--amber-600)" }}>执行人</Link>
      </div>
    </div>
  );
}
