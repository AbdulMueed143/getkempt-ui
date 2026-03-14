"use client";

import { useDialogStore, type DialogConfig } from "@/store/dialog-store";

/**
 * useConfirm — show a themed confirmation dialog and await the user's choice.
 *
 * Returns a function that resolves to `true` if confirmed, `false` if cancelled.
 *
 * @example
 * const confirm = useConfirm();
 *
 * const ok = await confirm({
 *   variant: "danger",
 *   title: "Delete staff member",
 *   message: "Alex Rivera will be permanently removed. This cannot be undone.",
 *   confirmLabel: "Yes, delete",
 * });
 *
 * if (ok) handleDelete(id);
 */
export function useConfirm() {
  return useDialogStore((s) => s.show);
}
