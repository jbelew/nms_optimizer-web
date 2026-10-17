import type { WindowRules } from "@/types/tech";
import { describe, expect, test } from "vitest";

import { determineWindowDimensions, STANDARD_WINDOW_RULES } from "./windowDimensions";

describe("determineWindowDimensions", () => {
	test("returns null when module count is zero, negative, or non-finite", () => {
		expect(determineWindowDimensions(0, STANDARD_WINDOW_RULES)).toBeNull();
		expect(determineWindowDimensions(-1, STANDARD_WINDOW_RULES)).toBeNull();
		expect(determineWindowDimensions(Number.NaN, STANDARD_WINDOW_RULES)).toBeNull();
	});

	test("resolves matching dimensions for exact numeric threshold keys", () => {
		expect(determineWindowDimensions(1, STANDARD_WINDOW_RULES)).toEqual([1, 1]);
		expect(determineWindowDimensions(2, STANDARD_WINDOW_RULES)).toEqual([2, 1]);
		expect(determineWindowDimensions(4, STANDARD_WINDOW_RULES)).toEqual([2, 2]);
		expect(determineWindowDimensions(6, STANDARD_WINDOW_RULES)).toEqual([3, 2]);
		expect(determineWindowDimensions(9, STANDARD_WINDOW_RULES)).toEqual([3, 3]);
		expect(determineWindowDimensions(12, STANDARD_WINDOW_RULES)).toEqual([4, 3]);
	});

	test("falls back to nearest higher numeric threshold or default when exact key is absent", () => {
		expect(determineWindowDimensions(3, STANDARD_WINDOW_RULES)).toEqual([2, 2]);
		expect(determineWindowDimensions(5, STANDARD_WINDOW_RULES)).toEqual([3, 2]);
		expect(determineWindowDimensions(7, STANDARD_WINDOW_RULES)).toEqual([3, 3]);
		expect(determineWindowDimensions(8, STANDARD_WINDOW_RULES)).toEqual([3, 3]);
		expect(determineWindowDimensions(10, STANDARD_WINDOW_RULES)).toEqual([4, 3]);
		expect(determineWindowDimensions(11, STANDARD_WINDOW_RULES)).toEqual([4, 3]);
		expect(determineWindowDimensions(13, STANDARD_WINDOW_RULES)).toEqual([4, 4]);
	});

	test("respects custom technology window overrides such as Trails and Pulse Spitter", () => {
		const trailsRules: WindowRules = {
			"1": [1, 1],
			"2": [2, 1],
			"4": [2, 2],
			"5": [3, 3],
			"6": [3, 2],
			"8": [4, 3],
			default: [4, 3],
		};

		expect(determineWindowDimensions(5, trailsRules)).toEqual([3, 3]);
		expect(determineWindowDimensions(6, trailsRules)).toEqual([3, 2]);
		expect(determineWindowDimensions(7, trailsRules)).toEqual([4, 3]);
		expect(determineWindowDimensions(9, trailsRules)).toEqual([4, 3]);
	});

	test("escalates dimensions when resolved window area cannot physically fit module count", () => {
		const undersizedThresholdWithFittingDefault: WindowRules = {
			"6": [2, 2],
			default: [3, 3],
		};

		expect(determineWindowDimensions(6, undersizedThresholdWithFittingDefault)).toEqual([3, 3]);

		const pulseSpitterRules: WindowRules = {
			"1": [1, 1],
			"2": [2, 1],
			"4": [2, 2],
			"6": [3, 3],
			default: [3, 3],
		};

		expect(determineWindowDimensions(10, pulseSpitterRules)).toEqual([4, 3]);
		expect(determineWindowDimensions(13, pulseSpitterRules)).toEqual([4, 4]);

		const rulesWithoutDefault: WindowRules = {
			"2": [2, 1],
		};

		expect(determineWindowDimensions(5, rulesWithoutDefault)).toEqual([3, 2]);

		const largeDimensions = determineWindowDimensions(18, pulseSpitterRules);
		expect(largeDimensions).not.toBeNull();
		expect((largeDimensions?.[0] ?? 0) * (largeDimensions?.[1] ?? 0)).toBeGreaterThanOrEqual(
			18
		);
	});

	test("falls back to standard window rules when windowRules is undefined or empty", () => {
		expect(determineWindowDimensions(1)).toEqual([1, 1]);
		expect(determineWindowDimensions(5, undefined)).toEqual([3, 2]);
		expect(determineWindowDimensions(7, {})).toEqual([3, 3]);
	});
});
