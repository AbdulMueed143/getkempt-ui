"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Banknote,
  CheckCircle2,
  Package,
  Sparkles,
} from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock/products";
import { PRODUCT_CATEGORY_LABELS } from "@/types/product";
import type { Product } from "@/types/product";
import {
  GST_RATE,
  gstComponent,
  CHECKOUT_PAYMENT_LABELS,
  type CartLine,
  type CheckoutPaymentMethod,
  type CompletedSale,
  type SaleTotals,
} from "@/types/checkout";
import { formatMoney } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/hooks/use-toast";

function makeReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `SALE-${out}`;
}

function lineTotal(l: CartLine): number {
  return l.unitPrice * l.quantity;
}

export function CheckoutPageClient() {
  const toast = useToast();
  const catalogue = useMemo(
    () => MOCK_PRODUCTS.filter((p) => p.status === "active"),
    []
  );

  const [cart, setCart]                   = useState<CartLine[]>([]);
  const [search, setSearch]               = useState("");
  const [discount, setDiscount]           = useState(0);
  const [tip, setTip]                     = useState(0);
  const [method, setMethod]               = useState<CheckoutPaymentMethod>("card");
  const [customerName, setCustomerName]   = useState("");
  const [cashReceived, setCashReceived]   = useState<number | "">("");
  const [customName, setCustomName]       = useState("");
  const [customPrice, setCustomPrice]     = useState<number | "">("");
  const [sale, setSale]                   = useState<CompletedSale | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return catalogue;
    return catalogue.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q)
    );
  }, [catalogue, search]);

  /* ── Cart operations ── */
  const addProduct = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.kind === "product" && l.refId === p.id);
      if (existing) {
        if (p.trackInventory && existing.quantity >= (p.stockQuantity ?? 0)) {
          toast.info({ title: "No more stock", message: `Only ${p.stockQuantity} of "${p.name}" on hand.` });
          return prev;
        }
        return prev.map((l) =>
          l.lineId === existing.lineId ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          lineId:    `line-${Date.now()}-${p.id}`,
          kind:      "product",
          refId:     p.id,
          name:      p.name,
          unitPrice: p.price,
          quantity:  1,
          taxable:   p.taxable,
        },
      ];
    });
  };

  const addCustomItem = () => {
    if (!customName.trim() || customPrice === "" || Number(customPrice) < 0) return;
    setCart((prev) => [
      ...prev,
      {
        lineId:    `line-${Date.now()}-custom`,
        kind:      "custom",
        refId:     null,
        name:      customName.trim(),
        unitPrice: Number(customPrice),
        quantity:  1,
        taxable:   true,
      },
    ]);
    setCustomName("");
    setCustomPrice("");
  };

  const changeQty = (lineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.lineId === lineId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  const removeLine = (lineId: string) => {
    setCart((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  /* ── Totals ── */
  const totals: SaleTotals = useMemo(() => {
    const subtotal = cart.reduce((s, l) => s + lineTotal(l), 0);
    const taxableSubtotal = cart.reduce((s, l) => s + (l.taxable ? lineTotal(l) : 0), 0);
    const safeDiscount = Math.min(Math.max(0, discount), subtotal);
    const taxableAfterDiscount =
      subtotal > 0 ? taxableSubtotal - safeDiscount * (taxableSubtotal / subtotal) : 0;
    const taxAmount = gstComponent(taxableAfterDiscount);
    const total = subtotal - safeDiscount + tip;
    return { subtotal, discount: safeDiscount, taxAmount, tip, total };
  }, [cart, discount, tip]);

  const changeDue =
    method === "cash" && cashReceived !== "" ? Number(cashReceived) - totals.total : null;

  const canComplete =
    cart.length > 0 && (method !== "cash" || (cashReceived !== "" && Number(cashReceived) >= totals.total));

  /* ── Complete ── */
  const completeSale = () => {
    if (!canComplete) return;
    // TODO(api): POST /api/v1/sales — see docs/PRODUCTS_AND_CHECKOUT.md
    const completed: CompletedSale = {
      id:            `sale_${Date.now()}`,
      reference:     makeReference(),
      lines:         cart,
      totals,
      paymentMethod: method,
      clientId:      null,
      clientName:    customerName.trim() || null,
      bookingId:     null,
      staffId:       null,
      cashReceived:  method === "cash" && cashReceived !== "" ? Number(cashReceived) : null,
      changeDue:     changeDue != null ? Math.max(0, changeDue) : null,
      createdAt:     new Date().toISOString(),
    };
    setSale(completed);
    toast.success({ title: "Sale complete", message: `${completed.reference} · ${formatMoney(totals.total)}` });
  };

  const newSale = () => {
    setSale(null);
    setCart([]);
    setDiscount(0);
    setTip(0);
    setMethod("card");
    setCustomerName("");
    setCashReceived("");
  };

  /* ── Receipt state ── */
  if (sale) {
    return <Receipt sale={sale} onNewSale={newSale} />;
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Checkout</h1>
        <p className="text-sm mt-0.5 text-[#6B7280]">
          Ring up products and extras when a customer is at the counter.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* ── Catalogue ── */}
        <div className="space-y-4 order-2 lg:order-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9FB2D9]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or scan SKU…"
              className="w-full rounded-xl text-sm py-2.5 pl-9 pr-4 bg-white border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 placeholder:text-[#6B7280]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((p) => {
              const soldOut = p.trackInventory && (p.stockQuantity ?? 0) <= 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={soldOut}
                  onClick={() => addProduct(p)}
                  className={cn(
                    "text-left rounded-2xl border p-3 bg-white transition-all",
                    soldOut
                      ? "border-[#E8E4DA] opacity-50 cursor-not-allowed"
                      : "border-[#E8E4DA] hover:border-[#C4A882] hover:shadow-md active:scale-[0.99]"
                  )}
                >
                  <div className="flex h-16 w-full items-center justify-center rounded-xl bg-[#F5F3EE] overflow-hidden mb-2">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package size={22} className="text-[#9FB2D9]" />
                    )}
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9FB2D9]">
                    {PRODUCT_CATEGORY_LABELS[p.category]}
                  </p>
                  <p className="text-sm font-semibold text-[#0D1B2A] leading-tight line-clamp-2">{p.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#0D1B2A]">{formatMoney(p.price)}</span>
                    {soldOut ? (
                      <span className="text-[10px] font-medium text-red-500">Sold out</span>
                    ) : p.trackInventory ? (
                      <span className="text-[10px] text-[#6B7280]">{p.stockQuantity} left</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom line item */}
          <div className="rounded-2xl border border-dashed border-[#E8E4DA] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-2 flex items-center gap-1.5">
              <Sparkles size={13} /> Add a custom item
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Item name (e.g. Gift wrap)"
                className="flex-1 rounded-xl text-sm py-2.5 px-3 bg-[#FAF8F3] border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Price"
                className="w-full sm:w-28 rounded-xl text-sm py-2.5 px-3 bg-[#FAF8F3] border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40"
              />
              <button
                type="button"
                onClick={addCustomItem}
                disabled={!customName.trim() || customPrice === ""}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#0D1B2A] text-white disabled:opacity-40 hover:bg-[#1B3163] transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* ── Cart / payment ── */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-6 rounded-2xl border border-[#E8E4DA] bg-white shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#F0EEE6]">
            <ShoppingBag size={16} className="text-[#0D1B2A]" />
            <h2 className="text-sm font-bold text-[#0D1B2A]">Current sale</h2>
            {cart.length > 0 && (
              <span className="ml-auto text-xs text-[#6B7280]">
                {cart.reduce((n, l) => n + l.quantity, 0)} item{cart.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="max-h-[38vh] overflow-y-auto px-5 py-3 divide-y divide-[#F0EEE6]">
            {cart.length === 0 ? (
              <p className="text-sm text-[#6B7280] text-center py-8">
                Tap a product to start a sale.
              </p>
            ) : (
              cart.map((l) => (
                <div key={l.lineId} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#0D1B2A] truncate">{l.name}</p>
                    <p className="text-xs text-[#6B7280]">{formatMoney(l.unitPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => changeQty(l.lineId, -1)}
                      className="h-6 w-6 rounded-lg border border-[#E8E4DA] flex items-center justify-center text-[#0D1B2A] hover:bg-[#F5F3EE]"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-[#0D1B2A]">{l.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(l.lineId, 1)}
                      className="h-6 w-6 rounded-lg border border-[#E8E4DA] flex items-center justify-center text-[#0D1B2A] hover:bg-[#F5F3EE]"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="w-16 text-right text-sm font-semibold text-[#0D1B2A] shrink-0">
                    {formatMoney(lineTotal(l))}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(l.lineId)}
                    className="text-[#9FB2D9] hover:text-red-500 shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="px-5 py-4 border-t border-[#F0EEE6] space-y-4">
              {/* Customer + adjustments */}
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name (optional)"
                className="w-full rounded-xl text-sm py-2 px-3 bg-[#FAF8F3] border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40"
              />

              <div className="grid grid-cols-2 gap-2">
                <AdjustField label="Discount ($)" value={discount} onChange={setDiscount} />
                <AdjustField label="Tip ($)" value={tip} onChange={setTip} />
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <Line label="Subtotal" value={formatMoney(totals.subtotal)} />
                {totals.discount > 0 && (
                  <Line label="Discount" value={`− ${formatMoney(totals.discount)}`} muted />
                )}
                <Line label={`Incl. GST (${Math.round(GST_RATE * 100)}%)`} value={formatMoney(totals.taxAmount)} muted />
                {totals.tip > 0 && <Line label="Tip" value={formatMoney(totals.tip)} muted />}
                <div className="flex items-center justify-between pt-2 border-t border-[#F0EEE6]">
                  <span className="font-bold text-[#0D1B2A]">Total</span>
                  <span className="text-lg font-bold text-[#0D1B2A]">{formatMoney(totals.total)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="grid grid-cols-2 gap-2">
                {(["card", "cash"] as CheckoutPaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all",
                      method === m
                        ? "border-[#0D1B2A] bg-[#0D1B2A] text-white"
                        : "border-[#E8E4DA] bg-white text-[#0D1B2A] hover:border-[#C4A882]"
                    )}
                  >
                    {m === "card" ? <CreditCard size={15} /> : <Banknote size={15} />}
                    {CHECKOUT_PAYMENT_LABELS[m]}
                  </button>
                ))}
              </div>

              {method === "cash" && (
                <div>
                  <AdjustField
                    label="Cash received ($)"
                    value={cashReceived === "" ? 0 : cashReceived}
                    onChange={(v) => setCashReceived(v)}
                  />
                  {changeDue != null && changeDue >= 0 && (
                    <p className="mt-1.5 text-xs text-[#16A34A] font-medium">
                      Change due: {formatMoney(changeDue)}
                    </p>
                  )}
                  {changeDue != null && changeDue < 0 && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {formatMoney(Math.abs(changeDue))} short
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={completeSale}
                disabled={!canComplete}
                className="w-full rounded-xl py-3 text-sm font-semibold bg-[#C4A882] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {method === "card"
                  ? `Charge ${formatMoney(totals.total)}`
                  : `Take payment ${formatMoney(totals.total)}`}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function AdjustField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">{label}</span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value === 0 ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        placeholder="0.00"
        className="mt-1 w-full rounded-xl text-sm py-2 px-3 bg-[#FAF8F3] border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40"
      />
    </label>
  );
}

function Line({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-[#6B7280]" : "text-[#0D1B2A]"}>{label}</span>
      <span className={muted ? "text-[#6B7280]" : "font-semibold text-[#0D1B2A]"}>{value}</span>
    </div>
  );
}

function Receipt({ sale, onNewSale }: { sale: CompletedSale; onNewSale: () => void }) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Sale complete</h1>
        <p className="text-sm mt-1 text-[#6B7280]">
          Reference <span className="font-semibold text-[#0D1B2A]">{sale.reference}</span>
          {sale.clientName ? ` · ${sale.clientName}` : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-[#E8E4DA] bg-white p-5 shadow-sm">
        <div className="divide-y divide-[#F0EEE6]">
          {sale.lines.map((l) => (
            <div key={l.lineId} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-[#0D1B2A]">
                {l.quantity} × {l.name}
              </span>
              <span className="font-medium text-[#0D1B2A]">{formatMoney(l.unitPrice * l.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-[#F0EEE6] space-y-1.5 text-sm">
          <Line label="Subtotal" value={formatMoney(sale.totals.subtotal)} />
          {sale.totals.discount > 0 && <Line label="Discount" value={`− ${formatMoney(sale.totals.discount)}`} muted />}
          <Line label={`Incl. GST (${Math.round(GST_RATE * 100)}%)`} value={formatMoney(sale.totals.taxAmount)} muted />
          {sale.totals.tip > 0 && <Line label="Tip" value={formatMoney(sale.totals.tip)} muted />}
          <div className="flex items-center justify-between pt-2 border-t border-[#F0EEE6]">
            <span className="font-bold text-[#0D1B2A]">Total paid ({CHECKOUT_PAYMENT_LABELS[sale.paymentMethod]})</span>
            <span className="text-lg font-bold text-[#0D1B2A]">{formatMoney(sale.totals.total)}</span>
          </div>
          {sale.cashReceived != null && (
            <>
              <Line label="Cash received" value={formatMoney(sale.cashReceived)} muted />
              <Line label="Change" value={formatMoney(sale.changeDue ?? 0)} muted />
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onNewSale}
        className="mt-5 w-full rounded-xl py-3 text-sm font-semibold bg-[#0D1B2A] text-white hover:bg-[#1B3163] transition-colors"
      >
        New sale
      </button>
    </div>
  );
}
