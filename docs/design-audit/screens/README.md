# Provider portal — screen capture matrix (Phase 5A)

Capture target: every `/provider` route × {375, 768, 1440}px × {en, zh} × states
(empty, loading, error, Order A: payment_under_review → completed, refund branch).

## Capture note (honest)
The audit was performed against the **live local preview** (`believer-dev`, demo
mode ON) and the source. The browser automation in this environment returns
screenshots inline for review but cannot persist PNG binaries to disk, so this
folder holds the **matrix + observations** rather than image files. Findings in
`../provider-audit.md` cite the exact route + state + breakpoint reviewed. When a
screenshot tool that writes to disk is available, drop images here using the
naming below.

Naming: `<route>__<breakpoint>__<lang>__<state>.png`
e.g. `orders-id__375__en__payment_under_review.png`

## Routes
- login, dashboard (`/provider`), storefront, services, services-new,
  products, products-new, orders, orders-id, customers, customers-id,
  subscription, account

## States reviewed live this pass
- `/provider` — 375, 768 (en) — dashboard, needs-attention, metrics, capacity
- `/provider/orders/[id]` — 768 (en): payment_under_review, paid, in_progress,
  completed (full Order A walk-through); 375 (en): payment_under_review
- `/provider/login` — 375 (en)
- Customer `/en/orders/ord-b` — 768 (shared timeline/evidence components)

## Not yet captured (schedule for image drop)
- 1440px for all routes; zh for all `/provider` routes (portal is English-only —
  see audit finding P-I18N-1); loading/error states (fixtures are synchronous —
  finding P-STATE-1); refund branch screens.
