"use client";

import { useEffect } from "react";
import { Trash2, AlertTriangle, Info, X } from "lucide-react";
import { useDialogStore, type DialogVariant } from "@/store/dialog-store";
import { cn } from "@/lib/utils/cn";

/* ── Variant config ──────────────────────────────── */
const VARIANT_CONFIG: Record<
  DialogVariant,
  {
    icon:           typeof Trash2;
    iconColor:      string;
    iconBg:         string;
    confirmBg:      string;
    confirmHoverBg: string;
    confirmColor:   string;
    defaultLabel:   string;
  }
> = {
  danger: {
    icon:           Trash2,
    iconColor:      "#DC2626",
    iconBg:         "#FEE2E2",
    confirmBg:      "#DC2626",
    confirmHoverBg: "#B91C1C",
    confirmColor:   "#FFFFFF",
    defaultLabel:   "Delete",
  },
  warning: {
    icon:           AlertTriangle,
    iconColor:      "#D97706",
    iconBg:         "#FEF3C7",
    confirmBg:      "#D97706",
    confirmHoverBg: "#B45309",
    confirmColor:   "#FFFFFF",
    defaultLabel:   "Continue",
  },
  info: {
    icon:           Info,
    iconColor:      "#1B3163",
    iconBg:         "#EEF1F8",
    confirmBg:      "#1B3163",
    confirmHoverBg: "#142548",
    confirmColor:   "#FFFFFF",
    defaultLabel:   "Confirm",
  },
};

export function ConfirmDialog() {
  const { isOpen, config, confirm, cancel } = useDialogStore();

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, cancel]);

  if (!config) return null;

  const cfg          = VARIANT_CONFIG[config.variant];
  const Icon         = cfg.icon;
  const confirmLabel = config.confirmLabel ?? cfg.defaultLabel;
  const cancelLabel  = config.cancelLabel  ?? "Cancel";

  return (
    <>
      {/* ── Backdrop ──────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={cancel}
        aria-hidden="true"
      />

      {/* ── Dialog ────────────────────────────────── */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        className={cn(
          "fixed left-1/2 top-1/2 z-[60] w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2",
          "rounded-2xl bg-white shadow-2xl",
          "transition-all duration-200",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        style={{ border: "1px solid #E8ECF4" }}
      >
        {/* Close button */}
        <button
          onClick={cancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: "#8E95A5" }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: cfg.iconBg }}
          >
            <Icon size={22} style={{ color: cfg.iconColor }} />
          </div>

          {/* Title */}
          <h2
            id="dialog-title"
            className="text-lg font-bold mb-2"
            style={{ color: "#1B3163" }}
          >
            {config.title}
          </h2>

          {/* Message */}
          <p
            id="dialog-message"
            className="text-sm leading-relaxed"
            style={{ color: "#6B7A99" }}
          >
            {config.message}
          </p>

          {/* Optional detail */}
          {config.detail && (
            <p
              className="text-xs mt-2 leading-relaxed px-3 py-2 rounded-lg"
              style={{ backgroundColor: "#F8F9FC", color: "#8E95A5", border: "1px solid #E8ECF4" }}
            >
              {config.detail}
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: "1px solid #F0F3FA" }}
        >
          <button
            onClick={cancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: "#F0F3FA", color: "#1B3163", border: "1px solid #E8ECF4" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E8ECF4"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F0F3FA"; }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={confirm}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ backgroundColor: cfg.confirmBg, color: cfg.confirmColor }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = cfg.confirmHoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = cfg.confirmBg; }}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
