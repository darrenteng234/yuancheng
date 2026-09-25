# Phase 5A — Provider Portal UX/UI Audit

Branch `beta`, from `26c8d12`. Demo mode ON. **No UI code was changed in this pass.**
Reviewer stance: senior product designer; users are small religious-service
providers in Malaysia, often on a phone, often not tech-savvy. Business rules,
state machine and design tokens are fixed.

Severity: **0** cosmetic · **1** minor · **2** should-fix · **3** major · **4** blocks the task.
Each finding cites a heuristic (Nielsen NN/g) or the fixed standard (TONE, WCAG 2.2 AA).

---

## Cross-cutting findings (apply to most/all routes)

| ID | Finding | Standard / heuristic | Sev | Proposed fix |
|----|---------|----------------------|-----|--------------|
| P-MOBILE-1 | At 375px the portal **overflows horizontally**; order detail content is cut off on the right. `.admin-sidebar` is `position:fixed`+`.admin-main{margin-left:240px}`; the ≤768 reset depends on a `collapsed` class and there is no hard `overflow-x` guard, so content can exceed the viewport. | Heuristic: Flexibility/efficiency; WCAG 1.4.10 Reflow | **4** | Make `.admin-main` `margin-left:0` and `min-width:0` below the breakpoint; add `overflow-x:hidden` on the content column; verify every provider page container uses `max-width:100%`. |
| P-I18N-1 | Provider portal is **English-only**; ~80 hard-coded strings. Customer side is en/zh. | Consistency; product requirement §4 | **3** | Move provider strings into a `provider` dictionary namespace (en+zh). Inventory below. |
| P-STATE-1 | Fixture pages render synchronously → **no loading or error states**. When wired to repos, a slow/failed fetch will show a blank screen or a raw error. | Heuristic: Visibility of system status; Error prevention | **3** | Wrap data reads in `LoadingState`/`ErrorState`; never surface raw Supabase/PostgREST text. |
| P-MONEY-1 | Money renders as `RM 88` (`toFixed(0)`), not `RM 88.00`. | TONE (money format) | **2** | `money()` → 2dp: `RM 88.00`. Applies to summaries, dashboards, order rows/detail. |
| P-DATE-1 | Dates render ISO (`2026-09-20`), not `20 Sep 2026`. | TONE (date format) | **2** | Format dates `d MMM yyyy` (+ `, HH:mm` where a time exists). |
| P-A11Y-1 | `.btn-sm` height ≈ 30px (padding 8/16, 12px text) — below the 44×44px target; used for row/quick actions on touch screens. | WCAG 2.5.8 Target size | **3** | Min 44px tap height for interactive controls on mobile (increase `.btn-sm` min-height or use `.btn` on mobile). |
| P-A11Y-2 | Secondary text `--muted #6D756F` on ivory `#F7F4EE` ≈ 3.9:1; `--text-muted #8A918B` lower. Fails AA (4.5:1) for body/secondary text. | WCAG 1.4.3 Contrast | **3** | Darken muted tokens (e.g. `#5C645E`) or reserve current muted for ≥18px/bold only. |
| P-CONSIST-1 | Provider pages use **inline `style={{…}}`** for layout (padding/max-width/grid) instead of shared classes; risks drift from the 4/8 scale. | Consistency & standards | **1** | Extract a `PortalPage`/`PageBody` wrapper (max-width + padding) and reuse. |
| P-A11Y-3 | Sidebar active state = right border colour only (`--amber-400`) plus bg tint; borderline as colour-adjacent signal. | WCAG 1.4.1 Use of colour | **1** | Keep bg + add weight/`aria-current="page"`. |

---

## Route: `/provider/orders/[id]` — order detail  ⭐ most-used

| ID | Finding | Standard / heuristic | Sev | Proposed fix |
|----|---------|----------------------|-----|--------------|
| OD-1 | **No sticky primary action on mobile.** The action panel sits in a right `aside`; on ≤900 it stacks to the top, so on a long order the primary button scrolls out of reach. | TONE/mobile §2h; Heuristic: Visibility of status | **3** | Sticky bottom bar on mobile holding the single primary action (Verify payment → Accept → Start → Submit evidence → Complete). |
| OD-2 | **Receipt is a text placeholder** (`receipt-YC-90001.jpg`), not an openable image. A provider cannot open the receipt full-screen to check the amount and reference number — the core job of this screen. | Heuristic: Match to real world; §2h | **4** | Render the receipt as a tappable thumbnail → full-screen zoomable viewer showing amount + reference. |
| OD-3 | Danger action labelled **"Cancel order"** with **no confirmation dialog**; clicking it moves straight to `refund_requested`. | TONE (destructive) ; Heuristic: Error prevention | **4** | Relabel **"Can't fulfil this order"**; confirm dialog stating *"You will refund the customer directly. Yuancheng does not hold or transfer money."*, safe option default. |
| OD-4 | Reject flow label **"Rejection reason"** / button copy; term should be **"Reject receipt"** and the consequence stated. Reason **is** required (good). | TONE (fixed terms) | **2** | "Reject receipt" + helper: customer will be asked to upload a new receipt. |
| OD-5 | Verify/Reject present as two stacked full-width buttons of similar weight; the danger action should be visually quieter. | Aesthetic/minimalist; hierarchy | **1** | Primary solid; danger as text/ghost, not full-width solid. |
| OD-6 | "Demo: actions update this screen only" helper is fine, but the completed state marks *Completed* as `current` (ring) rather than `done` (check). | Visibility of status | **1** | When status = completed, mark final step `done`. |
| OD-7 | Fulfilment section shows "Assignment: Provider" only; no staff/runner/external picker (spec allows all four). | Match to model | **2** | Add assignment control (Provider/Staff/Runner/External) — deferred to 5B build. |

## Route: `/provider/orders` — order list  ⭐ high-use

| ID | Finding | Standard | Sev | Proposed fix |
|----|---------|----------|-----|--------------|
| OL-1 | Filter tabs are links without `aria-current`/role="tab"; active = colour + underline only. | WCAG 1.4.1; ARIA | **2** | Add `aria-selected`/`aria-current`; keep underline + weight. |
| OL-2 | Row status uses `OrderStatusBadge` (text + colour) — good, not colour-alone. | 1.4.1 | 0 | — |
| OL-3 | Empty filter → "No orders here" (generic). Could name the filter ("No orders awaiting payment review"). | Content design | **1** | Filter-specific empty copy. |
| OL-4 | Amount/date use `RM 88` / ISO date (see P-MONEY-1/P-DATE-1). | TONE | 2 | inherit fix. |

## Route: `/provider` — dashboard

| ID | Finding | Standard | Sev | Proposed fix |
|----|---------|----------|-----|--------------|
| DB-1 | "Needs attention" is the right hero — one tap to the order (good, ≤2 taps). | IA / Visibility | 0 | — |
| DB-2 | Greeting "Good day" is static (not time-based); acceptable per prior spec but generic. | Content | **0** | Optional: time-of-day. |
| DB-3 | Three metric cards + capacity list are visually similar to plain boxes; "Order value" mixes a total with counts. | Aesthetic; match to real world | **1** | Label "Order value (completed)"; differentiate metric vs capacity cards. |
| DB-4 | Quick action "Create service" is primary alongside two secondary — one primary, good. | 1 primary rule | 0 | — |

## Route: `/provider/login`

| ID | Finding | Standard | Sev | Proposed fix |
|----|---------|----------|-----|--------------|
| LG-1 | Clean, single primary "Sign in". Error copy is human ("Incorrect email or password."). | Error messages | 0 | — |
| LG-2 | No visible focus ring test at 375 (global `:focus-visible` exists); verify inputs show it. | WCAG 2.4.7 | **1** | Confirm focus ring on inputs/buttons. |
| LG-3 | English-only (P-I18N-1). | i18n | 3 | inherit. |

## Route: `/provider/services` + `/services/new`

| ID | Finding | Standard | Sev | Proposed fix |
|----|---------|----------|-----|--------------|
| SV-1 | Editor is a **stub with Save disabled**; helper says so — acceptable for fixtures but a provider can't tell it's non-functional until they fill it in. | Visibility of status | **2** | Disable/soften fields or badge the page "Preview — saving coming soon". |
| SV-2 | Good: uses "Package" language, no SKU. Evidence/visibility selects match the model. | TONE (Package) | 0 | — |
| SV-3 | List row status hard-coded "Published"; not derived. | Match to model | **1** | Derive from data when wired. |

## Route: `/provider/products` + `/products/new`

| ID | Finding | Standard | Sev | Proposed fix |
|----|---------|----------|-----|--------------|
| PR-1 | Correctly labels "Physical", "Contact provider", no checkout. Helper states no cart/shipping/inventory. | TONE / model | 0 | — |
| PR-2 | New-product Save disabled (see SV-1). | Visibility | 2 | inherit. |

## Route: `/provider/customers` + `/customers/[id]`

| ID | Finding | Standard | Sev | Proposed fix |
|----|---------|----------|-----|--------------|
| CU-1 | City hard-coded "Kuala Lumpur, Malaysia" for every customer (fixture gap; order has no location). | Match to real world | **2** | Use the order's `customer_location` (field exists) or omit. |
| CU-2 | Customer id is the **name in the URL** (`/customers/Demo%20Customer`); breaks on duplicates and leaks the name. | Error prevention; privacy | **2** | Use an opaque id when wired. |
| CU-3 | Empty state present ("Customers will appear here after your first order."). | Content | 0 | — |

## Route: `/provider/subscription`

| ID | Finding | Standard | Sev | Proposed fix |
|----|---------|----------|-----|--------------|
| SB-1 | Clear: Free/beta, 0% commission, capacity rows, over-limit banner logic, never auto-unpublish. | Match to model | 0 | — |
| SB-2 | Over-limit banner code exists but can't be seen with current fixtures (never over). | Visibility (coverage) | **1** | Add a fixture/state to exercise it, or a 5B toggle. |

## Route: `/provider/storefront`

| ID | Finding | Standard | Sev | Proposed fix |
|----|---------|----------|-----|--------------|
| ST-1 | "Preview storefront" opens the customer page — good match to real world. | Match to real world | 0 | — |
| ST-2 | Business profile is read-only display; no edit affordance or "edit" state. | User control | **1** | Add edit affordance (deferred to 5B). |

## Route: `/provider/account`

| ID | Finding | Standard | Sev | Proposed fix |
|----|---------|----------|-----|--------------|
| AC-1 | Payment methods copy is correct: "your account — not a Yuancheng payout account". | TONE (Your payment details) | 0 | — |
| AC-2 | Section heading "Payment methods" ok; the fixed term is **"Your payment details"** for the customer-facing sense — confirm which surface. | TONE | **1** | Align heading to "Your payment details" where shown to/about the provider's payees. |
| AC-3 | Verification uses factual labels incl. "Physical location" (not "Temple verified") — good. | TONE | 0 | — |
| AC-4 | "Change" password is a disabled link; no explanation. | Visibility | **1** | Tooltip/helper "Available soon". |

---

## Top 10 (ranked by severity × screen usage; orders & order detail weighted highest)

1. **OD-2 (sev 4, order detail)** — receipt not openable/zoomable; provider can't verify the amount/reference. *The core job of the most-used screen is blocked.*
2. **OD-3 (sev 4, order detail)** — "Cancel order" has no consequence dialog and wrong label; risk of accidental refund commitment.
3. **P-MOBILE-1 (sev 4, all)** — horizontal overflow at 375px; order detail cut off on phones (the primary device).
4. **OD-1 (sev 3, order detail)** — no sticky mobile primary action; the next step scrolls out of reach.
5. **P-I18N-1 (sev 3, all)** — provider portal English-only; ~80 strings, no Chinese.
6. **P-A11Y-1 (sev 3, all)** — touch targets below 44px on the buttons providers tap most.
7. **P-A11Y-2 (sev 3, all)** — muted text fails AA contrast on ivory.
8. **P-STATE-1 (sev 3, all)** — no loading/error states once real data is wired.
9. **OD-4 (sev 2, order detail)** — "Reject proof" → fixed term "Reject receipt"; state the consequence.
10. **P-MONEY-1 + P-DATE-1 (sev 2, all)** — `RM 88` → `RM 88.00`; `2026-09-20` → `20 Sep 2026`.

---

## String inventory for Chinese translation (`/provider`)

Namespace suggestion: `dict.provider.*`. Grouped by screen. (~80 strings; representative set — 5B extracts the full list programmatically.)

**Shell / nav:** Overview, Sell, Operate, Account, Dashboard, Storefront, Services, Products, Orders, Customers, Subscription · brand "Yuancheng Provider" · "Verifying access…", "Logout".

**Login:** "Provider Portal", "Manage your services, storefront and orders.", "Email", "Password", "Sign in", "Signing in…", "Create provider account", "Back to Yuancheng", "Incorrect email or password.", "Sign-in is not available right now."

**Dashboard:** "Good day", "Verified provider", "Needs attention", "Payment proof awaiting review", "Order ready to accept", "Fulfilment in progress", "Nothing needs your attention right now.", "This week", "Orders", "Completed", "Order value", "Quick actions", "Create service", "View orders", "Edit storefront", "Catalog", "Active services", "Products", "Plan", "Free (beta)".

**Orders list:** "Orders", "Review requests, verify payments, and fulfil orders.", "All", "Payment review", "Paid", "In progress", "Completed", "No orders here", "Orders in this state will appear here."

**Order detail:** "Orders" (back), "Next action", "No further action — this order is {status}.", "Progress", "Demo: actions update this screen only (not persisted).", "Customer request", "Package", "Amount", "Place", "Fulfilment", "Payment", "Payment proof submitted — awaiting your verification…", "receipt-… uploaded {date}", "Proof rejected. The customer can upload a new receipt.", "Payment verified", "Assignment", "Evidence required", "Completion evidence", step labels (Payment proof submitted, Payment verified, Accepted, Fulfilment started, Evidence submitted, Completed), action labels (Verify payment, Reject proof, Accept order, Cancel order, Start fulfilment, Submit evidence, Complete order, Confirm refund), "Rejection reason", "Confirm reject", "Cancel".

**Services / new:** "Services", "Your service listings and their packages.", "Create service", "No services yet", "Create your first service", "Published", "Description", "Request guidance (shown to the customer)", "Place", "Evidence", "None/Photo/Photo + video", "Customer visibility", "Automatic/Approval required", "Customer photo", "Off/Optional/Required", "Save service", "Cancel", "Demo: saving is disabled…".

**Products / new:** "Products", "Physical products. Customers contact you to buy — no Yuancheng checkout.", "Add product", "No products yet", "Physical", "Price (RM)", "Status", "Save product", "Demo: no cart, checkout, payment, shipping or inventory…".

**Customers / detail:** "Customers", "People who have ordered from you.", "No customers yet", "Customers will appear here after your first order.", "order(s)", "last {date}", "Order history", "Customer not found".

**Subscription:** "Subscription", "Your plan and capacity.", "Free", "Free during beta · Platform commission 0%", "Active", "You’re currently over your plan allowance…", "Capacity", "Services/Products/Staff/Runner/Evidence", "Enabled/Disabled", "unlimited", "Review catalog", "Increase capacity", "Paid plans and pricing are not enabled in the beta."

**Storefront:** "Storefront", "What your customers see.", "Preview storefront", "Business profile", "Published", "Business name", "Location", "About", "Manage", "Fulfilment information", "Orders are fulfilled by the provider. Payment is made directly to the provider (Stage 1)."

**Account:** "Account", "Business details, verification and how customers pay you.", "Business information", "Verification", "Identity/Business/Physical location", "Verified/Pending", "Payment methods", "Add method", "How customers pay you directly (Stage 1)…", "Account name", "Account number", "DuitNow QR", "Security", "Email", "Password", "Change".

---

## What's already right (keep)
- One primary action per order state; no free-form status dropdown.
- "Package" language (never SKU); "Physical / Contact provider" for products.
- "Payment under review" wording; proof ≠ paid.
- Verification factual, no temple endorsement; "your account, not a payout account".
- Needs-attention → order in one tap (≤2-tap rule met).
