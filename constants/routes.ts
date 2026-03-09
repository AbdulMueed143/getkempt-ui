export const ROUTES = {
  /* ── Auth ───────────────────── */
  LOGIN:            "/login",
  SIGNUP:           "/signup",
  FORGOT_PASSWORD:  "/forgot-password",
  RESET_PASSWORD:   "/reset-password",

  /* ── Dashboard (future) ─────── */
  DASHBOARD:        "/dashboard/dashboard",
  BOOKINGS:         "/dashboard/bookings",
  CLIENTS:          "/dashboard/clients",
  SERVICES:         "/dashboard/services",
  SETTINGS:         "/dashboard/settings",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
