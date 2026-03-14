"use client";

import { ToastContainer } from "@/components/ui/toast-container";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/**
 * AppProviders — renders global UI singletons.
 * Mount once in the root layout.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* ── Global overlays — rendered at the top of the z-stack ── */}
      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}
