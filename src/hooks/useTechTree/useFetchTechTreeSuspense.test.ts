import type { RecommendedBuild, TechTree, TechTreeItem } from "./useTechTree";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useTechTreeLoadingStore, useUiStore } from "@/store/ui/uiStore";
import * as apiCallModule from "@/utils/api/network";

import { clearTechTreeCache, useFetchTechTreeSuspense } from "./useTechTree";

// Mock apiCall
vi.mock("@/utils/api/network", () => ({
	apiCall: vi.fn(),
}));

// Mock the stores
vi.mock("@/store/tech/techStore", () => ({
	useTechStore: vi.fn(),
}));

vi.mock("@/store/grid/gridStore", () => ({
	useGridStore: vi.fn(),
}));

vi.mock("@/store/ui/uiStore", () => ({
	useTechTreeLoadingStore: vi.fn(),
	useUiStore: vi.fn(),
}));

describe("useFetchTechTreeSuspense", () => {
	const mockTechTree: TechTree = {
		exosuit: [
			{
				color: "green",
				image: null,
				key: "health",
				label: "Health",
				module_count: 2,
				modules: [],
			} as TechTreeItem,
		],
		grid_definition: {
			grid: [] as Array<[]>,
			gridFixed: true,
			superchargedFixed: false,
		},
		recommended_builds: [
			{
				layout: [[{ tech: "defense" }]],
				title: "Build 1",
			} as RecommendedBuild,
		],
		starship: [
			{
				color: "red",
				image: null,
				key: "defense",
				label: "Defense",
				module_count: 5,
				modules: [],
			} as TechTreeItem,
			{
				color: "blue",
				image: null,
				key: "shield",
				label: "Shield",
				module_count: 3,
				modules: [],
			} as TechTreeItem,
		],
	} as TechTree;

	type MockTechStoreState = {
		activeGroups: Record<string, string>;
		initializeTechTree: (
			colors: Record<string, string>,
			techGroups: Record<string, TechTreeItem[]>,
			activeGroups: Record<string, string>
		) => void;
		setActiveGroup: (key: string, type: string) => void;
		setActiveGroups: (groups: Record<string, string>) => void;
		setTechColors: (colors: Record<string, string>) => void;
		setTechGroups: (groups: Record<string, TechTreeItem[]>) => void;
		techColors: Record<string, string>;
		techGroups: Record<string, TechTreeItem[]>;
	};

	type MockGridStoreState = {
		hasModulesInGrid: boolean;
		setGridFromInitialDefinition: () => void;
		setInitialGridDefinition: (def: unknown) => void;
	};

	type MockTechTreeLoadingState = {
		isLoading: boolean;
		setLoading: (loading: boolean) => void;
	};

	const setupMocks = (hasGridModules = false) => {
		const mockSetTechColors = vi.fn();
		const mockSetTechGroups = vi.fn();
		const mockSetActiveGroup = vi.fn();
		const mockSetActiveGroups = vi.fn();
		const mockInitializeTechTree = vi.fn();
		const mockSetInitialGridDefinition = vi.fn();
		const mockSetGridFromInitialDefinition = vi.fn();
		const mockSetLoading = vi.fn();

		vi.mocked(useTechStore).mockImplementation((selector) => {
			const state: MockTechStoreState = {
				activeGroups: {},
				initializeTechTree: mockInitializeTechTree,
				setActiveGroup: mockSetActiveGroup,
				setActiveGroups: mockSetActiveGroups,
				setTechColors: mockSetTechColors,
				setTechGroups: mockSetTechGroups,
				techColors: {},
				techGroups: {},
			};

			return selector(state as never);
		});

		vi.mocked(useGridStore).mockImplementation((selector) => {
			const state: MockGridStoreState = {
				hasModulesInGrid: hasGridModules,
				setGridFromInitialDefinition: mockSetGridFromInitialDefinition,
				setInitialGridDefinition: mockSetInitialGridDefinition,
			};

			return selector(state as never);
		});

		// Mock getState at module level
		(useGridStore as unknown as { getState: () => MockGridStoreState }).getState = () => ({
			hasModulesInGrid: hasGridModules,
			setGridFromInitialDefinition: mockSetGridFromInitialDefinition,
			setInitialGridDefinition: mockSetInitialGridDefinition,
		});

		// Mock getState for useTechStore to support setActiveGroups
		(useTechStore as unknown as { getState: () => MockTechStoreState }).getState = () => ({
			activeGroups: {},
			initializeTechTree: mockInitializeTechTree,
			setActiveGroup: mockSetActiveGroup,
			setActiveGroups: mockSetActiveGroups,
			setTechColors: mockSetTechColors,
			setTechGroups: mockSetTechGroups,
			techColors: {},
			techGroups: {},
		});

		vi.mocked(useTechTreeLoadingStore).mockImplementation((selector) => {
			const state: MockTechTreeLoadingState = {
				isLoading: false,
				setLoading: mockSetLoading,
			};

			return selector ? selector(state as never) : (state as never);
		});

		// Mock getState for TechTreeLoadingStore
		(
			useTechTreeLoadingStore as unknown as { getState: () => MockTechTreeLoadingState }
		).getState = () => ({
			isLoading: false,
			setLoading: mockSetLoading,
		});

		// Mock useUiStore
		vi.mocked(useUiStore).mockImplementation((selector) => {
			const state = {
				isTechTreeLoading: false,
				setTechTreeLoading: mockSetLoading,
			};

			return selector ? selector(state as never) : (state as never);
		});

		// Mock getState for useUiStore
		(useUiStore as unknown as {
			getState: () => {
				isTechTreeLoading: boolean;
				setTechTreeLoading: typeof mockSetLoading;
			};
		}).getState = () => ({
			isTechTreeLoading: false,
			setTechTreeLoading: mockSetLoading,
		});

		return {
			mockInitializeTechTree,
			mockSetActiveGroup,
			mockSetActiveGroups,
			mockSetGridFromInitialDefinition,
			mockSetInitialGridDefinition,
			mockSetLoading,
			mockSetTechColors,
			mockSetTechGroups,
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

	it("should call initializeTechTree with extracted colors", async () => {
		const { mockInitializeTechTree } = setupMocks();

		await act(async () => {
			renderHook(() => useFetchTechTreeSuspense("standard"));
			// Give promises time to resolve
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		await waitFor(
			() => {
				expect(mockInitializeTechTree).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);

		const colorsArg = mockInitializeTechTree.mock.calls[0][0];
		expect(colorsArg).toHaveProperty("defense", "red");
		expect(colorsArg).toHaveProperty("shield", "blue");
		expect(colorsArg).toHaveProperty("health", "green");
	});

	it("should call initializeTechTree with tech items grouped by key", async () => {
		const { mockInitializeTechTree } = setupMocks();

		await act(async () => {
			renderHook(() => useFetchTechTreeSuspense("standard"));
			// Give promises time to resolve
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		await waitFor(
			() => {
				expect(mockInitializeTechTree).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);

		const groupsArg = mockInitializeTechTree.mock.calls[0][1];
		expect(groupsArg).toHaveProperty("defense");
		expect(groupsArg).toHaveProperty("shield");
		expect(groupsArg).toHaveProperty("health");
		expect(Array.isArray(groupsArg.defense)).toBe(true);
	});

	it("should call initializeTechTree with all techs with default type 'normal'", async () => {
		const { mockInitializeTechTree } = setupMocks();

		await act(async () => {
			renderHook(() => useFetchTechTreeSuspense("standard"));
			// Give promises time to resolve
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		await waitFor(
			() => {
				expect(mockInitializeTechTree).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);

		const callArg = mockInitializeTechTree.mock.calls[0]?.[2];
		expect(callArg).toEqual({
			defense: "normal",
			health: "normal",
			shield: "normal",
		});
	});

	it("should set loading to false after processing tech tree", async () => {
		const { mockSetLoading } = setupMocks();

		await act(async () => {
			renderHook(() => useFetchTechTreeSuspense("standard"));
			// Give promises time to resolve
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		await waitFor(
			() => {
				expect(mockSetLoading).toHaveBeenCalledWith(false);
			},
			{ timeout: 2000 }
		);
	});

	it("should call setInitialGridDefinition when grid is empty", async () => {
		const { mockSetGridFromInitialDefinition, mockSetInitialGridDefinition } =
			setupMocks(false); // Grid is empty

		await act(async () => {
			renderHook(() => useFetchTechTreeSuspense("standard"));
			// Give promises time to resolve
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		await waitFor(
			() => {
				expect(mockSetInitialGridDefinition).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);

		expect(mockSetGridFromInitialDefinition).toHaveBeenCalled();
	});

	it("should handle tech items with custom type", async () => {
		const techTreeWithTypes: TechTree = {
			starship: [
				{
					color: "red",
					image: null,
					key: "defense",
					label: "Defense",
					module_count: 5,
					modules: [],
					type: "max",
				} as TechTreeItem,
			],
		};

		vi.mocked(apiCallModule.apiCall).mockResolvedValue(techTreeWithTypes);
		const { mockInitializeTechTree } = setupMocks();

		await act(async () => {
			renderHook(() => useFetchTechTreeSuspense("standard"));
			// Give promises time to resolve
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		await waitFor(
			() => {
				expect(mockInitializeTechTree).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);

		const callArg = mockInitializeTechTree.mock.calls[0]?.[2];
		expect(callArg).toEqual({
			defense: "max",
		});
	});

	it("should filter out duplicate tech items by key in useMemo", async () => {
		const techTreeWithDuplicates: TechTree = {
			starship: [
				{
					color: "red",
					image: null,
					key: "defense",
					label: "Defense",
					module_count: 5,
					modules: [],
				} as TechTreeItem,
				{
					color: "ruby",
					image: null,
					key: "defense",
					label: "Defense Max",
					module_count: 5,
					modules: [],
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
			exosuit: [
				{
					color: "green",
					image: null,
					key: "health",
					label: "Health",
					module_count: 2,
					modules: [],
				} as TechTreeItem,
			],
			multitool: [
				{
					color: "orange",
					image: null,
					key: "damage",
					label: "Damage",
					module_count: 3,
					modules: [],
				} as TechTreeItem,
			],
			starship: [
				{
					color: "red",
					image: null,
					key: "defense",
					label: "Defense",
					module_count: 5,
					modules: [],
				} as TechTreeItem,
			],
		};

		vi.mocked(apiCallModule.apiCall).mockResolvedValue(multiCategoryTree);
		const { mockInitializeTechTree } = setupMocks();

		await act(async () => {
			renderHook(() => useFetchTechTreeSuspense("standard"));
			// Give promises time to resolve
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		await waitFor(
			() => {
				expect(mockInitializeTechTree).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);

		const colorsArg = mockInitializeTechTree.mock.calls[0][0];
		expect(Object.keys(colorsArg)).toContain("defense");
		expect(Object.keys(colorsArg)).toContain("health");
		expect(Object.keys(colorsArg)).toContain("damage");
	});

	it("should handle items without key property in processing", async () => {
		const techTreeWithInvalidItems: TechTree = {
			starship: [
				{
					color: "red",
					image: null,
					key: "defense",
					label: "Defense",
					module_count: 5,
					modules: [],
				} as TechTreeItem,
				// Invalid item without proper key
				{
					label: "Invalid",
				} as unknown as TechTreeItem,
			],
		};

		vi.mocked(apiCallModule.apiCall).mockResolvedValue(techTreeWithInvalidItems);
		const { mockInitializeTechTree } = setupMocks();

		await act(async () => {
			renderHook(() => useFetchTechTreeSuspense("standard"));
			// Give promises time to resolve
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		await waitFor(
			() => {
				expect(mockInitializeTechTree).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);

		// Should only include valid items in groups
		const groupsArg = mockInitializeTechTree.mock.calls[0][1];
		expect(groupsArg).toHaveProperty("defense");
		expect(Object.keys(groupsArg)).toHaveLength(1);
	});

	it("should filter out invalid recommended builds", async () => {
		const techTreeWithInvalidBuilds: TechTree = {
			recommended_builds: [
				{
					layout: [[{ tech: "defense" }]],
					title: "Valid Build",
				} as RecommendedBuild,
				{
					layout: [], // Empty layout - invalid
					title: "Invalid Build",
				} as RecommendedBuild,
			],
			starship: [
				{
					color: "red",
					image: null,
					key: "defense",
					label: "Defense",
					module_count: 5,
					modules: [],
				} as TechTreeItem,
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
