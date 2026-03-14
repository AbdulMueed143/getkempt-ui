"use client";

import { useCallback } from "react";
import { useToastStore, type ToastVariant } from "@/store/toast-store";

interface ShowToastOptions {
  title:    string;
  message?: string;
  duration?: number;
}

/**
 * useToast — trigger themed notifications from any component.
 *
 * @example
 * const toast = useToast();
 * toast.success({ title: "Staff member added" });
 * toast.error({ title: "Something went wrong", message: "Please try again." });
 */
export function useToast() {
  const add = useToastStore((s) => s.add);

  const show = useCallback(
    (variant: ToastVariant, opts: ShowToastOptions) => {
      add({
        variant,
        title:    opts.title,
        message:  opts.message,
        duration: opts.duration ?? 4000,
      });
    },
    [add]
  );

  return {
    success: (opts: ShowToastOptions) => show("success", opts),
    error:   (opts: ShowToastOptions) => show("error",   opts),
    warning: (opts: ShowToastOptions) => show("warning", opts),
    info:    (opts: ShowToastOptions) => show("info",    opts),
  };
}
