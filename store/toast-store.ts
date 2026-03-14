"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id:       string;
  variant:  ToastVariant;
  title:    string;
  message?: string;
  duration: number;      // ms before auto-dismiss
}

interface ToastStore {
  toasts: Toast[];
  add:    (toast: Omit<Toast, "id">) => string;
  remove: (id: string) => void;
  clear:  () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },

  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}));
