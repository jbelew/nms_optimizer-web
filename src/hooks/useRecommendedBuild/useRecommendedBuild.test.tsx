import type { RecommendedBuild, TechTree, TechTreeItem } from "../useTechTree/useTechTree";
import { act, renderHook } from "@testing-library/react";
import { Mock, vi } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "../../store/grid/gridStore";
import {
	__resetScrollGridIntoViewRef,
	useScrollGridIntoView,
} from "../useScrollGridIntoView/useScrollGridIntoView";
import { useRecommendedBuild } from "./useRecommendedBuild";

// Mock useGridStore
vi.mock("../../store/grid/gridStore", () => ({
	createEmptyCell: vi.fn(),
	createGrid: vi.fn(),
	resetCellContent: vi.fn((cell) => {
		Object.assign(cell, createEmptyCell(cell.supercharged, cell.active));
	}),
	useGridStore: {
		getState: vi.fn(),
	},
}));

// Mock useBreakpoint to return false for all breakpoints (simulate small screen)
vi.mock("../useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(() => false),
}));

/**
 * Test suite for the `useRecommendedBuild` hook.
 */
describe("useRecommendedBuild", () => {
	let setGridAndResetAuxiliaryStateMock: Mock;
	let scrollToMock: Mock;
	let requestAnimationFrameMock: Mock;
	let mockTechTree: TechTree;
	let mockGridContainerRef: React.MutableRefObject<HTMLDivElement | null>;

	/**
	 * Sets up mocks and initializes test environment before each test.
	 */ beforeEach(() => {
		vi.clearAllMocks();
		__resetScrollGridIntoViewRef();

		setGridAndResetAuxiliaryStateMock = vi.fn();
		(useGridStore.getState as Mock).mockReturnValue({
			setGrid: setGridAndResetAuxiliaryStateMock,
		});

		// Mock createGrid and createEmptyCell to return predictable values
		(createGrid as Mock).mockImplementation((width: number, height: number) => ({
			cells: Array(height)
				.fill(0)
				.map(() => Array(width).fill(null)),
			height,
			width,
		}));
		(createEmptyCell as Mock).mockImplementation((supercharged = false, active = false) => ({
			active,
			adjacency: "none",

			adjacency_bonus: 0.0,
			bonus: 0,
			image: null,
			module: null,
			sc_eligible: false,
			supercharged,
			tech: null,
			type: "",
		}));

		scrollToMock = vi.fn();
		Object.defineProperty(window, "scrollTo", { value: scrollToMock, writable: true });
		requestAnimationFrameMock = vi.fn((cb) => cb()); // Immediately execute callback
		Object.defineProperty(window, "requestAnimationFrame", {
			value: requestAnimationFrameMock,
			writable: true,
		});
		Object.defineProperty(window, "pageYOffset", { value: 0, writable: true });

		mockTechTree = {
			Shield: [
				{
					color: "blue", // Add a color
					image: null, // Add image
					key: "shield",
					label: "Shield",
					module_count: 1, // Add module_count
					modules: [
						{
							active: true, // Added missing property
							adjacency: "none", // Corrected type to string
							adjacency_bonus: 0, // Added missing property
							bonus: 20,
							id: "X1",
							image: "img2.png",
							label: "X-Class",
							sc_eligible: false,
							supercharged: false, // Added missing property
							tech: "Shield", // Added missing property
							type: "shield",
							value: 2,
						},
					],
				},
			] as TechTreeItem[],
			Weapon: [
				{
					color: "red", // Add a color, as it's required by TechTreeItem
					image: null, // Add image
					key: "weapon",
					label: "Boltcaster",
					module_count: 1, // Add module_count
					modules: [
						{
							active: true, // Added missing property
							adjacency: "none", // Corrected type to string
							adjacency_bonus: 0, // Added missing property
							bonus: 10,
							id: "S1",
							image: "img.png",
							label: "S-Class",
							sc_eligible: true,
							supercharged: false, // Added missing property
							tech: "Weapon", // Added missing property
							type: "weapon",
							value: 1,
						},
					],
				},
			] as TechTreeItem[],
		};

		mockGridContainerRef = { current: document.createElement("div") };
		Object.defineProperty(mockGridContainerRef.current, "getBoundingClientRect", {
			configurable: true,
			value: () => ({
				bottom: 0,
				height: 0,
				left: 0,
				right: 0,
				top: 100,
				width: 0,
				x: 0,
				y: 0,
			}),
		});
	});

	/**
	 * Verifies that the `applyRecommendedBuild` function is returned by the hook.
	 */ it("should return applyRecommendedBuild function", () => {
		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));
		expect(typeof result.current.applyRecommendedBuild).toBe("function");
	});

	/**
	 * Tests that a recommended build is correctly applied to the grid.
	 */ it("should apply a recommended build and set the grid", async () => {
		const mockBuild: RecommendedBuild = {
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
					null,
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
		};

		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			await result.current.applyRecommendedBuild(mockBuild);
		});

		expect(setGridAndResetAuxiliaryStateMock).toHaveBeenCalledTimes(1);
		const newGrid = setGridAndResetAuxiliaryStateMock.mock.calls[0][0];
		expect(newGrid.cells[0][0]).toEqual(
			expect.objectContaining({
				active: true,
				adjacency: "none",
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
			})
		);
		expect(newGrid.cells[1][1]).toEqual(
			expect.objectContaining({
				active: true,
				adjacency: "none",
				adjacency_bonus: 0.0,
				bonus: 20,
				image: "img2.png",
				label: "X-Class",
				module: "X1",
				sc_eligible: false,
				supercharged: false,
				tech: "shield",
				type: "shield",
				value: 2,
			})
		);
		expect(newGrid.cells[0][1]).toEqual(
			expect.objectContaining({
				tech: null, // Should be empty cell
			})
		);
	});

	/**
	 * Regression test for modulesMap key mismatch.
	 * Ensures that modules are correctly applied when mockBuild.tech matches mockTechTree.key.
	 */ /**
	 * Regression test for modulesMap key mismatch.
	 * Ensures that modules are correctly applied when build tech matches techTree key.
	 */ it("should correctly apply modules when build tech matches techTree key", async () => {
		const mockBuild: RecommendedBuild = {
			layout: [
				[
					{
						active: true,
						adjacency_bonus: 0.0,
						module: "S1",
						supercharged: false,
						tech: "weapon", // Matches mockTechTree.Weapon.key
					},
				],
			],
			title: "Key Match Test",
		};

		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			await result.current.applyRecommendedBuild(mockBuild);
		});

		expect(setGridAndResetAuxiliaryStateMock).toHaveBeenCalledTimes(1);
		const newGrid = setGridAndResetAuxiliaryStateMock.mock.calls[0][0];
		expect(newGrid.cells[0][0]).toEqual(
			expect.objectContaining({
				active: true,
				adjacency: "none",
				adjacency_bonus: 0.0,
				bonus: 10,
				image: "img.png",
				label: "S-Class",
				module: "S1",
				sc_eligible: true,
				supercharged: false,
				tech: "weapon",
				type: "weapon",
				value: 1,
			})
		);
	});

	/**
	 * Regression test for cell.module being "" instead of null.
	 * Ensures that empty cells have their module property set to null.
	 */ it("should set cell.module to null for empty cells in recommended build", async () => {
		const mockBuild: RecommendedBuild = {
			layout: [
				[
					{
						active: true,
						adjacency_bonus: 0.0,
						module: "S1",
						supercharged: false,
						tech: "weapon",
					},
					{
						active: true,
						adjacency_bonus: 0.0,
						module: null,
						supercharged: false,
						// This cell has no module, so its module property should be null
						tech: null,
					},
				],
			],
			title: "Empty Cell Test",
		};

		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			await result.current.applyRecommendedBuild(mockBuild);
		});

		expect(setGridAndResetAuxiliaryStateMock).toHaveBeenCalledTimes(1);
		const newGrid = setGridAndResetAuxiliaryStateMock.mock.calls[0][0];
		expect(newGrid.cells[0][1]).toEqual(
			expect.objectContaining({
				active: true,
				adjacency_bonus: 0.0,
				module: null,
				supercharged: false,
				tech: null,
			})
		);
	});

	/**
	 * Verifies that the grid container scrolls into view after applying a build.
	 */ it("should scroll to grid container after applying build", async () => {
		const mockBuild: RecommendedBuild = {
			layout: [[{ module: "S1", tech: "weapon" }]], // Updated tech to "weapon"
			title: "Test Build",
		};

		// Initialize the shared ref with mockGridContainerRef
		const { result: scrollHookResult } = renderHook(() =>
			useScrollGridIntoView({ skipOnLargeScreens: false })
		);
		scrollHookResult.current.gridContainerRef!.current = mockGridContainerRef.current;

		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			await result.current.applyRecommendedBuild(mockBuild);
		});

		expect(requestAnimationFrameMock).toHaveBeenCalled();
		expect(scrollToMock).toHaveBeenCalledWith({
			behavior: "smooth",
			top: 60, // 100 (top) + 0 (pageYOffset) - 40 (GRID_SCROLL_OFFSET_SMALL)
		});
	});

	/**
	 * Ensures that no build is applied if the provided build or layout is null or empty.
	 */ it("should not apply build if build or layout is null", async () => {
		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			result.current.applyRecommendedBuild({ layout: [], title: "Empty" });
		});
		expect(setGridAndResetAuxiliaryStateMock).not.toHaveBeenCalled();
	});

	/**
	 * Tests the handling of missing modules within the recommended build layout.
	 */ it("should handle missing module in layout", async () => {
		const mockBuild: RecommendedBuild = {
			layout: [
				[{ active: true, module: "module", supercharged: false, tech: "nonexistent" }],
			],
			title: "Test Build",
		};

		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			await result.current.applyRecommendedBuild(mockBuild);
		});

		expect(setGridAndResetAuxiliaryStateMock).toHaveBeenCalledTimes(1);
		const newGrid = setGridAndResetAuxiliaryStateMock.mock.calls[0][0];
		expect(newGrid.cells[0][0]).toEqual(
			expect.objectContaining({
				module: null,
				tech: null, // Should be null if module not found
			})
		);
	});
});
