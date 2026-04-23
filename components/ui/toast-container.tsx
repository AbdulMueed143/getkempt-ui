"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore, type Toast, type ToastVariant } from "@/store/toast-store";
import { cn } from "@/lib/utils/cn";

/* ── Variant config ──────────────────────────────── */
const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    icon:        typeof CheckCircle2;
    iconColor:   string;
    iconBg:      string;
    border:      string;
    bg:          string;
    titleColor:  string;
  }
> = {
  success: {
    icon:       CheckCircle2,
    iconColor:  "#16A34A",
    iconBg:     "#DCFCE7",
    border:     "#BBF7D0",
    bg:         "#F0FDF4",
    titleColor: "#14532D",
  },
  error: {
    icon:       XCircle,
    iconColor:  "#DC2626",
    iconBg:     "#FEE2E2",
    border:     "#FECACA",
    bg:         "#FEF2F2",
    titleColor: "#7F1D1D",
  },
  warning: {
    icon:       AlertTriangle,
    iconColor:  "#D97706",
    iconBg:     "#FEF3C7",
    border:     "#FDE68A",
    bg:         "#FFFBEB",
    titleColor: "#78350F",
  },
  info: {
    icon:       Info,
    iconColor:  "#1B3163",
    iconBg:     "#EEF1F8",
    border:     "#C7D2E8",
    bg:         "#F0F3FA",
    titleColor: "#1B3163",
  },
};

/* ── Container — renders all active toasts ──────── */
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none"
      style={{ maxWidth: 380 }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

/* ── Individual toast ────────────────────────────── */
function ToastItem({ toast }: { toast: Toast }) {
  const remove       = useToastStore((s) => s.remove);
  const config       = VARIANT_CONFIG[toast.variant];
  const Icon         = config.icon;
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => remove(toast.id), toast.duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, remove]);

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3.5",
        "shadow-lg animate-in slide-in-from-right-5 fade-in duration-200"
      )}
      style={{
        backgroundColor: config.bg,
        border:          `1px solid ${config.border}`,
        minWidth:        280,
      }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: config.iconBg }}
      >
        <Icon size={16} style={{ color: config.iconColor }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold leading-tight" style={{ color: config.titleColor }}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs mt-0.5 leading-snug" style={{ color: "#6B7A99" }}>
            {toast.message}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => remove(toast.id)}
        className="shrink-0 p-1 rounded-lg transition-opacity opacity-50 hover:opacity-100"
        style={{ color: "#6B7280" }}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
