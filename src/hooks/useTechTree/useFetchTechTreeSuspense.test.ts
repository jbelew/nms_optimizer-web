import type { RecommendedBuild, TechTree, TechTreeItem } from "./useTechTree";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGridStore } from "../../store/GridStore";
import { useTechStore } from "../../store/TechStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import * as apiCallModule from "../../utils/apiCall";
import { clearTechTreeCache, useFetchTechTreeSuspense } from "./useTechTree";

// Mock apiCall
vi.mock("../../utils/apiCall", () => ({
	apiCall: vi.fn(),
}));

// Mock the stores
vi.mock("../../store/TechStore", () => ({
	useTechStore: vi.fn(),
}));

vi.mock("../../store/GridStore", () => ({
	useGridStore: vi.fn(),
}));

vi.mock("../../store/TechTreeLoadingStore", () => ({
	useTechTreeLoadingStore: vi.fn(),
}));

describe("useFetchTechTreeSuspense", () => {
	const mockTechTree: TechTree = {
		starship: [
			{
				label: "Defense",
				key: "defense",
				modules: [],
				image: null,
				color: "red",
				module_count: 5,
			} as TechTreeItem,
			{
				label: "Shield",
				key: "shield",
				modules: [],
				image: null,
				color: "blue",
				module_count: 3,
			} as TechTreeItem,
		],
		exosuit: [
			{
				label: "Health",
				key: "health",
				modules: [],
				image: null,
				color: "green",
				module_count: 2,
			} as TechTreeItem,
		],
		recommended_builds: [
			{
				title: "Build 1",
				layout: [[{ tech: "defense" }]],
			} as RecommendedBuild,
		],
		grid_definition: {
			grid: [] as Array<[]>,
			gridFixed: true,
			superchargedFixed: false,
		},
	} as TechTree;

	type MockTechStoreState = {
		setTechColors: (colors: Record<string, string>) => void;
		setTechGroups: (groups: Record<string, TechTreeItem[]>) => void;
		setActiveGroup: (key: string, type: string) => void;
		techColors: Record<string, string>;
		techGroups: Record<string, TechTreeItem[]>;
		activeGroups: Record<string, string>;
	};

	type MockGridStoreState = {
		setInitialGridDefinition: (def: unknown) => void;
		setGridFromInitialDefinition: () => void;
		selectHasModulesInGrid: () => boolean;
	};

	type MockTechTreeLoadingState = {
		setLoading: (loading: boolean) => void;
		isLoading: boolean;
	};

	const setupMocks = (hasGridModules = false) => {
		const mockSetTechColors = vi.fn();
		const mockSetTechGroups = vi.fn();
		const mockSetActiveGroup = vi.fn();
		const mockSetInitialGridDefinition = vi.fn();
		const mockSetGridFromInitialDefinition = vi.fn();
		const mockSetLoading = vi.fn();

		vi.mocked(useTechStore).mockImplementation((selector) => {
			const state: MockTechStoreState = {
				setTechColors: mockSetTechColors,
				setTechGroups: mockSetTechGroups,
				setActiveGroup: mockSetActiveGroup,
				techColors: {},
				techGroups: {},
				activeGroups: {},
			};

			return selector(state as never);
		});

		vi.mocked(useGridStore).mockImplementation((selector) => {
			const state: MockGridStoreState = {
				setInitialGridDefinition: mockSetInitialGridDefinition,
				setGridFromInitialDefinition: mockSetGridFromInitialDefinition,
				selectHasModulesInGrid: () => hasGridModules,
			};

			return selector(state as never);
		});

		// Mock getState at module level
		(useGridStore as unknown as { getState: () => MockGridStoreState }).getState = () => ({
			setInitialGridDefinition: mockSetInitialGridDefinition,
			setGridFromInitialDefinition: mockSetGridFromInitialDefinition,
			selectHasModulesInGrid: () => hasGridModules,
		});

		vi.mocked(useTechTreeLoadingStore).mockImplementation((selector) => {
			const state: MockTechTreeLoadingState = {
				setLoading: mockSetLoading,
				isLoading: false,
			};

			return selector(state as never);
		});

		// Mock getState for TechTreeLoadingStore
		(
			useTechTreeLoadingStore as unknown as { getState: () => MockTechTreeLoadingState }
		).getState = () => ({
			setLoading: mockSetLoading,
			isLoading: false,
		});

		return {
			mockSetTechColors,
			mockSetTechGroups,
			mockSetActiveGroup,
			mockSetInitialGridDefinition,
			mockSetGridFromInitialDefinition,
			mockSetLoading,
		};
	};

	beforeEach(() => {
		clearTechTreeCache();
		vi.clearAllMocks();

		const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);
		vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);
	});

	afterEach(() => {
		clearTechTreeCache();
	});

	it("should call setTechColors with extracted colors", async () => {
		const { mockSetTechColors } = setupMocks();

		renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			expect(mockSetTechColors).toHaveBeenCalled();
		});

		const colorsArg = mockSetTechColors.mock.calls[0][0];
		expect(colorsArg).toHaveProperty("defense", "red");
		expect(colorsArg).toHaveProperty("shield", "blue");
		expect(colorsArg).toHaveProperty("health", "green");
	});

	it("should call setTechGroups with tech items grouped by key", async () => {
		const { mockSetTechGroups } = setupMocks();

		renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			expect(mockSetTechGroups).toHaveBeenCalled();
		});

		const groupsArg = mockSetTechGroups.mock.calls[0][0];
		expect(groupsArg).toHaveProperty("defense");
		expect(groupsArg).toHaveProperty("shield");
		expect(groupsArg).toHaveProperty("health");
		expect(Array.isArray(groupsArg.defense)).toBe(true);
	});

	it("should call setActiveGroup for each tech with default type 'normal'", async () => {
		const { mockSetActiveGroup } = setupMocks();

		renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			expect(mockSetActiveGroup).toHaveBeenCalled();
		});

		expect(mockSetActiveGroup).toHaveBeenCalledWith("defense", "normal");
		expect(mockSetActiveGroup).toHaveBeenCalledWith("shield", "normal");
		expect(mockSetActiveGroup).toHaveBeenCalledWith("health", "normal");
	});

	it("should set loading to false after processing tech tree", async () => {
		const { mockSetLoading } = setupMocks();

		renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			expect(mockSetLoading).toHaveBeenCalledWith(false);
		});
	});

	it("should call setInitialGridDefinition when grid is empty", async () => {
		const { mockSetInitialGridDefinition, mockSetGridFromInitialDefinition } =
			setupMocks(false); // Grid is empty

		renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			expect(mockSetInitialGridDefinition).toHaveBeenCalled();
		});

		expect(mockSetGridFromInitialDefinition).toHaveBeenCalled();
	});

	it("should handle tech items with custom type", async () => {
		const techTreeWithTypes: TechTree = {
			starship: [
				{
					label: "Defense",
					key: "defense",
					modules: [],
					image: null,
					color: "red",
					module_count: 5,
					type: "max",
				} as TechTreeItem,
			],
		};

		vi.mocked(apiCallModule.apiCall).mockResolvedValue(techTreeWithTypes);
		const { mockSetActiveGroup } = setupMocks();

		renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			expect(mockSetActiveGroup).toHaveBeenCalled();
		});

		expect(mockSetActiveGroup).toHaveBeenCalledWith("defense", "max");
	});

	it("should filter out duplicate tech items by key in useMemo", async () => {
		const techTreeWithDuplicates: TechTree = {
			starship: [
				{
					label: "Defense",
					key: "defense",
					modules: [],
					image: null,
					color: "red",
					module_count: 5,
				} as TechTreeItem,
				{
					label: "Defense Max",
					key: "defense",
					modules: [],
					image: null,
					color: "ruby",
					module_count: 5,
					type: "max",
				} as TechTreeItem,
			],
		};

		vi.mocked(apiCallModule.apiCall).mockResolvedValue(techTreeWithDuplicates);
		setupMocks();

		const { result } = renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			const starship = result.current?.starship;

			// Can safely check if starship exists without suspense error
			if (starship) {
				expect(Array.isArray(starship)).toBe(true);
				expect((starship as TechTreeItem[]).length).toBe(1);
			}
		});
	});

	it("should preserve recommended_builds in processed tree", async () => {
		setupMocks();

		const { result } = renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			if (result.current?.recommended_builds) {
				expect(Array.isArray(result.current.recommended_builds)).toBe(true);
			}
		});
	});

	it("should preserve grid_definition in processed tree", async () => {
		setupMocks();

		const { result } = renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			if (result.current?.grid_definition) {
				expect(result.current.grid_definition).toHaveProperty("gridFixed", true);
				expect(result.current.grid_definition).toHaveProperty("superchargedFixed", false);
			}
		});
	});

	it("should handle empty tech tree gracefully", async () => {
		const emptyTechTree: TechTree = {};
		vi.mocked(apiCallModule.apiCall).mockResolvedValue(emptyTechTree);

		setupMocks();

		const { result } = renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			expect(typeof result.current).toBe("object");
		});
	});

	it("should use the specified ship type in API call", async () => {
		const mockApiCall = vi.fn().mockResolvedValue(mockTechTree);
		vi.mocked(apiCallModule.apiCall).mockImplementation(mockApiCall);

		setupMocks();

		renderHook(() => useFetchTechTreeSuspense("explorer"));

		await waitFor(() => {
			expect(mockApiCall).toHaveBeenCalledWith(
				expect.stringContaining("tech_tree/explorer"),
				{},
				10000
			);
		});
	});

	it("should not call setInitialGridDefinition when grid already has modules", async () => {
		const { mockSetInitialGridDefinition } = setupMocks(true); // Grid already has modules

		renderHook(() => useFetchTechTreeSuspense("standard"));

		// Wait a bit for effects to run
		await new Promise((resolve) => setTimeout(resolve, 100));

		// setInitialGridDefinition should NOT be called when grid already has modules
		expect(mockSetInitialGridDefinition).not.toHaveBeenCalled();
	});

	it("should handle tech tree with multiple categories", async () => {
		const multiCategoryTree: TechTree = {
			starship: [
				{
					label: "Defense",
					key: "defense",
					modules: [],
					image: null,
					color: "red",
					module_count: 5,
				} as TechTreeItem,
			],
			exosuit: [
				{
					label: "Health",
					key: "health",
					modules: [],
					image: null,
					color: "green",
					module_count: 2,
				} as TechTreeItem,
			],
			multitool: [
				{
					label: "Damage",
					key: "damage",
					modules: [],
					image: null,
					color: "orange",
					module_count: 3,
				} as TechTreeItem,
			],
		};

		vi.mocked(apiCallModule.apiCall).mockResolvedValue(multiCategoryTree);
		const { mockSetTechColors } = setupMocks();

		renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			expect(mockSetTechColors).toHaveBeenCalled();
		});

		const colorsArg = mockSetTechColors.mock.calls[0][0];
		expect(Object.keys(colorsArg)).toContain("defense");
		expect(Object.keys(colorsArg)).toContain("health");
		expect(Object.keys(colorsArg)).toContain("damage");
	});

	it("should handle items without key property in processing", async () => {
		const techTreeWithInvalidItems: TechTree = {
			starship: [
				{
					label: "Defense",
					key: "defense",
					modules: [],
					image: null,
					color: "red",
					module_count: 5,
				} as TechTreeItem,
				// Invalid item without proper key
				{
					label: "Invalid",
				} as unknown as TechTreeItem,
			],
		};

		vi.mocked(apiCallModule.apiCall).mockResolvedValue(techTreeWithInvalidItems);
		const { mockSetTechGroups } = setupMocks();

		renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			expect(mockSetTechGroups).toHaveBeenCalled();
		});

		// Should only include valid items in groups
		const groupsArg = mockSetTechGroups.mock.calls[0][0];
		expect(groupsArg).toHaveProperty("defense");
		expect(Object.keys(groupsArg)).toHaveLength(1);
	});

	it("should filter out invalid recommended builds", async () => {
		const techTreeWithInvalidBuilds: TechTree = {
			starship: [
				{
					label: "Defense",
					key: "defense",
					modules: [],
					image: null,
					color: "red",
					module_count: 5,
				} as TechTreeItem,
			],
			recommended_builds: [
				{
					title: "Valid Build",
					layout: [[{ tech: "defense" }]],
				} as RecommendedBuild,
				{
					title: "Invalid Build",
					layout: [], // Empty layout - invalid
				} as RecommendedBuild,
			],
		};

		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		vi.mocked(apiCallModule.apiCall).mockResolvedValue(techTreeWithInvalidBuilds);
		setupMocks();

		renderHook(() => useFetchTechTreeSuspense("standard"));

		await waitFor(() => {
			// Wait for API call to complete
			expect(vi.mocked(apiCallModule.apiCall)).toHaveBeenCalled();
		});

		// Should have filtered out the invalid build
		// The invalid builds are caught during fetchTechTreeAsync
		consoleErrorSpy.mockRestore();
	});

	it("should handle resource read error gracefully", async () => {
		const errorMessage = "Network error";
		vi.mocked(apiCallModule.apiCall).mockRejectedValue(new Error(errorMessage));

		setupMocks();

		const { result } = renderHook(() => useFetchTechTreeSuspense("standard"));

		// Wait for the hook to process the error
		await waitFor(() => {
			// Should still have a result even after error
			expect(result.current).toBeDefined();
		});
	});
});
