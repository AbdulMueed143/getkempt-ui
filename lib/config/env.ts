/**
 * Centralized, type-safe access to public environment variables.
 *
 * NOTE: This is a *static export* app (`output: "export"`), so every
 * `NEXT_PUBLIC_*` value is baked into the bundle at BUILD time. Switching
 * environments means rebuilding with different values — not reading them at
 * runtime. On Cloudflare Pages, set these per environment (Production vs
 * Preview) in Settings → Environment variables.
 */

export type AppEnv = "development" | "uat" | "production";

/** Which environment this build targets. Defaults to "development". */
export const APP_ENV: AppEnv =
  (process.env.NEXT_PUBLIC_APP_ENV as AppEnv | undefined) ?? "development";

/** Base URL of the Java backend API. */
export const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Google Maps Places API key (publishable, referrer-restricted). */
export const GOOGLE_MAPS_API_KEY: string =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export const isProduction = APP_ENV === "production";
export const isUat = APP_ENV === "uat";
export const isDevelopment = APP_ENV === "development";
