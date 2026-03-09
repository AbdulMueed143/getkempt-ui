"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthTokens } from "@/types/auth";

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;

  /* ── Computed ──────────────────────────── */
  isAuthenticated: boolean;

  /* ── Actions ───────────────────────────── */
  setUser: (user: User, tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      clearError: () => set({ error: null }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        }),
    }),
    {
      name: "gk-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
