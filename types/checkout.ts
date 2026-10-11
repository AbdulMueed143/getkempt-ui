/* ── In-store checkout / point-of-sale ──────────────────────────────────────
 *
 * A lightweight "ring someone up at the counter" flow. A sale is a basket of
 * line items — products, a completed service, or an ad-hoc custom item — paid
 * for in one transaction. It can optionally be linked to a client and/or the
 * booking the customer just finished.
 *
 * Australian retail prices are GST-inclusive, so every `unitPrice` already
 * contains 10% GST. The GST *component* is broken out for the receipt only.
 * ---------------------------------------------------------------------------*/

/** GST rate applied to taxable items (Australia). */
export const GST_RATE = 0.1;

/** The GST portion contained within a GST-inclusive amount. */
export function gstComponent(inclusiveAmount: number): number {
  return Math.round((inclusiveAmount - inclusiveAmount / (1 + GST_RATE)) * 100) / 100;
}

export type SaleItemKind = "product" | "service" | "custom";

export interface CartLine {
  /** Client-side line id (not the product/service id). */
  lineId:    string;
  kind:      SaleItemKind;
  /** productId / serviceId when the line references a catalogue item. */
  refId:     string | null;
  name:      string;
  /** GST-inclusive unit price (AUD). */
  unitPrice: number;
  quantity:  number;
  taxable:   boolean;
}

export type CheckoutPaymentMethod = "card" | "cash";

export const CHECKOUT_PAYMENT_LABELS: Record<CheckoutPaymentMethod, string> = {
  card: "Card / EFTPOS",
  cash: "Cash",
};

export interface SaleTotals {
  /** Sum of line totals BEFORE any discount (GST-inclusive). */
  subtotal:  number;
  /** Order-level discount amount applied to the subtotal. */
  discount:  number;
  /** GST component contained within the (discounted) taxable total. */
  taxAmount: number;
  tip:       number;
  /** subtotal - discount + tip. */
  total:     number;
}

export interface CompletedSale {
  id:            string;
  reference:     string;         // human-friendly, e.g. "SALE-4F2A"
  lines:         CartLine[];
  totals:        SaleTotals;
  paymentMethod: CheckoutPaymentMethod;
  /** Optional links — walk-in sales have both null. */
  clientId:      string | null;
  clientName:    string | null;
  bookingId:     string | null;
  staffId:       string | null;
  cashReceived:  number | null;  // for cash sales, to compute change
  changeDue:     number | null;
  createdAt:     string;         // ISO
}

/** Payload the frontend will POST to the backend to record a sale. */
export interface CreateSaleInput {
  lines: Array<{
    kind:      SaleItemKind;
    refId:     string | null;
    name:      string;
    unitPrice: number;   // AUD (backend converts to cents)
    quantity:  number;
    taxable:   boolean;
  }>;
  discount:      number;
  tip:           number;
  paymentMethod: CheckoutPaymentMethod;
  clientId:      string | null;
  bookingId:     string | null;
  staffId:       string | null;
  cashReceived:  number | null;
}
