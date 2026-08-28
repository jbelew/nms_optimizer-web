import type { Cell } from "./gridTypes";
import { describe, expect, it } from "vitest";

import { validateToggleActive, validateToggleSupercharged } from "./gridRules";

describe("gridRules - validateToggleActive", () => {
	const defaultCell: Cell = {
		active: false,
		adjacency: "",
		adjacency_bonus: 0,
		bonus: 0,
		group_adjacent: false,
		image: null,
		label: "",
		module: null,
		sc_eligible: true,
		supercharged: false,
		tech: null,
		total: 0,
		type: "",
		value: 0,
	};

	it("returns valid: true for normal cells when grid is not fixed", () => {
		const result = validateToggleActive({
			cell: defaultCell,
			gridFixed: false,
		});
		expect(result).toEqual({ valid: true });
	});

	it("returns valid: false with reason: moduleLocked when cell has a module", () => {
		const result = validateToggleActive({
			cell: { ...defaultCell, module: "some-module" },
			gridFixed: false,
		});
		expect(result).toEqual({ reason: "moduleLocked", valid: false });
	});

	it("returns valid: false with reason: gridFixed when grid layout is fixed", () => {
		const result = validateToggleActive({
			cell: defaultCell,
			gridFixed: true,
		});
		expect(result).toEqual({ reason: "gridFixed", valid: false });
	});

	it("prioritizes moduleLocked over gridFixed", () => {
		const result = validateToggleActive({
			cell: { ...defaultCell, module: "some-module" },
			gridFixed: true,
		});
		expect(result).toEqual({ reason: "moduleLocked", valid: false });
	});
});

describe("gridRules - validateToggleSupercharged", () => {
	const defaultCell: Cell = {
		active: false,
		adjacency: "",
		adjacency_bonus: 0,
		bonus: 0,
		group_adjacent: false,
		image: null,
		label: "",
		module: null,
		sc_eligible: true,
		supercharged: false,
		tech: null,
		total: 0,
		type: "",
		value: 0,
	};

	it("returns valid: true for normal cells when constraints are not met", () => {
		const result = validateToggleSupercharged({
			cell: defaultCell,
			gridFixed: false,
			rowIndex: 0,
			superchargedFixed: false,
			totalSupercharged: 0,
		});
		expect(result).toEqual({ valid: true });
	});

	it("returns valid: false with reason: moduleLocked when cell has a module", () => {
		const result = validateToggleSupercharged({
			cell: { ...defaultCell, module: "some-module" },
			gridFixed: false,
			rowIndex: 0,
			superchargedFixed: false,
			totalSupercharged: 0,
		});
		expect(result).toEqual({ reason: "moduleLocked", valid: false });
	});

	it("returns valid: false with reason: gridFixed when grid is fixed", () => {
		const result = validateToggleSupercharged({
			cell: defaultCell,
			gridFixed: true,
			rowIndex: 0,
			superchargedFixed: false,
			totalSupercharged: 0,
		});
		expect(result).toEqual({ reason: "gridFixed", valid: false });
	});

	it("returns valid: false with reason: superchargedFixed when supercharged slots are fixed", () => {
		const result = validateToggleSupercharged({
			cell: defaultCell,
			gridFixed: false,
			rowIndex: 0,
			superchargedFixed: true,
			totalSupercharged: 0,
		});
		expect(result).toEqual({ reason: "superchargedFixed", valid: false });
	});

	it("returns valid: false with reason: rowLimit when rowIndex >= 4", () => {
		const result = validateToggleSupercharged({
			cell: defaultCell,
			gridFixed: false,
			rowIndex: 4,
			superchargedFixed: false,
			totalSupercharged: 0,
		});
		expect(result).toEqual({ reason: "rowLimit", valid: false });
	});

	it("returns valid: false with reason: superchargedLimit when totalSupercharged >= 4 and cell is not supercharged", () => {
		const result = validateToggleSupercharged({
			cell: defaultCell,
			gridFixed: false,
			rowIndex: 0,
			superchargedFixed: false,
			totalSupercharged: 4,
		});
		expect(result).toEqual({ reason: "superchargedLimit", valid: false });
	});

	it("returns valid: true when totalSupercharged >= 4 but cell is already supercharged (toggling off)", () => {
		const result = validateToggleSupercharged({
			cell: { ...defaultCell, supercharged: true },
			gridFixed: false,
			rowIndex: 0,
			superchargedFixed: false,
			totalSupercharged: 4,
		});
		expect(result).toEqual({ valid: true });
	});
});
