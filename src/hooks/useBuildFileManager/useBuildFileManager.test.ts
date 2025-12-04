import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBuildFileManager } from "./useBuildFileManager";

// Mock dependencies
vi.mock("../../store/GridStore", () => ({
	useGridStore: {
		getState: vi.fn(() => ({
			grid: { cells: [], width: 0, height: 0 },
			result: null,
			isSharedGrid: false,
			gridFixed: false,
			superchargedFixed: false,
			initialGridDefinition: undefined,
		})),
		setState: vi.fn(),
	},
}));

vi.mock("../../store/TechStore", () => ({
	useTechStore: {
		getState: vi.fn(() => ({
			checkedModules: {},
			max_bonus: {},
			solved_bonus: {},
			solve_method: {},
		})),
		setState: vi.fn(),
	},
}));

vi.mock("../../store/TechBonusStore", () => ({
	useTechBonusStore: {
		getState: vi.fn(() => ({
			bonusStatus: {},
		})),
		setState: vi.fn(),
	},
}));

vi.mock("../../store/ModuleSelectionStore", () => ({
	useModuleSelectionStore: {
		getState: vi.fn(() => ({
			moduleSelections: {},
		})),
		setState: vi.fn(),
	},
}));

vi.mock("../../store/PlatformStore", () => {
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
		freighter: {},
		explorer: {},
		fighter: {},
		shuttle: {},
	}),
}));

vi.mock("../../utils/hashUtils", () => ({
	computeSHA256: vi.fn(async () => "abc123def456"),
}));

const createValidBuildFile = () => ({
	name: "Test Build",
	shipType: "freighter",
	timestamp: Date.now(),
	checksum: "abc123def456", // Mock checksum - tests will mock computeSHA256 to return this
	gridState: {
		grid: { cells: [], width: 0, height: 0 },
		result: null,
		isSharedGrid: false,
		gridFixed: false,
		superchargedFixed: false,
		initialGridDefinition: undefined,
	},
	techState: {
		checkedModules: {},
		max_bonus: {},
		solved_bonus: {},
		solve_method: {},
	},
	bonusState: {
		bonusStatus: {},
	},
	moduleState: {
		moduleSelections: {},
	},
});

describe("useBuildFileManager", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("loadBuildFromFile", () => {
		it("should reject build file with missing gridState", async () => {
			const { result } = renderHook(() => useBuildFileManager());

			const buildFileWithoutGridState = {
				name: "Test Build",
				shipType: "freighter",
				timestamp: Date.now(),
				checksum: "abc123def456",
				// Missing gridState
				techState: {},
				bonusState: {},
				moduleState: {},
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
