import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildSerializer } from "./buildSerializer";

// Use vi.hoisted to declare mock functions and states that must be evaluated
// before the hoisted vi.mock factories run.
const {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockSetSelectedPlatform,
	mockSetTechState,
} = vi.hoisted(() => {
	const mockRestoreGridState = vi.fn();
	const mockGetGridState = vi.fn(() => ({
		grid: { cells: [], height: 0, width: 0 },
		gridFixed: false,
		initialGridDefinition: undefined,
		isSharedGrid: false,
		restoreGridState: mockRestoreGridState,
		result: null,
		superchargedFixed: false,
	}));

	const mockSetTechState = vi.fn();
	const mockGetTechState = vi.fn(() => ({
		bonusStatus: {},
		checkedModules: {},
		maxBonus: {},
		solvedBonus: {},
		solveMethod: {},
	}));

	const mockSetSelectedPlatform = vi.fn();
	const mockGetPlatformState = vi.fn(() => ({
		selectedPlatform: "freighter",
		setSelectedPlatform: mockSetSelectedPlatform,
	}));

	return {
		mockGetGridState,
		mockGetPlatformState,
		mockGetTechState,
		mockRestoreGridState,
		mockSetSelectedPlatform,
		mockSetTechState,
	};
});

vi.mock("@/store/grid/gridStore", () => {
	const mockStore = vi.fn((selector) => {
		const store = mockGetGridState();

		return typeof selector === "function" ? selector(store) : store;
	});
	Object.defineProperty(mockStore, "getState", {
		value: mockGetGridState,
		writable: true,
	});

	return {
		useGridStore: mockStore,
	};
});

vi.mock("@/store/tech/techStore", () => {
	const mockStore = vi.fn((selector) => {
		const store = mockGetTechState();

		return typeof selector === "function" ? selector(store) : store;
	});
	Object.defineProperty(mockStore, "getState", {
		value: mockGetTechState,
		writable: true,
	});
	Object.defineProperty(mockStore, "setState", {
		value: mockSetTechState,
		writable: true,
	});

	return {
		useTechStore: mockStore,
	};
});

vi.mock("@/store/app/platformStore", () => {
	const mockStore = vi.fn((selector) => {
		const store = mockGetPlatformState();

		return typeof selector === "function" ? selector(store) : store;
	});
	Object.defineProperty(mockStore, "getState", {
		value: mockGetPlatformState,
		writable: true,
	});

	return {
		usePlatformStore: mockStore,
	};
});

// Mock react's startTransition to run immediately/synchronously
vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof React>();

	return {
		...actual,
		startTransition: vi.fn((cb: () => void) => cb()),
	};
});

// Mock checksum to always return a stable value for testing
vi.mock("@/utils/system/hashUtils", () => ({
	computeSHA256: vi.fn(async () => "abc123def456"),
}));

const createValidBuildFile = () => ({
	bonusState: {
		bonusStatus: {},
	},
	checksum: "abc123def456",
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
		maxBonus: {},
		solvedBonus: {},
		solveMethod: {},
	},
	timestamp: Date.now(),
});

describe("buildSerializer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset store state getters to their default mock implementations
		mockGetGridState.mockImplementation(() => ({
			grid: { cells: [], height: 0, width: 0 },
			gridFixed: false,
			initialGridDefinition: undefined,
			isSharedGrid: false,
			restoreGridState: mockRestoreGridState,
			result: null,
			superchargedFixed: false,
		}));
		mockGetTechState.mockImplementation(() => ({
			bonusStatus: {},
			checkedModules: {},
			maxBonus: {},
			solvedBonus: {},
			solveMethod: {},
		}));
		mockGetPlatformState.mockImplementation(() => ({
			selectedPlatform: "freighter",
			setSelectedPlatform: mockSetSelectedPlatform,
		}));
	});

	describe("saveBuild", () => {
		it("should successfully serialize application state and return a Blob and filename", async () => {
			const result = await buildSerializer.saveBuild("My Special Build");

			expect(result.filename).toBe("My Special Build.nms");
			expect(result.blob).toBeInstanceOf(Blob);

			const text = await result.blob.text();
			const parsed = JSON.parse(text);

			expect(parsed.name).toBe("My Special Build");
			expect(parsed.checksum).toBe("abc123def456");
			expect(parsed.shipType).toBe("freighter");
			expect(parsed.gridState).toBeDefined();
			expect(parsed.techState).toBeDefined();
			expect(parsed.bonusState).toBeDefined();
			expect(parsed.moduleState).toBeDefined();
		});
	});

	describe("loadBuild", () => {
		it("should successfully parse and load a valid build configuration", async () => {
			const validBuild = createValidBuildFile();
			const file = new File([JSON.stringify(validBuild)], "test.nms", {
				type: "application/octet-stream",
			});

			await expect(
				buildSerializer.loadBuild(file, ["freighter", "fighter"])
			).resolves.not.toThrow();

			expect(mockRestoreGridState).toHaveBeenCalledWith({
				...validBuild.gridState,
				buildName: validBuild.name,
			});
			expect(mockSetTechState).toHaveBeenCalled();
			expect(mockSetSelectedPlatform).not.toHaveBeenCalled();
		});

		it("should throw an error if the file extension is not .nms", async () => {
			const validBuild = createValidBuildFile();
			const file = new File([JSON.stringify(validBuild)], "test.json", {
				type: "application/json",
			});

			await expect(buildSerializer.loadBuild(file, ["freighter"])).rejects.toThrow(
				"Invalid file type. Please select a .nms build file."
			);
		});

		it("should throw an error if the file exceeds 10MB limit", async () => {
			const chunk = "x".repeat(1024 * 1024); // 1MB
			const parts = Array.from({ length: 11 }, () => chunk); // 11MB
			const file = new File(parts, "large.nms", {
				type: "application/octet-stream",
			});

			await expect(buildSerializer.loadBuild(file, ["freighter"])).rejects.toThrow(
				"File is too large. Build files should be under 10MB."
			);
		});

		it("should throw an error if the file is empty", async () => {
			const file = new File([], "empty.nms", {
				type: "application/octet-stream",
			});

			await expect(buildSerializer.loadBuild(file, ["freighter"])).rejects.toThrow(
				"File is empty. Please select a valid build file."
			);
		});

		it("should throw an error if the file contains invalid JSON", async () => {
			const file = new File(["{ invalid json }"], "invalid.nms", {
				type: "application/octet-stream",
			});

			await expect(buildSerializer.loadBuild(file, ["freighter"])).rejects.toThrow(
				"File contains invalid JSON. The build file may be corrupted."
			);
		});

		it("should throw an error if the build file is missing required fields", async () => {
			const invalidBuild = {
				checksum: "abc123def456",
				name: "Incomplete Build",
				shipType: "freighter",
				timestamp: Date.now(),
				// missing gridState, techState, bonusState, moduleState
			};
			const file = new File([JSON.stringify(invalidBuild)], "incomplete.nms", {
				type: "application/octet-stream",
			});

			await expect(buildSerializer.loadBuild(file, ["freighter"])).rejects.toThrow(
				/The build file couldn.*t be loaded/i
			);
		});

		it("should throw an error if the checksum verification fails", async () => {
			const validBuild = {
				...createValidBuildFile(),
				checksum: "incorrect_checksum",
			};
			const file = new File([JSON.stringify(validBuild)], "badchecksum.nms", {
				type: "application/octet-stream",
			});

			await expect(buildSerializer.loadBuild(file, ["freighter"])).rejects.toThrow(
				"Build file integrity check failed. The file may have been corrupted or tampered with."
			);
		});

		it("should throw an error if the ship type is unsupported", async () => {
			const validBuild = {
				...createValidBuildFile(),
				shipType: "exotic",
			};
			const file = new File([JSON.stringify(validBuild)], "unsupported.nms", {
				type: "application/octet-stream",
			});

			await expect(buildSerializer.loadBuild(file, ["freighter", "fighter"])).rejects.toThrow(
				'Unsupported ship type: "exotic". Valid types are: freighter, fighter.'
			);
		});

		it("should call setSelectedPlatform if ship types mismatch", async () => {
			// Mock selectedPlatform as fighter, but build shipType is freighter
			mockGetPlatformState.mockImplementation(() => ({
				selectedPlatform: "fighter",
				setSelectedPlatform: mockSetSelectedPlatform,
			}));

			const validBuild = createValidBuildFile(); // has shipType: freighter
			const file = new File([JSON.stringify(validBuild)], "mismatch.nms", {
				type: "application/octet-stream",
			});

			await expect(
				buildSerializer.loadBuild(file, ["freighter", "fighter"])
			).resolves.not.toThrow();

			expect(mockSetSelectedPlatform).toHaveBeenCalledWith(
				"freighter",
				["freighter", "fighter"],
				true,
				true
			);
			expect(mockRestoreGridState).toHaveBeenCalled();
			expect(mockSetTechState).toHaveBeenCalled();
		});

		it("should round-trip saveBuild and loadBuild successfully", async () => {
			const saved = await buildSerializer.saveBuild("Roundtrip Build");
			const file = new File([saved.blob], saved.filename, {
				type: "application/octet-stream",
			});

			await expect(buildSerializer.loadBuild(file, ["freighter"])).resolves.not.toThrow();
			expect(mockRestoreGridState).toHaveBeenCalled();
			expect(mockSetTechState).toHaveBeenCalled();
		});
	});
});
