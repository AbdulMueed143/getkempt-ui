# Retail Products & In-Store Checkout

> **Audience:** backend engineers building the Java API.
> **Purpose:** describe the merch/product and point-of-sale features now built on
> the frontend, and the API + data model the backend needs to make them real.

This is intentionally **basic retail**: a shop can list a handful of products
(pomade, beard oil, gift sets…) and ring them up when a customer is at the
counter — typically right after their appointment. It is **not** a full
inventory/ERP system: no purchase orders, suppliers, variants, or barcodes
beyond a plain SKU string.

Global conventions (see `api-spec/docs/01-conventions.md`): **money is integer
cents**, times are **ISO-8601 UTC**, enums are `snake_case`, all writes accept an
`Idempotency-Key`, DELETE is soft-delete, and every request is scoped to a
`shopId` from the JWT. Prices in the UI are **AUD, GST-inclusive**.

---

## 1. Feature overview

Two connected pieces:

1. **Products** (`/products`) — a CRUD catalogue of physical merch. Mirrors the
   Services page. Source: `types/product.ts`, `lib/mock/products.ts`,
   `components/dashboard/products/*`.
2. **Checkout / POS** (`/checkout`) — build a basket of products (+ ad-hoc custom
   items), take card or cash, print a receipt. Source: `types/checkout.ts`,
   `components/dashboard/checkout/*`.

A sale is a single over-the-counter transaction. It can optionally be linked to a
client and/or the booking the customer just completed, but walk-in sales need
neither.

---

## 2. Product data model

Frontend type (`types/product.ts`). Backend adds standard envelope fields
(`id`, `shopId`, `createdAt`, `updatedAt`, `deletedAt`) and stores money in cents.

```ts
type ProductCategory =
  | "hair_care" | "skin_care" | "styling" | "grooming"
  | "tools" | "accessories" | "gift" | "other";

type ProductStatus = "active" | "inactive";

interface Product {
  id: string;

  // Identity
  name:        string;
  category:    ProductCategory;
  description: string;
  image?:      string;    // CDN URL (uploaded via the existing uploads flow)
  sku:         string;    // free-text SKU / barcode; optional but unique per shop when present
  brand?:      string;

  // Pricing (AUD in UI; priceCents / costCents on the wire)
  price:   number;          // retail, GST-inclusive
  cost:    number | null;   // wholesale cost, for margin reporting; never shown to customers
  taxable: boolean;         // true → price includes 10% GST

  // Inventory
  trackInventory:    boolean;
  stockQuantity:     number | null;  // null when not tracking
  lowStockThreshold: number | null;  // null → no low-stock alert

  status:    ProductStatus;
  createdAt: string;
}
```

### Backend field mapping

| Frontend | Wire (JSON) | DB | Notes |
|---|---|---|---|
| `price` | `priceCents` | `price_cents int` | GST-inclusive |
| `cost` | `costCents` | `cost_cents int null` | margin = (price−cost)/price |
| `taxable` | `taxable` | `taxable bool` | default true |
| `stockQuantity` | `stockQuantity` | `stock_quantity int null` | null ⇔ `trackInventory=false` |
| `lowStockThreshold` | `lowStockThreshold` | `low_stock_threshold int null` | |
| `status` | `status` | `status enum` | `inactive` hidden at checkout |

Validation (from `lib/validations/product.ts`) to enforce server-side:

- `name` required, ≤80 chars; `description` ≤500; `sku`/`brand` optional.
- `price >= 0`; `cost >= 0` or null.
- If `trackInventory = true` → `stockQuantity` required (`>= 0`, integer).
- `stockQuantity`/`lowStockThreshold` are integers ≥ 0.

### Derived helpers (frontend also computes; backend should expose or allow)

- `isOutOfStock` = `trackInventory && stockQuantity <= 0`
- `isLowStock`   = `trackInventory && threshold != null && 0 < stockQuantity <= threshold`

---

## 3. Products API

Follows the same shape as `api-spec/paths/services.yaml`.

```
GET    /api/v1/products?cursor=&limit=&category=&status=&q=   → list (cursor paginated)
POST   /api/v1/products                                       → create
GET    /api/v1/products/{id}                                  → read
PATCH  /api/v1/products/{id}                                  → update
DELETE /api/v1/products/{id}                                  → soft-delete

POST   /api/v1/products/{id}/stock-adjustment                 → manual stock change
GET    /api/v1/products/low-stock                             → items at/under threshold
```

`stock-adjustment` body (restocks, shrinkage, corrections):

```json
{ "delta": 24, "reason": "restock", "note": "Weekly delivery" }
```

`reason` enum: `restock | correction | damaged | lost | return | stocktake`.
Every adjustment should be recorded in a `stock_movements` ledger (append-only)
so stock is auditable; the sale flow (§5) writes to the same ledger.

---

## 4. Checkout data model

Frontend types (`types/checkout.ts`). A sale is a list of **cart lines** plus
order-level discount/tip and a payment method.

```ts
type SaleItemKind = "product" | "service" | "custom";
type CheckoutPaymentMethod = "card" | "cash";

interface CartLine {
  lineId:    string;          // client-side id, not persisted as-is
  kind:      SaleItemKind;
  refId:     string | null;   // productId / serviceId, or null for custom
  name:      string;          // snapshotted at sale time
  unitPrice: number;          // GST-inclusive unit price (AUD)
  quantity:  number;
  taxable:   boolean;
}

interface SaleTotals {
  subtotal:  number;   // Σ(unitPrice × qty) before discount, GST-inclusive
  discount:  number;   // order-level discount amount
  taxAmount: number;   // GST *contained within* the discounted taxable total
  tip:       number;
  total:     number;   // subtotal − discount + tip
}
```

The payload the frontend will POST (`CreateSaleInput`):

```json
{
  "lines": [
    { "kind": "product", "refId": "prd1", "name": "Matte Clay Pomade", "unitPrice": 28.00, "quantity": 2, "taxable": true },
    { "kind": "custom",  "refId": null,   "name": "Gift wrap",         "unitPrice": 3.00,  "quantity": 1, "taxable": true }
  ],
  "discount": 5.00,
  "tip": 0,
  "paymentMethod": "card",
  "clientId": null,
  "bookingId": null,
  "staffId": "stf_123",
  "cashReceived": null
}
```

> On the wire, convert every amount to cents (`unitPriceCents`, `discountCents`,
> `tipCents`, `cashReceivedCents`). The examples show AUD for readability.

---

## 5. Sales API + server responsibilities

```
POST /api/v1/sales                     → create/record a sale (the "complete" action)
GET  /api/v1/sales?cursor=&limit=      → list sales
GET  /api/v1/sales/{id}                → read (receipt)
POST /api/v1/sales/{id}/refund         → full or partial refund
```

### `POST /sales` server steps

1. **Authz:** caller needs `sales.write` for the shop.
2. **Re-price, don't trust the client.** For every `product` line, load the
   product and **recompute `unitPrice` from the server** (ignore the client's
   number) to prevent tampering. `custom` lines keep their supplied price (staff
   entered it). `service` lines re-price from the service catalogue.
3. **Recompute totals server-side** (see §6). Reject with `422` if the client's
   totals differ beyond rounding.
4. **Inventory:** for each `product` line where `trackInventory`, decrement
   `stockQuantity` by `quantity` and write a `stock_movements` row
   (`reason = sale`). If stock would go negative, either reject (`409`) or allow
   oversell per a shop setting — default **reject**.
5. **Payment:**
   - `card`: create + capture a PaymentIntent for `totalCents`
     (`purpose = retail_sale`). Sale is only `completed` once captured.
   - `cash`: no gateway. Persist `cashReceivedCents` and compute
     `changeDueCents = cashReceived − total`.
6. **Persist** the sale + lines (snapshot names/prices so later catalogue edits
   don't rewrite history). Generate a human `reference` (e.g. `SALE-4F2A`).
7. **Link** to `clientId` / `bookingId` when provided; roll the amount into the
   client's `lifetimeSpendCents`.
8. **Idempotency** on `Idempotency-Key`.

### Response

```json
{
  "id": "sale_…",
  "reference": "SALE-4F2A",
  "lines": [ … ],
  "totals": { "subtotalCents": 5900, "discountCents": 500, "taxAmountCents": 491, "tipCents": 0, "totalCents": 5400 },
  "paymentMethod": "card",
  "clientId": null, "bookingId": null, "staffId": "stf_123",
  "cashReceivedCents": null, "changeDueCents": null,
  "createdAt": "2026-07-05T03:11:00Z"
}
```

### Refunds

`POST /sales/{id}/refund` with optional line selection. Refunding a `product`
line should **restock** it (`stock_movements.reason = return`) unless the caller
passes `restock: false` (e.g. damaged goods).

---

## 6. GST calculation (Australia)

Retail prices are **GST-inclusive**, so the GST is a component *within* the price,
not added on top. Rate is 10% (`GST_RATE` in `types/checkout.ts`).

```
gstComponent(inclusiveAmount) = inclusiveAmount − inclusiveAmount / 1.10
```

Order-level totals (matches the frontend `useMemo`):

```
subtotal            = Σ unitPrice × qty
taxableSubtotal     = Σ (taxable ? unitPrice × qty : 0)
discount            = min(requestedDiscount, subtotal)          # clamp
taxableAfterDiscount= taxableSubtotal − discount × (taxableSubtotal / subtotal)
taxAmount           = gstComponent(taxableAfterDiscount)
total               = subtotal − discount + tip
```

Notes:

- Discount is applied to the **whole order** and reduces the taxable base
  proportionally (so mixed taxable/GST-free baskets stay correct).
- `taxAmount` is **reporting only** — it's already inside `total`. Do not add it.
- Tip is not taxable and not discountable.
- Round to cents at each monetary step; store cents.

### Worked example

2 × Pomade @ $28 (taxable) + 1 × Gift wrap @ $3 (taxable), $5 discount, no tip:

```
subtotal            = 59.00
taxableSubtotal     = 59.00
discount            = 5.00
taxableAfterDiscount= 54.00
taxAmount (GST)     = 54.00 − 54.00/1.10 = 4.91
total               = 54.00
```

---

## 7. Linking sales to bookings & clients

- **Walk-in sale:** `clientId` and `bookingId` both null. Fine.
- **Post-appointment sale:** the frontend can pass the just-completed
  `bookingId`; the backend links them so a booking's true value =
  service revenue + attached retail.
- **Named client:** pass `clientId`; the UI currently captures an optional
  free-text `customerName`, which the backend may use to upsert/search a client
  or just store on the sale for the receipt.

The current checkout UI captures `customerName` as free text (no client picker)
to stay simple; wiring a real client search is a follow-up.

---

## 8. Frontend component map

| Path | Role |
|---|---|
| `types/product.ts` | `Product`, categories, stock helpers |
| `types/checkout.ts` | `CartLine`, `SaleTotals`, `CompletedSale`, `CreateSaleInput`, GST helper |
| `lib/validations/product.ts` | Zod schema mirrored in §2 |
| `lib/mock/products.ts` | Seed catalogue (swap for `GET /products`) |
| `components/dashboard/products/product-page-client.tsx` | List + filters + CRUD wiring |
| `components/dashboard/products/product-slideover.tsx` | Add/edit form |
| `components/dashboard/products/product-card.tsx` / `product-stats.tsx` | Presentation |
| `components/dashboard/checkout/checkout-page-client.tsx` | The POS: cart, totals, payment, receipt |
| `lib/mock/dashboard.ts` | Nav entries: **Products** (Manage) + **Checkout & POS** (Payments) + "New Sale" quick action |

**Where the API swaps in:**

- Products page: replace `useState(MOCK_PRODUCTS)` + local mutations with
  `GET/POST/PATCH/DELETE /products`.
- Checkout: `completeSale()` currently builds a local `CompletedSale`; replace
  the body (already tagged `TODO(api)`) with `POST /sales`, then render the
  returned sale in the existing `Receipt` view.

---

## 9. Edge cases & rules of thumb

- **Never trust client prices** — re-price product/service lines server-side (§5.2).
- **Stock can't go negative** by default; return `409` with the offending line.
- **Snapshot line data** (name, unit price) onto the sale so later edits don't
  rewrite past receipts.
- **Inactive / deleted products** can't be added to new sales (`422`) but must
  still resolve for historical receipts.
- **Cash change** = `cashReceived − total`; block completion when
  `cashReceived < total` (the UI already disables the button).
- **Refund restocks** by default; expose a `restock:false` flag for damaged items.
- **GST-free items** (`taxable=false`) contribute $0 to `taxAmount`.
- **Idempotency + audit:** sales and stock movements are financial records —
  keep them append-only and idempotent.

---

## 10. Backend build checklist

- [ ] `products` table + CRUD + soft-delete, cents money, per-shop unique SKU.
- [ ] `stock_movements` append-only ledger; `stock-adjustment` + low-stock endpoints.
- [ ] `sales` + `sale_lines` tables with snapshotted names/prices.
- [ ] `POST /sales`: server re-pricing, total recompute, inventory decrement, payment capture (card) / change calc (cash).
- [ ] GST computed per §6 and stored as `taxAmountCents` (reporting only).
- [ ] Optional `clientId` / `bookingId` linkage + client lifetime-spend rollup.
- [ ] `POST /sales/{id}/refund` with optional restock.
- [ ] Idempotent, audited, multi-tenant-scoped throughout.
