"use client";

import { useEffect, useState, useCallback } from "react";

interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function RunnerNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=10");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.notifications || [];
      setNotifications(items);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [load]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // silent
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "error": return "❌";
      case "warning": return "⚠️";
      case "success": return "✅";
      default: return "ℹ️";
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-sm"
        style={{
          background: "transparent",
          border: "1px solid var(--color-border)",
          position: "relative",
          padding: "var(--space-2)",
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "var(--color-error, #dc2626)",
              color: "white",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "var(--space-2)",
            width: 320,
            background: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 100,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              borderBottom: "1px solid var(--color-border)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
            }}
          >
            Notifications {unreadCount > 0 && `(${unreadCount} new)`}
          </div>
          {loading ? (
            <div style={{ padding: "var(--space-4)", textAlign: "center" }}>
              <span className="text-muted text-sm">Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: "var(--space-4)", textAlign: "center" }}>
              <span className="text-muted text-sm">No notifications</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markRead(n.id);
                  if (n.link) window.location.href = n.link;
                }}
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer",
                  background: n.is_read ? "white" : "var(--amber-50)",
                  display: "flex",
                  gap: "var(--space-2)",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ flexShrink: 0 }}>{typeIcon(n.type)}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: n.is_read ? 400 : 600,
                    }}
                  >
                    {n.message}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-muted)",
                      marginTop: "2px",
                    }}
                  >
                    {new Date(n.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Click outside to close */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
