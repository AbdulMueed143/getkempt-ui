"use client";

import { create } from "zustand";

export type DialogVariant = "danger" | "warning" | "info";

export interface DialogConfig {
  variant:       DialogVariant;
  title:         string;
  message:       string;
  detail?:       string;          // secondary context beneath message
  confirmLabel?: string;          // defaults per variant
  cancelLabel?:  string;          // default: "Cancel"
  /** Icon override — pass a Lucide component name string; resolved in the UI */
  icon?:         string;
}

interface DialogStore {
  isOpen:   boolean;
  config:   DialogConfig | null;
  /* Internal resolver — set when show() is called */
  _resolve: ((value: boolean) => void) | null;

  /** Opens the dialog and returns a promise that resolves to true (confirm) or false (cancel) */
  show:    (config: DialogConfig) => Promise<boolean>;
  confirm: () => void;
  cancel:  () => void;
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  isOpen:   false,
  config:   null,
  _resolve: null,

  show: (config) =>
    new Promise<boolean>((resolve) => {
      set({ isOpen: true, config, _resolve: resolve });
    }),

  confirm: () => {
    get()._resolve?.(true);
    set({ isOpen: false, config: null, _resolve: null });
  },

  cancel: () => {
    get()._resolve?.(false);
    set({ isOpen: false, config: null, _resolve: null });
  },
}));
