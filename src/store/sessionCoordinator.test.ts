import type { Grid } from "./grid/gridStore";
import { describe, expect, it, vi } from "vitest";

import { computeBonusStatus, sessionCoordinator } from "./sessionCoordinator";

const mockGridStore = {
	setBuildName: vi.fn(),
	setGrid: vi.fn(),
	setIsSharedGrid: vi.fn(),
	setResult: vi.fn(),
};

const mockTechStore = {
	clearResult: vi.fn(),
	clearTechGroups: vi.fn(),
};

const mockTechBonusStore = {
	clearAllBonusStatus: vi.fn(),
};

const mockModuleSelectionStore = {
	clearAllModuleSelections: vi.fn(),
};

const mockInteractionStore = {
	clearInteractionState: vi.fn(),
};

vi.mock("./grid/gridStore", () => ({
	useGridStore: {
		getState: vi.fn(() => mockGridStore),
	},
}));

vi.mock("./tech/techStore", () => ({
	useTechStore: {
		getState: vi.fn(() => mockTechStore),
	},
}));

vi.mock("./tech/techBonusStore", () => ({
	useTechBonusStore: {
		getState: vi.fn(() => mockTechBonusStore),
	},
}));

vi.mock("./tech/moduleSelectionStore", () => ({
	useModuleSelectionStore: {
		getState: vi.fn(() => mockModuleSelectionStore),
	},
}));

vi.mock("./grid/interactionStore", () => ({
	useInteractionStore: {
		getState: vi.fn(() => mockInteractionStore),
	},
}));

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

describe("sessionCoordinator", () => {
	it("switchPlatform resets the optimization result in gridStore", () => {
		const newGrid = { cells: [] } as unknown as Grid;

		sessionCoordinator.switchPlatform(newGrid);

		expect(mockGridStore.setGrid).toHaveBeenCalledWith(newGrid);
		expect(mockGridStore.setResult).toHaveBeenCalledWith(null);
		expect(mockGridStore.setIsSharedGrid).toHaveBeenCalledWith(false);
		expect(mockGridStore.setBuildName).toHaveBeenCalledWith(null);
	});
});
