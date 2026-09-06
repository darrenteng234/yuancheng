"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getRunner, updateRunner } from "@/lib/api";
import type { Runner } from "@/types";

// ── Tier badge color mapping ──
function tierBadge(tier: string): string {
  switch (tier) {
    case "platinum":
      return "badge-amber";
    case "gold":
      return "badge-amber";
    case "silver":
      return "badge-gray";
    case "bronze":
      return "badge-brown";
    default:
      return "badge-gray";
  }
}

// ── Status badge color mapping ──
function statusBadge(status: string): string {
  switch (status) {
    case "active":
      return "badge-green";
    case "probation":
      return "badge-orange";
    case "suspended":
      return "badge-red";
    default:
      return "badge-gray";
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return dateStr.split("T")[0];
}

export default function RunnerProfilePage() {
  const [runner, setRunner] = useState<Runner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Edit form fields
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const currentRunnerId = "runner-001"; // In production, from auth context

  const loadRunner = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRunner(currentRunnerId);
      setRunner(data);
      if (data) {
        setEditName(data.name || "");
        setEditPhone(data.phone || "");
        setEditNotes(data.notes || "");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }, [currentRunnerId]);

  useEffect(() => {
    loadRunner();
  }, [loadRunner]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runner) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateRunner(runner.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        notes: editNotes.trim(),
      });
      setRunner(updated);
      setEditMode(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(runner?.name || "");
    setEditPhone(runner?.phone || "");
    setEditNotes(runner?.notes || "");
    setEditMode(false);
    setError(null);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "var(--text-2xl)",
              marginBottom: "var(--space-4)",
            }}
          >
            ⏳
          </div>
          <p className="text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>🚨</span>
        <span>Error loading profile: {error}</span>
      </div>
    );
  }

  if (!runner) {
    return (
      <div className="alert alert-warning">
        <span>⚠️</span>
        <span>Runner profile not found.</span>
      </div>
    );
  }

  // ── Derived values ──
  const qualityColor =
    runner.quality_score >= 4.0
      ? "var(--sage-600)"
      : runner.quality_score >= 3.0
        ? "var(--amber-600)"
        : "var(--color-error)";

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              marginBottom: "var(--space-1)",
            }}
          >
            👤 Runner Profile
          </h2>
          <p className="text-sm text-muted">
            View and manage your runner information
          </p>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="btn btn-secondary"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div
          className="alert alert-success"
          style={{ marginBottom: "var(--space-4)" }}
        >
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div
          className="alert alert-error"
          style={{ marginBottom: "var(--space-4)" }}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Stat Overview */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">Tier</div>
          <div style={{ marginTop: "var(--space-2)" }}>
            <span
              className={`badge ${tierBadge(runner.tier)}`}
              style={{ fontSize: "var(--text-sm)", textTransform: "capitalize" }}
            >
              {runner.tier === "bronze"
                ? "🥉"
                : runner.tier === "silver"
                  ? "🥈"
                  : runner.tier === "gold"
                    ? "🥇"
                    : "💎"}{" "}
              {runner.tier}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Quality Score</div>
          <div
            className="stat-card-value"
            style={{ color: qualityColor }}
          >
            {runner.quality_score.toFixed(1)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Status</div>
          <div style={{ marginTop: "var(--space-2)" }}>
            <span
              className={`badge ${statusBadge(runner.status)}`}
              style={{ fontSize: "var(--text-sm)", textTransform: "capitalize" }}
            >
              {runner.status}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Return Rate</div>
          <div
            className="stat-card-value"
            style={{
              color:
                runner.return_rate > 10
                  ? "var(--color-error)"
                  : "var(--sage-600)",
            }}
          >
            {runner.return_rate}%
          </div>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <div className="card-body">
          {editMode ? (
            <form onSubmit={handleSave}>
              <h3
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: 700,
                  marginBottom: "var(--space-5)",
                }}
              >
                ✏️ Edit Profile
              </h3>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+60 12 345 6789"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Any additional notes about your availability, preferences, or special instructions..."
                />
                <p className="form-hint">
                  Internal notes visible to the YUANCHENG team.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-3)",
                  marginTop: "var(--space-6)",
                }}
              >
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: 700,
                  marginBottom: "var(--space-5)",
                }}
              >
                Runner Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-6)",
                }}
              >
                {/* */}
                <div>
                  <label
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    Full Name
                  </label>
                  <div
                    style={{
                      fontSize: "var(--text-base)",
                      fontWeight: 600,
                      color: "var(--color-text)",
                    }}
                  >
                    {runner.name || "—"}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    Email
                  </label>
                  <div
                    style={{
                      fontSize: "var(--text-base)",
                      color: "var(--color-text)",
                    }}
                  >
                    {runner.email || "—"}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    Phone Number
                  </label>
                  <div
                    style={{
                      fontSize: "var(--text-base)",
                      color: "var(--color-text)",
                    }}
                  >
                    {runner.phone || "—"}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    Member Since
                  </label>
                  <div
                    style={{
                      fontSize: "var(--text-base)",
                      color: "var(--color-text)",
                    }}
                  >
                    {formatDate(runner.created_at)}
                  </div>
                </div>
              </div>

              {runner.notes && (
                <>
                  <div className="divider" />
                  <div>
                    <label
                      style={{
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        color: "var(--color-text-muted)",
                        display: "block",
                        marginBottom: "var(--space-2)",
                      }}
                    >
                      Notes
                    </label>
                    <div
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {runner.notes}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tier Progress Card */}
      <div className="card">
        <div className="card-body">
          <h3
            style={{
              fontSize: "var(--text-base)",
              fontWeight: 700,
              marginBottom: "var(--space-4)",
            }}
          >
            🏆 Tier Progress
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "var(--space-3)",
              textAlign: "center",
            }}
          >
            {(["bronze", "silver", "gold", "platinum"] as const).map((t) => {
              const isActive = runner.tier === t;
              const rank = ["bronze", "silver", "gold", "platinum"].indexOf(t);
              const currentRank = ["bronze", "silver", "gold", "platinum"].indexOf(
                runner.tier
              );
              const isPast = rank < currentRank;

              return (
                <div
                  key={t}
                  style={{
                    padding: "var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    border: isActive
                      ? "2px solid var(--amber-500)"
                      : "1px solid var(--color-border)",
                    background: isActive
                      ? "var(--amber-50)"
                      : isPast
                        ? "var(--sage-50)"
                        : "var(--color-surface)",
                    opacity: isPast || isActive ? 1 : 0.6,
                  }}
                >
                  <div style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-2)" }}>
                    {t === "bronze"
                      ? "🥉"
                      : t === "silver"
                        ? "🥈"
                        : t === "gold"
                          ? "🥇"
                          : "💎"}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </div>
                  {isActive && (
                    <span
                      className="badge badge-amber"
                      style={{ marginTop: "var(--space-2)", textTransform: "none" }}
                    >
                      Current
                    </span>
                  )}
                  {isPast && (
                    <span
                      className="badge badge-green"
                      style={{ marginTop: "var(--space-2)", textTransform: "none" }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "var(--space-5)",
              padding: "var(--space-4)",
              background: "var(--stone-50)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            <strong>How tiers work:</strong> Complete orders with high quality
            scores to advance. Higher tiers get priority order assignments and
            better reimbursement rates.{" "}
            <Link
              href="/runner/dashboard"
              style={{ color: "var(--amber-700)", fontWeight: 600 }}
            >
              View dashboard →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
