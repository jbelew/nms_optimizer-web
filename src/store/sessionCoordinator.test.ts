import type { Grid } from "./grid/gridStore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { computeBonusStatus, sessionCoordinator } from "./sessionCoordinator";

const mockGridStore = {
	clearInteractionState: vi.fn(),
	grid: { cells: [], height: 6, width: 10 },
	gridFixed: true,
	initialGridDefinition: undefined,
	isSharedGrid: false,
	resetGrid: vi.fn(),
	restoreGridState: vi.fn(),
	result: null,
	setBuildName: vi.fn(),
	setGrid: vi.fn(),
	setIsSharedGrid: vi.fn(),
	setResult: vi.fn(),
	superchargedFixed: false,
};

const mockTechStore = {
	bonusStatus: {},
	checkedModules: { pulse: ["core"] },
	clearAllBonusStatus: vi.fn(),
	clearAllCheckedModules: vi.fn(),
	clearAllModuleSelections: vi.fn(),
	clearResult: vi.fn(),
	clearTechGroups: vi.fn(),
	maxBonus: { pulse: 100 },
	resetSession: vi.fn(),
	restoreTechState: vi.fn(),
	solvedBonus: { pulse: 100 },
	solveMethod: { pulse: "pattern" },
};

const mockPlatformStoreState = {
	selectedPlatform: "test-platform",
	setSelectedPlatform: vi.fn(),
};

vi.mock("./grid/gridStore", () => ({
	createGrid: vi.fn(),
	useGridStore: {
		getState: vi.fn(() => mockGridStore),
	},
}));

vi.mock("./tech/techStore", () => ({
	useTechStore: {
		getState: vi.fn(() => mockTechStore),
	},
}));

vi.mock("./app/platformStore", () => ({
	usePlatformStore: {
		getState: () => mockPlatformStoreState,
	},
}));

const mockUiStore = {
	resetSession: vi.fn(),
};

vi.mock("./ui/uiStore", () => ({
	useUiStore: {
		getState: vi.fn(() => mockUiStore),
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
	beforeEach(() => {
		vi.clearAllMocks();
		mockGridStore.isSharedGrid = false;
	});

	it("switchPlatform resets the optimization result in gridStore", () => {
		const newGrid = { cells: [] } as unknown as Grid;

		sessionCoordinator.switchPlatform(newGrid);

		expect(mockGridStore.setGrid).toHaveBeenCalledWith(newGrid);
		expect(mockGridStore.setResult).toHaveBeenCalledWith(null);
		expect(mockGridStore.setIsSharedGrid).toHaveBeenCalledWith(false);
		expect(mockGridStore.setBuildName).toHaveBeenCalledWith(null);
	});

	it("resetSession resets stores and restores default checked modules rather than clearing them completely", () => {
		sessionCoordinator.resetSession();

		expect(mockGridStore.resetGrid).toHaveBeenCalled();
		expect(mockGridStore.clearInteractionState).not.toHaveBeenCalled();
		expect(mockTechStore.resetSession).toHaveBeenCalled();
		expect(mockTechStore.clearAllModuleSelections).not.toHaveBeenCalled();
		expect(mockUiStore.resetSession).toHaveBeenCalled();
	});

	describe("syncStateFromUrl", () => {
		it("should synchronize platform and deserialize grid when both are present", () => {
			mockPlatformStoreState.selectedPlatform = "old-platform";
			const mockDeserializeGrid = vi.fn();

			sessionCoordinator.syncStateFromUrl({
				deserializeGrid: mockDeserializeGrid,
				gridFromUrl: "serialized-grid",
				isKnownRoute: true,
				platformFromUrl: "new-platform",
				validShipTypes: ["old-platform", "new-platform"],
			});

			expect(mockPlatformStoreState.setSelectedPlatform).toHaveBeenCalledWith(
				"new-platform",
				["old-platform", "new-platform"],
				false,
				true
			);
			expect(mockDeserializeGrid).toHaveBeenCalledWith("serialized-grid");
		});

		it("should reset platform and grid when platform is changed without grid", () => {
			mockPlatformStoreState.selectedPlatform = "old-platform";
			const mockDeserializeGrid = vi.fn();
			const switchPlatformSpy = vi
				.spyOn(sessionCoordinator, "switchPlatform")
				.mockImplementation(() => {});

			sessionCoordinator.syncStateFromUrl({
				deserializeGrid: mockDeserializeGrid,
				gridFromUrl: null,
				isKnownRoute: true,
				platformFromUrl: "new-platform",
				validShipTypes: ["old-platform", "new-platform"],
			});

			expect(mockPlatformStoreState.setSelectedPlatform).toHaveBeenCalledWith(
				"new-platform",
				["old-platform", "new-platform"],
				false,
				true
			);
			expect(switchPlatformSpy).toHaveBeenCalled();
			expect(mockDeserializeGrid).not.toHaveBeenCalled();

			switchPlatformSpy.mockRestore();
		});

		it("should trigger resetSession when transitioning from a shared grid to a URL without grid param", () => {
			mockGridStore.isSharedGrid = true;
			const resetSessionSpy = vi
				.spyOn(sessionCoordinator, "resetSession")
				.mockImplementation(() => {});

			sessionCoordinator.syncStateFromUrl({
				deserializeGrid: vi.fn(),
				gridFromUrl: null,
				isKnownRoute: true,
				platformFromUrl: null,
				validShipTypes: ["test-platform"],
			});

			expect(resetSessionSpy).toHaveBeenCalled();
			resetSessionSpy.mockRestore();
		});

		it("should not trigger resetSession when URL has no grid param and workspace is not a shared grid", () => {
			mockGridStore.isSharedGrid = false;
			const resetSessionSpy = vi
				.spyOn(sessionCoordinator, "resetSession")
				.mockImplementation(() => {});

			sessionCoordinator.syncStateFromUrl({
				deserializeGrid: vi.fn(),
				gridFromUrl: null,
				isKnownRoute: true,
				platformFromUrl: null,
				validShipTypes: ["test-platform"],
			});

			expect(resetSessionSpy).not.toHaveBeenCalled();
			resetSessionSpy.mockRestore();
		});

		it("should trigger resetSession when transitioning from a shared grid to a different platform without grid param", () => {
			mockGridStore.isSharedGrid = true;
			mockPlatformStoreState.selectedPlatform = "old-platform";
			const resetSessionSpy = vi
				.spyOn(sessionCoordinator, "resetSession")
				.mockImplementation(() => {});

			sessionCoordinator.syncStateFromUrl({
				deserializeGrid: vi.fn(),
				gridFromUrl: null,
				isKnownRoute: true,
				platformFromUrl: "new-platform",
				validShipTypes: ["old-platform", "new-platform"],
			});

			expect(resetSessionSpy).toHaveBeenCalled();
			resetSessionSpy.mockRestore();
		});
	});

	describe("getBuildSnapshot & restoreBuildSnapshot", () => {
		it("captures a multi-store snapshot in getBuildSnapshot", () => {
			mockPlatformStoreState.selectedPlatform = "fighter";

			const snapshot = sessionCoordinator.getBuildSnapshot("My Fighter");

			expect(snapshot).toEqual({
				buildName: "My Fighter",
				gridState: {
					grid: mockGridStore.grid,
					gridFixed: true,
					initialGridDefinition: undefined,
					isSharedGrid: false,
					result: null,
					superchargedFixed: false,
				},
				shipType: "fighter",
				techState: {
					bonusStatus: {},
					checkedModules: { pulse: ["core"] },
					maxBonus: { pulse: 100 },
					solvedBonus: { pulse: 100 },
					solveMethod: { pulse: "pattern" },
				},
			});
		});

		it("restores platform, grid, and tech state in restoreBuildSnapshot", () => {
			mockPlatformStoreState.selectedPlatform = "shuttle";

			const buildFile = {
				bonusState: { bonusStatus: {} },
				checksum: "abc",
				gridState: {
					grid: { cells: [], height: 6, width: 10 },
					gridFixed: false,
					isSharedGrid: false,
					result: null,
					superchargedFixed: false,
				},
				moduleState: { moduleSelections: { pulse: ["core"] } },
				name: "Loaded Fighter",
				shipType: "fighter",
				techState: { checkedModules: { pulse: ["core"] } },
				timestamp: 123,
			};

			sessionCoordinator.restoreBuildSnapshot(buildFile, ["fighter", "shuttle"]);

			expect(mockPlatformStoreState.setSelectedPlatform).toHaveBeenCalledWith(
				"fighter",
				["fighter", "shuttle"],
				true,
				true
			);
			expect(mockGridStore.restoreGridState).toHaveBeenCalledWith({
				...buildFile.gridState,
				buildName: "Loaded Fighter",
			});
			expect(mockTechStore.restoreTechState).toHaveBeenCalledWith({
				bonusState: buildFile.bonusState,
				moduleState: buildFile.moduleState,
				techState: buildFile.techState,
			});
		});
	});
});
