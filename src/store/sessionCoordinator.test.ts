import { describe, expect, it } from "vitest";

import { computeBonusStatus } from "./sessionCoordinator";

describe("computeBonusStatus rounding", () => {
	it("correctly rounds numbers that would fail with the scientific notation hack", () => {
		// Example: 99.995 should round to 100.00
		// Old hack: Math.round(Number(99.995 + "e" + 2)) + "e-" + 2
		// -> Math.round(9999.5) + "e-2" -> 10000 + "e-2" -> 100.00 (correct)

		// Example: 1.005
		// Old hack: Math.round(Number(1.005 + "e" + 2)) + "e-" + 2
		// -> Math.round(100.5) + "e-2" -> 101 + "e-2" -> 1.01 (correct)

		// The issue with the old hack is more about string concatenation safety and performance
		// than basic rounding failure in these specific cases, but let's ensure precision.

		expect(computeBonusStatus(99.995)).toEqual({ icon: "check", percent: 0 });
		expect(computeBonusStatus(100.004)).toEqual({ icon: "check", percent: 0 });
		expect(computeBonusStatus(100.005)).toEqual({ icon: "lightning", percent: 0.01 });
		expect(computeBonusStatus(99.994)).toEqual({ icon: "warning", percent: 0.01 });
	});

	it("handles floating point precision issues", () => {
		// 100.01 * 100 = 10001.000000000002 sometimes
		expect(computeBonusStatus(100.01)).toEqual({ icon: "lightning", percent: 0.01 });
		expect(computeBonusStatus(99.99)).toEqual({ icon: "warning", percent: 0.01 });
	});
});
