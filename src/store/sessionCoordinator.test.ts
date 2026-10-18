import { beforeEach, describe, expect, it, vi } from "vitest";

import { serialize } from "@/hooks/useGridDeserializer/gridSerializer";

import type { Grid } from "./grid/gridStore";
import { computeBonusStatus, sessionCoordinator } from "./sessionCoordinator";

vi.mock("@/hooks/useGridDeserializer/gridSerializer", () => ({
	deserialize: vi.fn(),
	serialize: vi.fn(() => "serialized-grid"),
}));

const mockGridStore = {
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

const mockPlatformStoreState: {
	isValidPlatform: (platform: null | string | undefined) => platform is string;
	platforms: null | Record<string, { label: string; type: string }>;
	selectedPlatform: string;
	setSelectedPlatform: ReturnType<typeof vi.fn>;
} = {
	isValidPlatform: (platform): platform is string =>
		typeof platform === "string"
		&& platform.length > 0
		&& (mockPlatformStoreState.platforms === null
			|| Object.prototype.hasOwnProperty.call(mockPlatformStoreState.platforms, platform)),
	platforms: {
		fighter: { label: "Fighter", type: "Starship" },
		"new-platform": { label: "New Platform", type: "Starship" },
		"old-platform": { label: "Old Platform", type: "Starship" },
		shuttle: { label: "Shuttle", type: "Starship" },
		"test-platform": { label: "Test Platform", type: "Starship" },
	},
	selectedPlatform: "test-platform",
	setSelectedPlatform: vi.fn(),
};

vi.mock("./grid/gridStore", () => {
	const createEmptyCell = vi.fn((supercharged = false, active = false) => ({
		active,
		adjacency: "none",
		adjacency_bonus: 0.0,
		bonus: 0,
		image: null,
		label: "",
		module: null,
		sc_eligible: false,
		supercharged,
		tech: null,
		total: 0,
		type: "",
		value: 0,
	}));

	return {
		createEmptyCell,
		createGrid: vi.fn((width = 10, height = 6) => ({
			cells: Array.from({ length: height }, () =>
				Array.from({ length: width }, () => createEmptyCell(false, false)),
			),
			height,
			width,
		})),
		resetCellContent: vi.fn((cell: Record<string, unknown>) => {
			Object.assign(cell, createEmptyCell(Boolean(cell.supercharged), Boolean(cell.active)));
		}),
		useGridStore: {
			getState: vi.fn(() => mockGridStore),
		},
	};
});

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

		sessionCoordinator.switchPlatform("new-platform", newGrid);

		expect(mockPlatformStoreState.setSelectedPlatform).toHaveBeenCalledWith("new-platform");
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
			});

			expect(mockPlatformStoreState.setSelectedPlatform).toHaveBeenCalledWith("new-platform");
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
			});

			expect(switchPlatformSpy).toHaveBeenCalledWith("new-platform");
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

			sessionCoordinator.restoreBuildSnapshot(buildFile);

			expect(mockPlatformStoreState.setSelectedPlatform).toHaveBeenCalledWith("fighter");
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

	describe("applyRecommendedBuild", () => {
		const mockTechTree = {
			Shield: [
				{
					color: "blue" as const,
					image: null,
					key: "shield",
					label: "Shield",
					module_count: 1,
					modules: [
						{
							active: true,
							adjacency: "none",
							adjacency_bonus: 0,
							bonus: 20,
							id: "X1",
							image: "img2.png",
							label: "X-Class",
							sc_eligible: false,
							supercharged: false,
							tech: "Shield",
							type: "shield",
							value: 2,
						},
					],
				},
			],
			Weapon: [
				{
					color: "red" as const,
					image: null,
					key: "weapon",
					label: "Boltcaster",
					module_count: 1,
					modules: [
						{
							active: true,
							adjacency: "none",
							adjacency_bonus: 0,
							bonus: 10,
							id: "S1",
							image: "img.png",
							label: "S-Class",
							sc_eligible: true,
							supercharged: false,
							tech: "Weapon",
							type: "weapon",
							value: 1,
						},
					],
				},
			],
		};

		it("applies a valid Recommended Build to the grid and preserves techStore selections/bonuses", () => {
			const applied = sessionCoordinator.applyRecommendedBuild(
				{
					layout: [
						[
							{
								active: true,
								adjacency_bonus: 1.0,
								module: "S1",
								supercharged: true,
								tech: "weapon",
							},
							null,
						],
						[
							{
								active: true,
								adjacency_bonus: 0.0,
								module: null,
								supercharged: false,
								tech: null,
							},
							{
								active: true,
								adjacency_bonus: 0.0,
								module: "X1",
								supercharged: false,
								tech: "shield",
							},
						],
					],
					title: "Test Build",
				},
				mockTechTree,
			);

			expect(applied).toBe(true);
			expect(mockGridStore.setGrid).toHaveBeenCalledTimes(1);
			const newGrid = mockGridStore.setGrid.mock.calls[0][0];
			expect(newGrid.cells[0][0]).toEqual(
				expect.objectContaining({
					active: true,
					adjacency_bonus: 1.0,
					bonus: 10,
					image: "img.png",
					label: "S-Class",
					module: "S1",
					sc_eligible: true,
					supercharged: true,
					tech: "weapon",
					type: "weapon",
					value: 1,
				}),
			);
			expect(newGrid.cells[0][1]).toEqual(
				expect.objectContaining({
					active: false,
					module: null,
					tech: null,
				}),
			);
			expect(newGrid.cells[1][0]).toEqual(
				expect.objectContaining({
					active: true,
					module: null,
					tech: null,
				}),
			);
			expect(newGrid.cells[1][1]).toEqual(
				expect.objectContaining({
					active: true,
					bonus: 20,
					image: "img2.png",
					label: "X-Class",
					module: "X1",
					tech: "shield",
				}),
			);
			expect(mockTechStore.clearAllModuleSelections).not.toHaveBeenCalled();
			expect(mockTechStore.clearAllBonusStatus).not.toHaveBeenCalled();
		});

		it("resets cell content when a module in layout is not found in techTree", () => {
			const applied = sessionCoordinator.applyRecommendedBuild(
				{
					layout: [
						[{ active: true, module: "missing", supercharged: false, tech: "unknown" }],
					],
					title: "Missing Module Build",
				},
				mockTechTree,
			);

			expect(applied).toBe(true);
			const newGrid = mockGridStore.setGrid.mock.calls[0][0];
			expect(newGrid.cells[0][0]).toEqual(
				expect.objectContaining({
					active: true,
					module: null,
					tech: null,
				}),
			);
		});

		it("returns false and does not update grid when layout is empty or build is invalid", () => {
			expect(
				sessionCoordinator.applyRecommendedBuild(
					{ layout: [], title: "Empty" },
					mockTechTree,
				),
			).toBe(false);
			expect(
				sessionCoordinator.applyRecommendedBuild(
					null as unknown as Parameters<
						typeof sessionCoordinator.applyRecommendedBuild
					>[0],
					mockTechTree,
				),
			).toBe(false);
			expect(mockGridStore.setGrid).not.toHaveBeenCalled();
		});
	});
});
