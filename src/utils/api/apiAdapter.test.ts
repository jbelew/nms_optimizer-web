import { describe, expect, it } from "vitest";

import { camelToSnake, snakeToCamel } from "./apiAdapter";

describe("apiAdapter", () => {
	describe("camelToSnake", () => {
		it("should convert flat objects from camelCase to snake_case", () => {
			const input = {
				adjacencyBonus: 0.1,
				groupAdjacent: true,
				scEligible: false,
				solveMethod: "greedy",
			};
			const expected = {
				adjacency_bonus: 0.1,
				group_adjacent: true,
				sc_eligible: false,
				solve_method: "greedy",
			};
			expect(camelToSnake(input)).toEqual(expected);
		});

		it("should recursively convert nested objects and arrays", () => {
			const input = {
				anotherKey: "value",
				someKey: {
					nestedKey: [{ itemOne: 1, itemTwo: 2 }, { itemThree: 3 }],
				},
			};
			const expected = {
				another_key: "value",
				some_key: {
					nested_key: [{ item_one: 1, item_two: 2 }, { item_three: 3 }],
				},
			};
			expect(camelToSnake(input)).toEqual(expected);
		});

		it("should handle null and primitive types gracefully", () => {
			expect(camelToSnake(null)).toBeNull();
			expect(camelToSnake(undefined)).toBeUndefined();
			expect(camelToSnake(123)).toBe(123);
			expect(camelToSnake("string")).toBe("string");
			expect(camelToSnake(true)).toBe(true);
		});
	});

	describe("snakeToCamel", () => {
		it("should convert flat objects from snake_case to camelCase", () => {
			const input = {
				adjacency_bonus: 0.1,
				group_adjacent: true,
				sc_eligible: false,
				solve_method: "greedy",
			};
			const expected = {
				adjacencyBonus: 0.1,
				groupAdjacent: true,
				scEligible: false,
				solveMethod: "greedy",
			};
			expect(snakeToCamel(input)).toEqual(expected);
		});

		it("should recursively convert nested objects and arrays", () => {
			const input = {
				another_key: "value",
				some_key: {
					nested_key: [{ item_one: 1, item_two: 2 }, { item_three: 3 }],
				},
			};
			const expected = {
				anotherKey: "value",
				someKey: {
					nestedKey: [{ itemOne: 1, itemTwo: 2 }, { itemThree: 3 }],
				},
			};
			expect(snakeToCamel(input)).toEqual(expected);
		});

		it("should handle null and primitive types gracefully", () => {
			expect(snakeToCamel(null)).toBeNull();
			expect(snakeToCamel(undefined)).toBeUndefined();
			expect(snakeToCamel(123)).toBe(123);
			expect(snakeToCamel("string")).toBe("string");
			expect(snakeToCamel(true)).toBe(true);
		});
	});
});
