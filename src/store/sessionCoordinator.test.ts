import type { Grid } from "./grid/gridStore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { serialize } from "@/hooks/useGridDeserializer/gridSerializer";

import { computeBonusStatus, sessionCoordinator } from "./sessionCoordinator";

vi.mock("@/hooks/useGridDeserializer/gridSerializer", () => ({
	deserialize: vi.fn(),
	serialize: vi.fn(() => "serialized-grid"),
}));

const mockGridStore = {
	clearInteractionState: vi.fn(),
	grid: { cells: [], height: 6, width: 10 },
	gridFixed: true,
	initialGridDefinition: undefined,
	isSharedGrid: false,
	resetGrid: vi.fn(),
	resetGridTech: vi.fn(),
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
	clearBonusStatus: vi.fn(),
	clearResult: vi.fn(),
	clearTechGroups: vi.fn(),
	clearTechMaxBonus: vi.fn(),
	clearTechSolvedBonus: vi.fn(),
	clearTechSolveMethod: vi.fn(),
	maxBonus: { pulse: 100 },
	resetSession: vi.fn(),
	restoreTechState: vi.fn(),
	setTechColors: vi.fn(),
	solvedBonus: { pulse: 100 },
	solveMethod: { pulse: "pattern" },
};

const mockPlatformStoreState = {
	selectedPlatform: "test-platform",
	setSelectedPlatform: vi.fn(),
};

vi.mock("./grid/gridStore", () => ({
	createGrid: vi.fn(() => ({ cells: [], height: 6, width: 10 })),
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
		expect(computeBonusStatus(99.995)).toEqual({ icon: "check", percent: 0 });
		expect(computeBonusStatus(100.004)).toEqual({ icon: "check", percent: 0 });
		expect(computeBonusStatus(100.005)).toEqual({ icon: "lightning", percent: 0.01 });
		expect(computeBonusStatus(99.994)).toEqual({ icon: "warning", percent: 0.01 });
	});

	it("handles floating point precision issues", () => {
		expect(computeBonusStatus(100.01)).toEqual({ icon: "lightning", percent: 0.01 });
		expect(computeBonusStatus(99.99)).toEqual({ icon: "warning", percent: 0.01 });
	});
});

describe("sessionCoordinator", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGridStore.isSharedGrid = false;
		mockPlatformStoreState.selectedPlatform = "test-platform";
	});

	it("switchPlatform atomically updates platform, resets grid, clears tech state, and resets UI session", () => {
		const newGrid = { cells: [] } as unknown as Grid;

		sessionCoordinator.switchPlatform(
			"new-platform",
			["test-platform", "new-platform"],
			newGrid
		);

		expect(mockPlatformStoreState.setSelectedPlatform).toHaveBeenCalledWith("new-platform", [
			"test-platform",
			"new-platform",
		]);
		expect(mockGridStore.setGrid).toHaveBeenCalledWith(newGrid);
		expect(mockGridStore.setResult).toHaveBeenCalledWith(null);
		expect(mockGridStore.setIsSharedGrid).toHaveBeenCalledWith(false);
		expect(mockGridStore.setBuildName).toHaveBeenCalledWith(null);
		expect(mockUiStore.resetSession).toHaveBeenCalled();
	});

	it("resetTechnology atomically clears grid placement and bonus metrics for a technology category", () => {
		sessionCoordinator.resetTechnology("pulse");

		expect(mockGridStore.resetGridTech).toHaveBeenCalledWith("pulse");
		expect(mockTechStore.clearTechMaxBonus).toHaveBeenCalledWith("pulse");
		expect(mockTechStore.clearTechSolvedBonus).toHaveBeenCalledWith("pulse");
		expect(mockTechStore.clearBonusStatus).toHaveBeenCalledWith("pulse");
		expect(mockTechStore.clearTechSolveMethod).toHaveBeenCalledWith("pulse");
	});

	it("getShareUrl serializes current grid and platform into a shareable URL", () => {
		window.history.pushState({}, "", "/");
		vi.mocked(serialize).mockReturnValue("serialized-grid");

		const shareUrl = sessionCoordinator.getShareUrl();
		const parsed = new URL(shareUrl);

		expect(parsed.searchParams.get("platform")).toBe("test-platform");
		expect(parsed.searchParams.get("grid")).toBe("serialized-grid");
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
			const deserializeSpy = vi
				.spyOn(sessionCoordinator, "deserializeSharedGrid")
				.mockResolvedValue();

			sessionCoordinator.syncStateFromUrl({
				gridFromUrl: "serialized-grid",
				platformFromUrl: "new-platform",
				validShipTypes: ["old-platform", "new-platform"],
			});

			expect(mockPlatformStoreState.setSelectedPlatform).toHaveBeenCalledWith(
				"new-platform",
				["old-platform", "new-platform"]
			);
			expect(deserializeSpy).toHaveBeenCalledWith("serialized-grid");
			deserializeSpy.mockRestore();
		});

		it("should reset platform and grid when platform is changed without grid", () => {
			mockPlatformStoreState.selectedPlatform = "old-platform";
			const deserializeSpy = vi
				.spyOn(sessionCoordinator, "deserializeSharedGrid")
				.mockResolvedValue();
			const switchPlatformSpy = vi
				.spyOn(sessionCoordinator, "switchPlatform")
				.mockImplementation(() => {});

			sessionCoordinator.syncStateFromUrl({
				gridFromUrl: null,
				platformFromUrl: "new-platform",
				validShipTypes: ["old-platform", "new-platform"],
			});

			expect(switchPlatformSpy).toHaveBeenCalledWith("new-platform", [
				"old-platform",
				"new-platform",
			]);
			expect(deserializeSpy).not.toHaveBeenCalled();

			switchPlatformSpy.mockRestore();
			deserializeSpy.mockRestore();
		});

		it("should trigger resetSession when transitioning from a shared grid to a URL without grid param", () => {
			mockGridStore.isSharedGrid = true;
			const resetSessionSpy = vi
				.spyOn(sessionCoordinator, "resetSession")
				.mockImplementation(() => {});

			sessionCoordinator.syncStateFromUrl({
				gridFromUrl: null,
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
				gridFromUrl: null,
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
				gridFromUrl: null,
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

			expect(mockPlatformStoreState.setSelectedPlatform).toHaveBeenCalledWith("fighter", [
				"fighter",
				"shuttle",
			]);
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
