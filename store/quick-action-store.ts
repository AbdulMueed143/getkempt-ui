import { create } from "zustand";

/**
 * Carries a short-lived "open this slideover" signal from the dashboard
 * quick-action buttons to the destination page.
 *
 * Flow:
 *   1. User clicks a quick-action button on the dashboard.
 *   2. `trigger(action)` is called and the router navigates to the target page.
 *   3. The target page client reads `pendingAction` in a useEffect on first
 *      render, opens its slideover, then calls `clear()`.
 */
export type QuickActionTarget = "booking" | "staff" | "service";

interface QuickActionStore {
  pendingAction: QuickActionTarget | null;
  trigger: (action: QuickActionTarget) => void;
  clear:   () => void;
}

export const useQuickActionStore = create<QuickActionStore>((set) => ({
  pendingAction: null,
  trigger: (action) => set({ pendingAction: action }),
  clear:   ()       => set({ pendingAction: null }),
}));
