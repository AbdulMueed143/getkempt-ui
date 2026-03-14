export const ROUTES = {
  /* ── Auth ───────────────────── */
  LOGIN:            "/login",
  SIGNUP:           "/signup",
  FORGOT_PASSWORD:  "/forgot-password",
  RESET_PASSWORD:   "/reset-password",

  /* ── Dashboard (future) ─────── */
  DASHBOARD:        "/dashboard",
  BOOKINGS:         "/bookings",
  CLIENTS:          "/clients",
  SERVICES:         "/services",
  SETTINGS:         "/settings",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
