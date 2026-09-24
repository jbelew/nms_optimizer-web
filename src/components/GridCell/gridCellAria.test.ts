import type { Cell } from "@/store/grid/gridStore";
import { describe, expect, it } from "vitest";

import { getGridCellAriaLabel } from "./gridCellAria";

describe("getGridCellAriaLabel", () => {
	const mockTranslate = (key: string, options?: Record<string, unknown>) => {
		switch (key) {
			case "gridTable.cellAriaLabel":
				return `Row ${options?.row}, Column ${options?.col}: ${options?.content}`;
			case "gridTable.disabledSlot":
				return "Disabled Slot";
			case "gridTable.disabledSuperchargedSlot":
				return "Disabled Slot (Supercharged)";
			case "gridTable.emptySlot":
				return "Empty Slot";
			case "gridTable.superchargedSlot":
				return "Empty Slot (Supercharged)";
			case "gridTable.superchargedWithContent":
				return `${options?.content} (Supercharged)`;
			default:
				return (options?.defaultValue as string) ?? key;
		}
	};

	it("returns correct label for active empty cell", () => {
		const cell = {
			active: true,
			label: "",
			module: null,
			supercharged: false,
		} as Cell;

		const result = getGridCellAriaLabel(cell, 0, 0, mockTranslate);
		expect(result).toBe("Row 1, Column 1: Empty Slot");
	});

	it("returns correct label for active supercharged empty cell", () => {
		const cell = {
			active: true,
			label: "",
			module: null,
			supercharged: true,
		} as Cell;

		const result = getGridCellAriaLabel(cell, 1, 2, mockTranslate);
		expect(result).toBe("Row 2, Column 3: Empty Slot (Supercharged)");
	});

	it("returns correct label for active module cell without supercharged", () => {
		const cell = {
			active: true,
			label: "Deflector Shield",
			module: "shield-1",
			supercharged: false,
		} as Cell;

		const result = getGridCellAriaLabel(cell, 0, 4, mockTranslate);
		expect(result).toBe("Row 1, Column 5: Deflector Shield");
	});

	it("strips bracketed metadata from module label and appends supercharged tag", () => {
		const cell = {
			active: true,
			label: "Photon Cannon [Sigma] (Tech)",
			module: "photon-1",
			supercharged: true,
		} as Cell;

		const result = getGridCellAriaLabel(cell, 2, 3, mockTranslate);
		expect(result).toBe("Row 3, Column 4: Photon Cannon (Supercharged)");
	});

	it("returns correct label for inactive/disabled cell", () => {
		const cell = {
			active: false,
			label: "",
			module: null,
			supercharged: false,
		} as Cell;

		const result = getGridCellAriaLabel(cell, 4, 1, mockTranslate);
		expect(result).toBe("Row 5, Column 2: Disabled Slot");
	});

	it("returns correct label for inactive/disabled supercharged cell", () => {
		const cell = {
			active: false,
			label: "",
			module: null,
			supercharged: true,
		} as Cell;

		const result = getGridCellAriaLabel(cell, 5, 9, mockTranslate);
		expect(result).toBe("Row 6, Column 10: Disabled Slot (Supercharged)");
	});
});
