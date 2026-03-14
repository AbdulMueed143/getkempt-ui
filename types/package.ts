import type { DiscountType } from "@/lib/utils/package-calculations";

export type { DiscountType };

export type PackageStatus = "active" | "inactive";

/**
 * A Package bundles ≥ 2 services into a single bookable item with
 * optional time and price overrides.
 *
 * Base duration and base price are ALWAYS derived from the selected
 * services at runtime — they are never stored on the record itself.
 */
export interface Package {
  id: string;

  /* Identity */
  name:        string;
  description: string;
  /** Optional cover image — data URL or CDN URL */
  image?:      string;

  /* Which services are included (requires ≥ 2) */
  serviceIds: string[];

  /* Optional duration override — null means "use sum of services" */
  customDurationMinutes: number | null;

  /* Discount — all three fields travel together */
  discountEnabled: boolean;
  discountType:    DiscountType | null;
  discountValue:   number | null;

  /* Availability */
  status:               PackageStatus;
  onlineBookingEnabled: boolean;

  /* Which staff members can deliver this package */
  staffIds: string[];

  createdAt: string;
}
