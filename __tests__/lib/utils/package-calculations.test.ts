import {
  calculateBasePrice,
  calculateBaseDuration,
  calculateFinalPrice,
  calculateSaving,
  formatDuration,
  formatPrice,
} from "@/lib/utils/package-calculations";

/* ─────────────────────────────────────────────────────── */
describe("calculateBasePrice", () => {
  it("returns 0 for an empty array", () => {
    expect(calculateBasePrice([])).toBe(0);
  });

  it("returns the price of a single service", () => {
    expect(calculateBasePrice([{ price: 55 }])).toBe(55);
  });

  it("sums the prices of multiple services", () => {
    const services = [{ price: 45 }, { price: 30 }, { price: 50 }];
    expect(calculateBasePrice(services)).toBe(125);
  });

  it("handles decimal prices correctly", () => {
    const services = [{ price: 19.99 }, { price: 10.01 }];
    expect(calculateBasePrice(services)).toBeCloseTo(30, 2);
  });
});

/* ─────────────────────────────────────────────────────── */
describe("calculateBaseDuration", () => {
  it("returns 0 for an empty array", () => {
    expect(calculateBaseDuration([])).toBe(0);
  });

  it("returns the duration of a single service", () => {
    expect(calculateBaseDuration([{ durationMinutes: 45 }])).toBe(45);
  });

  it("sums durations of multiple services", () => {
    const services = [
      { durationMinutes: 30 },
      { durationMinutes: 20 },
      { durationMinutes: 30 },
    ];
    expect(calculateBaseDuration(services)).toBe(80);
  });
});

/* ─────────────────────────────────────────────────────── */
describe("calculateFinalPrice", () => {
  describe("no discount", () => {
    it("returns base price when discountType is null", () => {
      expect(calculateFinalPrice(100, null, null)).toBe(100);
    });

    it("returns base price when discountType is undefined", () => {
      expect(calculateFinalPrice(100, undefined, null)).toBe(100);
    });

    it("returns base price when discountValue is null", () => {
      expect(calculateFinalPrice(100, "percentage", null)).toBe(100);
    });

    it("returns base price when discountValue is 0", () => {
      expect(calculateFinalPrice(100, "percentage", 0)).toBe(100);
    });

    it("returns base price when discountValue is negative", () => {
      expect(calculateFinalPrice(100, "fixed", -10)).toBe(100);
    });
  });

  describe("percentage discount", () => {
    it("applies a 10% discount", () => {
      expect(calculateFinalPrice(100, "percentage", 10)).toBe(90);
    });

    it("applies a 50% discount", () => {
      expect(calculateFinalPrice(200, "percentage", 50)).toBe(100);
    });

    it("applies a 100% discount (free)", () => {
      expect(calculateFinalPrice(100, "percentage", 100)).toBe(0);
    });

    it("caps a discount above 100% to 0 (never negative)", () => {
      expect(calculateFinalPrice(100, "percentage", 150)).toBe(0);
    });

    it("handles fractional percentages", () => {
      expect(calculateFinalPrice(185, "percentage", 10)).toBeCloseTo(166.5, 2);
    });
  });

  describe("fixed discount", () => {
    it("subtracts a flat dollar amount", () => {
      expect(calculateFinalPrice(125, "fixed", 10)).toBe(115);
    });

    it("returns 0 when discount equals base price", () => {
      expect(calculateFinalPrice(100, "fixed", 100)).toBe(0);
    });

    it("returns 0 when discount exceeds base price (never negative)", () => {
      expect(calculateFinalPrice(50, "fixed", 100)).toBe(0);
    });
  });
});

/* ─────────────────────────────────────────────────────── */
describe("calculateSaving", () => {
  it("returns zero saving when prices are equal", () => {
    const result = calculateSaving(100, 100);
    expect(result.amount).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("calculates saving amount correctly", () => {
    const result = calculateSaving(125, 115);
    expect(result.amount).toBe(10);
  });

  it("calculates saving percentage correctly", () => {
    const result = calculateSaving(200, 150);
    expect(result.percentage).toBe(25);
  });

  it("rounds amount to 2 decimal places", () => {
    const result = calculateSaving(185, 166.5);
    expect(result.amount).toBe(18.5);
  });

  it("rounds percentage to 1 decimal place", () => {
    // 125 → 115 = $10 saved = 8% (8.0%)
    const result = calculateSaving(125, 115);
    expect(result.percentage).toBe(8);
  });

  it("returns zero percentage when base is 0", () => {
    const result = calculateSaving(0, 0);
    expect(result.percentage).toBe(0);
  });

  it("never returns a negative saving amount", () => {
    // finalPrice > basePrice edge case
    const result = calculateSaving(50, 100);
    expect(result.amount).toBe(0);
  });
});

/* ─────────────────────────────────────────────────────── */
describe("formatDuration", () => {
  it("returns '0m' for 0 minutes", () => {
    expect(formatDuration(0)).toBe("0m");
  });

  it("returns '0m' for negative values", () => {
    expect(formatDuration(-5)).toBe("0m");
  });

  it("formats minutes only (under 60)", () => {
    expect(formatDuration(30)).toBe("30m");
    expect(formatDuration(45)).toBe("45m");
  });

  it("formats exactly 60 minutes as '1h'", () => {
    expect(formatDuration(60)).toBe("1h");
  });

  it("formats hours only when no remaining minutes", () => {
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(180)).toBe("3h");
  });

  it("formats hours and remaining minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(75)).toBe("1h 15m");
    expect(formatDuration(150)).toBe("2h 30m");
  });

  it("formats values larger than 3 hours correctly", () => {
    expect(formatDuration(240)).toBe("4h");
    expect(formatDuration(270)).toBe("4h 30m");
  });
});

/* ─────────────────────────────────────────────────────── */
describe("formatPrice", () => {
  it("formats whole numbers with 2 decimal places", () => {
    expect(formatPrice(50)).toBe("50.00");
    expect(formatPrice(100)).toBe("100.00");
  });

  it("pads a single decimal place", () => {
    expect(formatPrice(9.9)).toBe("9.90");
  });

  it("keeps 2 decimal places unchanged", () => {
    expect(formatPrice(19.99)).toBe("19.99");
  });

  it("formats 0 correctly", () => {
    expect(formatPrice(0)).toBe("0.00");
  });
});
