# Cancellations, No-Shows & Fee Enforcement

> **Audience:** backend engineers building the Java API.
> **Purpose:** describe exactly what the frontend already lets a shop configure,
> how those settings are meant to be enforced, and the API surface the backend
> must expose so the booking system charges the right fee at the right time.

The frontend is **fully built for configuration** (a shop can define its whole
cancellation policy today) but enforcement is currently mocked. This document is
the contract for turning that configuration into real money movements.

Related existing specs (already in the repo — this doc consolidates + explains them):

- `api-spec/docs/05-booking-lifecycle.md` — booking state machine
- `api-spec/docs/06-payments.md` — Stripe Connect, deposits, refunds
- `api-spec/paths/store.yaml` — `/store/cancellation-policy` endpoints
- `api-spec/paths/bookings.yaml` — `cancel` / `no-show` operations

Global conventions (see `api-spec/docs/01-conventions.md`): **money is integer
cents**, times are **ISO-8601 UTC**, enums are `snake_case`, all writes accept an
`Idempotency-Key`, and every request is scoped to a `shopId` from the JWT.

---

## 1. What a shop configures (frontend)

All of this lives in **Store Settings → "Cancellation & no-show fees"** and
**"Policies"**. Source of truth: `types/store-settings.ts`, edited via
`components/dashboard/settings/cancellation-fees-section.tsx` and
`policies-section.tsx`.

### 1.1 Fields on `StoreSettings`

```ts
// A single tier in the cancellation fee ladder
interface CancellationFeeRule {
  id:          string;
  label:       string;   // "Same day", "Within 24 hours" — display only
  withinHours: number;   // fee applies if cancelling this many hours (or fewer) before start
  feeType:     "percentage" | "fixed_aud";
  feeValue:    number;   // 0–100 when percentage; AUD amount when fixed
}

interface StoreSettings {
  // … scheduling, holidays, surcharges, payments …

  // No-show handling
  noShowFeeType:  "percentage" | "fixed_aud" | "none";
  noShowFeeValue: number;

  // Whether the shop may auto-capture fees without manual confirmation.
  // Requires a connected Stripe account (stripeConnected === true).
  autoCharge: boolean;

  // The tiered cancellation ladder (may be empty = always free)
  cancellationFeeRules: CancellationFeeRule[];

  // Free-text shown to customers + on the public booking page
  cancellationPolicy: string;
}
```

### 1.2 Presets

The UI offers one-click templates (`CANCELLATION_TEMPLATES`) the shop can apply:

| Preset | Rules | No-show | Auto-charge |
|---|---|---|---|
| **Strict** | ≤2h → 100%, ≤24h → 50% | 100% | ✅ |
| **Moderate** | ≤6h → 100%, ≤48h → 25% | 100% | ❌ |
| **Relaxed** | ≤2h → 25% | 50% | ❌ |
| **No fees** | (none) | 0% | ❌ |

Presets just seed the fields above; the shop can then customise freely.

### 1.3 Validation rules the backend must also enforce

Mirrored from `lib/validations/store-settings.ts`:

- `withinHours`: integer, `1..720` (1 hour to 30 days).
- `feeValue`: when `feeType = percentage`, `0..100`; when `fixed_aud`, `>= 0`.
- `noShowFeeValue`: required unless `noShowFeeType = none`.
- `autoCharge = true` is only permitted when the shop has a connected Stripe
  account. Reject with `422` otherwise.
- Rules do **not** need to be pre-sorted; the engine sorts them (see §3).

---

## 2. The "fee base" — what the percentage applies to

A percentage fee is calculated against the **booking's service/package price**
(the snapshotted `priceCents` on the booking, including any surcharges that were
applied at creation). It is **not** re-derived from the live service price.

For multi-item public bookings (a customer can book several services/packages in
one appointment — see `types/public-booking.ts`), the fee base is the **sum of
all line prices** on the booking.

---

## 3. Fee-calculation algorithm (the core contract)

Given a booking and "now", compute the fee like this:

```
function cancellationFee(booking, settings, now):
    hoursUntil = (booking.startAt - now) / 3600      # may be negative if past

    # Sort tiers tightest-first (smallest withinHours first)
    tiers = sort(settings.cancellationFeeRules, by=withinHours asc)

    # The first tier whose window still covers "now" wins.
    for tier in tiers:
        if hoursUntil <= tier.withinHours:
            return applyFee(tier.feeType, tier.feeValue, booking.feeBaseCents)

    # Outside every tier → free
    return 0
```

Key semantics:

- **Tightest matching tier wins.** With `≤2h → 100%` and `≤24h → 50%`, a
  cancellation 1 hour out matches the 2h tier (100%), not the 24h tier.
  Sorting ascending and returning the first match gives this automatically.
- **Outside all tiers = free.** If the earliest tier is `≤24h` and the customer
  cancels 3 days out, there is no fee.
- **Empty `cancellationFeeRules` = always free.**
- `applyFee`:
  - `percentage`: `round(feeBaseCents * feeValue / 100)`
  - `fixed_aud`: `min(feeValue * 100, feeBaseCents)` — never charge more than the booking.
- **Timezone:** compute `hoursUntil` purely from UTC instants. The shop's local
  timezone is irrelevant to the difference; only display is localised.

No-shows use `noShowFeeType/Value` directly (they are not part of the tier
ladder) against the same fee base.

### Worked examples (Strict preset, $60 service)

| When cancelled | Matched tier | Fee |
|---|---|---|
| 3 days before | none | $0.00 |
| 20 hours before | ≤24h (50%) | $30.00 |
| 1 hour before | ≤2h (100%) | $60.00 |
| No-show (didn't attend) | no-show rule (100%) | $60.00 |

---

## 4. How the fee is actually collected

This ties into the payments model (`api-spec/docs/06-payments.md`). The behaviour
depends on whether funds were already held at booking time.

### Case A — a deposit / full amount was captured at booking

1. Compute `feeCents` per §3.
2. `capture = min(feeCents, alreadyHeldCents)`.
3. If `feeCents <= alreadyHeldCents`: capture the fee portion, **refund the
   remainder** to the customer.
4. If `feeCents > alreadyHeldCents` (fee exceeds the deposit): capture all held
   funds, and — only if a full card is on file and policy allows — create a new
   PaymentIntent for the shortfall.

### Case B — nothing was captured (pay-in-store bookings)

1. Compute `feeCents`.
2. If `feeCents > 0` **and** `autoCharge = true` **and** a reusable payment
   method is on file: create + confirm a PaymentIntent for `feeCents`
   (`purpose = cancellation_fee` or `no_show_fee`).
3. Otherwise: record the fee as **owed** (surface it to the shop) but do not
   charge. Many shops chase this manually.

`autoCharge = false` means: **never move money without an explicit staff action.**
The API should still *calculate and return* the fee so the dashboard can show
"Charge $30 fee?" and let staff confirm.

---

## 5. Enforcement points (where cancellations happen)

| # | Actor | Frontend today | Backend endpoint to build |
|---|---|---|---|
| 1 | Staff cancels from the calendar | `bookings-page-client.tsx → handleCancel()` sets status locally, **no fee** | `POST /api/v1/bookings/{id}/cancel` |
| 2 | Staff marks a no-show | `visits/*` marks status locally | `POST /api/v1/bookings/{id}/no-show` |
| 3 | Customer self-cancels via link | not yet built (confirmation page only says "contact the shop") | `POST /api/v1/public/bookings/{token}/cancel` |
| 4 | System auto no-show | n/a (frontend can't run jobs) | scheduled job → same as #2 |

### 5.1 `POST /bookings/{id}/cancel`

Request:

```json
{
  "reason": "client_request",          // enum, see §6
  "chargeFee": true,                    // staff toggle; ignored if autoCharge handles it
  "note": "Client called, feeling unwell"
}
```

Server steps:

1. **State guard:** booking must be `pending` or `confirmed`; else `409`.
2. Compute `feeCents` (§3) using the booking's `startAt` and `now`.
3. Move money per §4 (respecting `chargeFee` + `autoCharge`).
4. Set `status = cancelled`, persist `cancellationReason`, `cancelledAt`,
   `feeChargedCents`.
5. Free the calendar slot (the DB exclusion constraint only counts
   `pending/confirmed/in_progress`, so this is automatic once status changes).
6. Fire the `booking_cancelled` reminder rule if enabled.
7. Notify the shop owner (bell).

Response: the updated `Booking` plus a `feeCharged` block:

```json
{
  "booking": { "id": "bk_…", "status": "cancelled", "cancellationReason": "client_request" },
  "fee": {
    "assessedCents": 3000,
    "chargedCents":  3000,
    "refundedCents": 3000,
    "currency": "AUD"
  }
}
```

### 5.2 `POST /bookings/{id}/no-show`

- State guard: `confirmed` or `in_progress` **and** `now > endAt`.
- Fee uses `noShowFeeType/Value`.
- Charged only if `autoCharge` (or explicit staff confirm).
- Sets `status = no_show`.

### 5.3 `POST /public/bookings/{token}/cancel` (customer self-service)

- `token` is an unguessable per-booking token (never expose internal ids publicly).
- Same fee logic. The customer is shown the fee **before** confirming (do a
  `GET` first, or return a `409 fee_preview` pattern — a preview endpoint is
  cleaner: `GET /public/bookings/{token}/cancel-quote`).
- Only allowed while `pending`/`confirmed` and before `startAt`.

### 5.4 Background jobs (see lifecycle doc §Background jobs)

- `auto-no-show`: bookings 30 min past `endAt` still `confirmed/in_progress` and
  not manually handled → `no_show` (+ fee if `autoCharge`).
- `cancel-pending-payment`: `pending` bookings whose deposit was never paid →
  `cancelled` with **no fee** (the customer never held the slot).

---

## 6. Enums

```
CancellationReason:  client_request | shop_request | duplicate | weather |
                     staff_unavailable | payment_failed | other
PaymentIntentPurpose (fee-related): cancellation_fee | no_show_fee
BookingStatus:       pending | confirmed | in_progress | completed |
                     cancelled | no_show
```

`shop_request` / `staff_unavailable` cancellations should **never** charge the
customer a fee regardless of tier (the shop caused it). Enforce this server-side.

---

## 7. Reading the policy for enforcement

The policy lives on `StoreSettings`. Two ways to read it (both already in
`api-spec/paths/store.yaml`):

- `GET /api/v1/store/settings` — everything.
- `GET /api/v1/store/cancellation-policy` — just the policy + rules:

```json
{
  "policyText": "We understand plans change…",
  "noShowFeeType": "percentage",
  "noShowFeeValue": 100,
  "autoCharge": false,
  "rules": [
    { "id": "cfr1", "label": "Same day (within 2 hours)", "withinHours": 2,  "feeType": "percentage", "feeValue": 100 },
    { "id": "cfr2", "label": "Within 24 hours",           "withinHours": 24, "feeType": "percentage", "feeValue": 50  }
  ]
}
```

Write via `PUT /store/cancellation-policy` (replace all) or the granular
`/store/cancellation-policy/rules` CRUD endpoints.

---

## 8. Customer-facing surface (public booking)

The public booking flow now shows the policy so the customer agrees to it before
paying. The backend must expose a **trimmed** version on the public business
profile (`GET /api/v1/public/businesses/{slug}` → already documented in
`api-spec/paths/public.yaml`). Frontend shape (`types/public-booking.ts`):

```ts
interface PublicCancellationPolicy {
  summary:        string;        // one-liner, e.g. "Free cancellation up to 24 hours before."
  policyText:     string;        // full text
  freeUntilHours: number | null; // largest tier window before which cancelling is free; null = always free
}
```

- `freeUntilHours` = the **largest** `withinHours` among the rules (the point at
  which fees start). If there are no rules, `null`.
- `summary` can be generated from the ladder or authored; keep it short.
- It is rendered on the **Payment step** (`step-payment.tsx`) and the
  **confirmation screen** (`step-confirmation.tsx`).

---

## 9. Edge cases & rules of thumb

- **Never charge more than the booking value.** Cap fixed fees at the fee base.
- **Reschedule ≠ cancel.** Rescheduling keeps the booking `confirmed` and moves
  no money (unless a surcharge delta applies). Don't run cancellation fees on it.
- **Already completed bookings can't be cancelled** — open a dispute/refund flow
  instead (`api-spec/docs/05` marks completed as terminal).
- **Idempotency:** cancel/no-show must be idempotent on `Idempotency-Key` so a
  retried request doesn't double-charge.
- **Refund failures** (e.g. expired card) must not block the status change; queue
  the refund and surface an alert.
- **Shop-caused cancellations** (`shop_request`, `staff_unavailable`) are always
  free to the customer and should fully refund any deposit.
- **Auditing:** persist `assessedCents`, `chargedCents`, `refundedCents`, actor,
  and reason on every transition for dispute handling.

---

## 10. Backend build checklist

- [ ] `GET/PUT /store/cancellation-policy` + rule CRUD persist `StoreSettings` fields.
- [ ] `422` when `autoCharge=true` without a connected Stripe account.
- [ ] Fee engine implementing §3 (tightest-tier-wins, cap fixed fees, free outside tiers).
- [ ] `POST /bookings/{id}/cancel` with fee assessment + capture/refund (§4, §5.1).
- [ ] `POST /bookings/{id}/no-show` using no-show fee (§5.2).
- [ ] Public `cancel-quote` + `cancel` endpoints (§5.3).
- [ ] `auto-no-show` and `cancel-pending-payment` scheduled jobs (§5.4).
- [ ] Shop-caused reasons bypass fees + full refund (§6).
- [ ] Trimmed `PublicCancellationPolicy` on the public business profile (§8).
- [ ] Idempotent, audited money movements (§9).
