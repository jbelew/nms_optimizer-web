import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBuildFileManager } from "./useBuildFileManager";

// Mock dependencies
const mockRestoreGridState = vi.fn();
vi.mock("../../store/grid/gridStore", () => ({
	useGridStore: {
		getState: vi.fn(() => ({
			grid: { cells: [], height: 0, width: 0 },
			gridFixed: false,
			initialGridDefinition: undefined,
			isSharedGrid: false,
			restoreGridState: mockRestoreGridState,
			result: null,
			superchargedFixed: false,
		})),
		setState: vi.fn(),
	},
}));

vi.mock("../../store/tech/techStore", () => ({
	useTechStore: {
		getState: vi.fn(() => ({
			checkedModules: {},
			max_bonus: {},
			solve_method: {},
			solved_bonus: {},
		})),
		setState: vi.fn(),
	},
}));

vi.mock("../../store/tech/techBonusStore", () => ({
	useTechBonusStore: {
		getState: vi.fn(() => ({
			bonusStatus: {},
		})),
		setState: vi.fn(),
	},
}));

vi.mock("../../store/tech/moduleSelectionStore", () => ({
	useModuleSelectionStore: {
		getState: vi.fn(() => ({
			moduleSelections: {},
		})),
		setState: vi.fn(),
	},
}));

vi.mock("../../store/app/platformStore", () => {
	const usePlatformStoreMock = vi.fn((selector) => {
		const store = {
			selectedPlatform: "freighter",
			setSelectedPlatform: vi.fn(),
		};

		return typeof selector === "function" ? selector(store) : store;
	});

	return {
		usePlatformStore: usePlatformStoreMock,
	};
});

vi.mock("../useShipTypes/useShipTypes", () => ({
	useFetchShipTypesSuspense: () => ({
		explorer: {},
		fighter: {},
		freighter: {},
		shuttle: {},
	}),
}));

vi.mock("../../utils/system/hashUtils", () => ({
	computeSHA256: vi.fn(async () => "abc123def456"),
}));

/**
 *
 * @example
 */
const createValidBuildFile = () => ({
	bonusState: {
		bonusStatus: {},
	},
	checksum: "abc123def456", // Mock checksum - tests will mock computeSHA256 to return this
	gridState: {
		grid: { cells: [], height: 0, width: 0 },
		gridFixed: false,
		initialGridDefinition: undefined,
		isSharedGrid: false,
		result: null,
		superchargedFixed: false,
	},
	moduleState: {
		moduleSelections: {},
	},
	name: "Test Build",
	shipType: "freighter",
	techState: {
		checkedModules: {},
		max_bonus: {},
		solve_method: {},
		solved_bonus: {},
	},
	timestamp: Date.now(),
});

describe("useBuildFileManager", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("loadBuildFromFile", () => {
		it("should reject build file with missing gridState", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const buildFileWithoutGridState = {
				bonusState: {},
				checksum: "abc123def456",
				moduleState: {},
				name: "Test Build",
				shipType: "freighter",
				// Missing gridState
				techState: {},
				timestamp: Date.now(),
			};

			const file = new File([JSON.stringify(buildFileWithoutGridState)], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				/The build file couldn.*t be loaded/i
			);
		});

		it("should accept build file with all required state", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const buildFile = createValidBuildFile();

			const file = new File([JSON.stringify(buildFile)], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).resolves.not.toThrow();

			// Verify that restoreGridState was called with the correct data
			expect(mockRestoreGridState).toHaveBeenCalledWith({
				...buildFile.gridState,
				buildName: buildFile.name,
			});
		});

		it("should reject file with invalid JSON", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const file = new File(["{ invalid json }"], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				"File contains invalid JSON"
			);
		});

		it("should reject file with wrong extension", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const buildFile = createValidBuildFile();

			const file = new File([JSON.stringify(buildFile)], "test.txt", {
				type: "text/plain",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				"Invalid file type"
			);
		});

		it("should reject empty file", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const file = new File([], "test.nms", { type: "application/json" });

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow("File is empty");
		});

		it("should reject file that is too large", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			// Create a large file (11MB, exceeds 10MB limit)
			const largeData = new Array(11 * 1024 * 1024).fill("x").join("");
			const file = new File([largeData], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				"File is too large"
			);
		}, 10000);

		it("should reject build file with unsupported shipType", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const buildFileWithUnsupportedShip = {
				...createValidBuildFile(),
				shipType: "unsupported_ship",
			};

			const file = new File([JSON.stringify(buildFileWithUnsupportedShip)], "test.nms", {
				type: "application/json",
			});

			await expect(result.current.loadBuildFromFile(file)).rejects.toThrow(
				"Unsupported ship type"
			);
		});
	});
});
