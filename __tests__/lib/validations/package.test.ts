import { packageSchema } from "@/lib/validations/package";

/* ── Shared fixture ─────────────────────────────────────── */
const VALID_PACKAGE = {
  name:                  "The Full Barber",
  description:           "Fade, beard trim, hot towel shave.",
  serviceIds:            ["svc5", "svc6", "svc7"],
  customDurationMinutes: null,
  discountEnabled:       false,
  discountType:          null as null,
  discountValue:         null as null,
  status:                "active"  as const,
  onlineBookingEnabled:  true,
  staffIds:              ["s1"],
};

/* ─────────────────────────────────────────────────────────── */
describe("packageSchema — valid data", () => {
  it("accepts a minimal valid package (no discount, no overrides)", () => {
    const result = packageSchema.safeParse(VALID_PACKAGE);
    expect(result.success).toBe(true);
  });

  it("accepts a package with a percentage discount", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      discountEnabled: true,
      discountType:    "percentage",
      discountValue:   10,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a package with a fixed discount", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      discountEnabled: true,
      discountType:    "fixed",
      discountValue:   15,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a package with a duration override", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      customDurationMinutes: 75,
    });
    expect(result.success).toBe(true);
  });

  it("accepts exactly 2 services (minimum)", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      serviceIds: ["svc1", "svc2"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts an inactive package with online booking disabled", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      status:               "inactive",
      onlineBookingEnabled: false,
    });
    expect(result.success).toBe(true);
  });
});

/* ─────────────────────────────────────────────────────────── */
describe("packageSchema — name validation", () => {
  it("rejects an empty name", () => {
    const result = packageSchema.safeParse({ ...VALID_PACKAGE, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path[0] === "name");
      expect(nameError).toBeDefined();
    }
  });

  it("rejects a name longer than 80 characters", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      name: "a".repeat(81),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path[0] === "name");
      expect(nameError).toBeDefined();
    }
  });

  it("accepts a name exactly 80 characters long", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      name: "a".repeat(80),
    });
    expect(result.success).toBe(true);
  });
});

/* ─────────────────────────────────────────────────────────── */
describe("packageSchema — serviceIds validation", () => {
  it("rejects an empty serviceIds array", () => {
    const result = packageSchema.safeParse({ ...VALID_PACKAGE, serviceIds: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === "serviceIds");
      expect(err).toBeDefined();
    }
  });

  it("rejects a single service (minimum is 2)", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      serviceIds: ["svc1"],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === "serviceIds");
      expect(err).toBeDefined();
    }
  });

  it("accepts 3 or more services", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      serviceIds: ["svc1", "svc2", "svc3"],
    });
    expect(result.success).toBe(true);
  });
});

/* ─────────────────────────────────────────────────────────── */
describe("packageSchema — discount validation", () => {
  it("rejects when discountEnabled is true but discountValue is null", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      discountEnabled: true,
      discountType:    "percentage",
      discountValue:   null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === "discountValue");
      expect(err).toBeDefined();
    }
  });

  it("rejects when discountEnabled is true but discountValue is 0", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      discountEnabled: true,
      discountType:    "fixed",
      discountValue:   0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects when discountEnabled is true but discountType is null", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      discountEnabled: true,
      discountType:    null,
      discountValue:   10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a percentage discount greater than 100%", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      discountEnabled: true,
      discountType:    "percentage",
      discountValue:   110,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === "discountValue");
      expect(err?.message).toMatch(/100%/);
    }
  });

  it("accepts a percentage discount of exactly 100%", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      discountEnabled: true,
      discountType:    "percentage",
      discountValue:   100,
    });
    expect(result.success).toBe(true);
  });

  it("allows discountType and discountValue to be null when discount is disabled", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      discountEnabled: false,
      discountType:    null,
      discountValue:   null,
    });
    expect(result.success).toBe(true);
  });
});

/* ─────────────────────────────────────────────────────────── */
describe("packageSchema — description validation", () => {
  it("accepts an empty description", () => {
    const result = packageSchema.safeParse({ ...VALID_PACKAGE, description: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a description over 500 characters", () => {
    const result = packageSchema.safeParse({
      ...VALID_PACKAGE,
      description: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
