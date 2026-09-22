"use client";
import React from "react";
import { listPlans } from "@/lib/platform-api";
import { Card, DataTable, LoadingState, ErrorState, Alert } from "@/components/ui";
import type { Plan } from "@/types/platform";

// Platform settings (read-only V1): plan configuration + operational notes.
// Plan limits live in DB `plans` rows — edit there to change free/paid limits.
export default function AdminSettings() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const load = React.useCallback(() => {
    setState("loading");
    listPlans().then((p) => { setPlans(p); setState("ready"); }).catch(() => setState("error"));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Settings</h1>
      <p className="text-muted" style={{ marginBottom: "var(--space-5)" }}>
        Plan limits are data — edit the <code>plans</code> table to change them. Platform fee is 0 by config; subscription pricing is undecided.
      </p>
      {state === "loading" ? <LoadingState /> :
        state === "error" ? <ErrorState onRetry={load} /> :
        <>
          <Card padded={false}>
            <DataTable<Plan> rowKey={(r) => r.id} rows={plans} columns={[
              { key: "n", header: "Plan", render: (r) => r.name },
              { key: "sku", header: "SKU limit", render: (r) => r.sku_limit ?? "∞" },
              { key: "sf", header: "Storefronts", render: (r) => r.storefront_limit ?? "∞" },
              { key: "price", header: "Price", render: (r) => r.monthly_price != null ? `${r.currency} ${r.monthly_price}` : "TBD" },
            ]} />
          </Card>
          <Alert style={{ marginTop: "var(--space-4)" }}>
            To create an admin: add a Supabase Auth user, then insert a row into <code>admins(user_id, role)</code>.
          </Alert>
        </>
      }
    </div>
  );
}
