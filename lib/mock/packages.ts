/**
 * Mock package data — mirrors what a real /api/packages endpoint would return.
 *
 * Service IDs reference MOCK_SERVICES (lib/mock/services.ts):
 *   svc1  Haircut          45m  $55   hair
 *   svc2  Hair Colouring  120m  $140  hair
 *   svc4  Blow Dry         45m  $50   hair
 *   svc5  Fade             30m  $45   barber
 *   svc6  Beard Trim       20m  $30   barber
 *   svc7  Hot Towel Shave  30m  $50   barber
 *   svc8  Classic Mani     45m  $45   nails
 *   svc9  Gel Mani         60m  $65   nails
 *   svc10 Classic Pedi     60m  $55   nails
 *   svc12 Lash Lift        75m  $95   lash_brow
 *   svc13 Brow Shaping     30m  $45   lash_brow
 *   svc14 Express Facial   30m  $65   beauty
 */

import type { Package } from "@/types/package";

export const MOCK_PACKAGES: Package[] = [
  {
    id: "pkg1",
    name: "The Full Barber",
    description:
      "The complete barber ritual — from a precision fade to a beard shape and classic hot towel shave. Walk in a man, leave a legend.",
    serviceIds:           ["svc5", "svc6", "svc7"],
    // Auto: 80 min · $125
    customDurationMinutes: null,
    discountEnabled:      true,
    discountType:         "fixed",
    discountValue:        10,
    // Final: $115  · Save $10 (8%)
    status:               "active",
    onlineBookingEnabled: true,
    staffIds:             ["s1"],
    createdAt:            "2024-02-01T09:00:00Z",
  },
  {
    id: "pkg2",
    name: "Colour & Style",
    description:
      "Full colour service followed by a professional blow-dry and style. Leave with a fresh look from root to tip.",
    serviceIds:           ["svc2", "svc4"],
    // Auto: 165 min · $190
    customDurationMinutes: 150,
    discountEnabled:      false,
    discountType:         null,
    discountValue:        null,
    // Final: $190 (no discount)
    status:               "active",
    onlineBookingEnabled: true,
    staffIds:             ["s2"],
    createdAt:            "2024-02-05T09:00:00Z",
  },
  {
    id: "pkg3",
    name: "Pamper Package",
    description:
      "Gel manicure, classic pedicure, and an express facial — because you deserve all of it.",
    serviceIds:           ["svc9", "svc10", "svc14"],
    // Auto: 150 min · $185
    customDurationMinutes: null,
    discountEnabled:      true,
    discountType:         "percentage",
    discountValue:        10,
    // Final: $166.50  · Save $18.50 (10%)
    status:               "active",
    onlineBookingEnabled: true,
    staffIds:             ["s3", "s4"],
    createdAt:            "2024-02-10T09:00:00Z",
  },
  {
    id: "pkg4",
    name: "Lash & Brow Duo",
    description:
      "Lash lift and tint paired with brow shaping and tint. The most impact in the least time.",
    serviceIds:           ["svc12", "svc13"],
    // Auto: 105 min · $140
    customDurationMinutes: null,
    discountEnabled:      true,
    discountType:         "fixed",
    discountValue:        15,
    // Final: $125  · Save $15 (10.7%)
    status:               "active",
    onlineBookingEnabled: true,
    staffIds:             ["s4"],
    createdAt:            "2024-02-14T09:00:00Z",
  },
  {
    id: "pkg5",
    name: "Haircut & Mani",
    description:
      "A fresh cut and a classic manicure — nails and hair sorted in one visit.",
    serviceIds:           ["svc1", "svc8"],
    // Auto: 90 min · $100
    customDurationMinutes: null,
    discountEnabled:      true,
    discountType:         "percentage",
    discountValue:        15,
    // Final: $85  · Save $15 (15%)
    status:               "inactive",
    onlineBookingEnabled: false,
    staffIds:             ["s1", "s3"],
    createdAt:            "2024-02-20T09:00:00Z",
  },
];
