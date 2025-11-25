import type { RecommendedBuild, TechTree, TechTreeItem } from "../useTechTree/useTechTree";
import { act, renderHook } from "@testing-library/react";
import { Mock, vi } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "../../store/GridStore";
import {
	__resetScrollGridIntoViewRef,
	useScrollGridIntoView,
} from "../useScrollGridIntoView/useScrollGridIntoView";
import { useRecommendedBuild } from "./useRecommendedBuild";

// Mock useGridStore
vi.mock("../../store/GridStore", () => ({
	useGridStore: {
		getState: vi.fn(),
	},
	createGrid: vi.fn(),
	createEmptyCell: vi.fn(),
	resetCellContent: vi.fn((cell) => {
		Object.assign(cell, createEmptyCell(cell.supercharged, cell.active));
	}),
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
			setGridAndResetAuxiliaryState: setGridAndResetAuxiliaryStateMock,
		});

		// Mock createGrid and createEmptyCell to return predictable values
		(createGrid as Mock).mockImplementation((width: number, height: number) => ({
			cells: Array(height)
				.fill(0)
				.map(() => Array(width).fill(null)),
			width,
			height,
		}));
		(createEmptyCell as Mock).mockImplementation((supercharged = false, active = false) => ({
			tech: null,
			module: null,

			image: null,
			bonus: 0,
			adjacency: "none",
			sc_eligible: false,
			supercharged,
			active,
			adjacency_bonus: 0.0,
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
			Weapon: [
				{
					label: "Boltcaster",
					key: "weapon",
					color: "red", // Add a color, as it's required by TechTreeItem
					module_count: 1, // Add module_count
					image: null, // Add image
					modules: [
						{
							id: "S1",
							label: "S-Class",
							bonus: 10,
							image: "img.png",
							adjacency: "none", // Corrected type to string
							sc_eligible: true,
							value: 1,
							type: "weapon",
							active: true, // Added missing property
							adjacency_bonus: 0, // Added missing property
							supercharged: false, // Added missing property
							tech: "Weapon", // Added missing property
						},
					],
				},
			] as TechTreeItem[],
			Shield: [
				{
					label: "Shield",
					key: "shield",
					color: "blue", // Add a color
					module_count: 1, // Add module_count
					image: null, // Add image
					modules: [
						{
							id: "X1",
							label: "X-Class",
							bonus: 20,
							image: "img2.png",
							adjacency: "none", // Corrected type to string
							sc_eligible: false,
							value: 2,
							type: "shield",
							active: true, // Added missing property
							adjacency_bonus: 0, // Added missing property
							supercharged: false, // Added missing property
							tech: "Shield", // Added missing property
						},
					],
				},
			] as TechTreeItem[],
		};

		mockGridContainerRef = { current: document.createElement("div") };
		Object.defineProperty(mockGridContainerRef.current, "getBoundingClientRect", {
			value: () => ({
				top: 100,
				height: 0,
				width: 0,
				x: 0,
				y: 0,
				right: 0,
				bottom: 0,
				left: 0,
			}),
			configurable: true,
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
			title: "Test Build",
			layout: [
				[
					{
						tech: "weapon",
						module: "S1",
						supercharged: true,
						active: true,
						adjacency_bonus: 1.0,
					},
					null,
				],
				[
					null,
					{
						tech: "shield",
						module: "X1",
						supercharged: false,
						active: true,
						adjacency_bonus: 0.0,
					},
				],
			],
		};

		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			await result.current.applyRecommendedBuild(mockBuild);
		});

		expect(setGridAndResetAuxiliaryStateMock).toHaveBeenCalledTimes(1);
		const newGrid = setGridAndResetAuxiliaryStateMock.mock.calls[0][0];
		expect(newGrid.cells[0][0]).toEqual(
			expect.objectContaining({
				tech: "weapon",
				module: "S1",
				supercharged: true,
				active: true,
				adjacency_bonus: 1.0,
				label: "S-Class",
				image: "img.png",
				bonus: 10,
				value: 1,
				adjacency: "none",
				sc_eligible: true,
				type: "weapon",
			})
		);
		expect(newGrid.cells[1][1]).toEqual(
			expect.objectContaining({
				tech: "shield",
				module: "X1",
				supercharged: false,
				active: true,
				adjacency_bonus: 0.0,
				label: "X-Class",
				image: "img2.png",
				bonus: 20,
				value: 2,
				adjacency: "none",
				sc_eligible: false,
				type: "shield",
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
			title: "Key Match Test",
			layout: [
				[
					{
						tech: "weapon", // Matches mockTechTree.Weapon.key
						module: "S1",
						supercharged: false,
						active: true,
						adjacency_bonus: 0.0,
					},
				],
			],
		};

		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			await result.current.applyRecommendedBuild(mockBuild);
		});

		expect(setGridAndResetAuxiliaryStateMock).toHaveBeenCalledTimes(1);
		const newGrid = setGridAndResetAuxiliaryStateMock.mock.calls[0][0];
		expect(newGrid.cells[0][0]).toEqual(
			expect.objectContaining({
				tech: "weapon",
				module: "S1",
				label: "S-Class",
				image: "img.png",
				bonus: 10,
				value: 1,
				adjacency: "none",
				sc_eligible: true,
				type: "weapon",
				supercharged: false,
				active: true,
				adjacency_bonus: 0.0,
			})
		);
	});

	/**
	 * Regression test for cell.module being "" instead of null.
	 * Ensures that empty cells have their module property set to null.
	 */ it("should set cell.module to null for empty cells in recommended build", async () => {
		const mockBuild: RecommendedBuild = {
			title: "Empty Cell Test",
			layout: [
				[
					{
						tech: "weapon",
						module: "S1",
						supercharged: false,
						active: true,
						adjacency_bonus: 0.0,
					},
					{
						// This cell has no module, so its module property should be null
						tech: null,
						module: null,
						supercharged: false,
						active: true,
						adjacency_bonus: 0.0,
					},
				],
			],
		};

		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			await result.current.applyRecommendedBuild(mockBuild);
		});

		expect(setGridAndResetAuxiliaryStateMock).toHaveBeenCalledTimes(1);
		const newGrid = setGridAndResetAuxiliaryStateMock.mock.calls[0][0];
		expect(newGrid.cells[0][1]).toEqual(
			expect.objectContaining({
				tech: null,
				module: null,
				supercharged: false,
				active: true,
				adjacency_bonus: 0.0,
			})
		);
	});

	/**
	 * Verifies that the grid container scrolls into view after applying a build.
	 */ it("should scroll to grid container after applying build", async () => {
		const mockBuild: RecommendedBuild = {
			title: "Test Build",
			layout: [[{ tech: "weapon", module: "S1" }]], // Updated tech to "weapon"
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
			top: 46, // 100 (top) + 0 (pageYOffset) - 54 (offset)
			behavior: "smooth",
		});
	});

	/**
	 * Ensures that no build is applied if the provided build or layout is null or empty.
	 */ it("should not apply build if build or layout is null", async () => {
		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			result.current.applyRecommendedBuild({ title: "Empty", layout: [] });
		});
		expect(setGridAndResetAuxiliaryStateMock).not.toHaveBeenCalled();
	});

	/**
	 * Tests the handling of missing modules within the recommended build layout.
	 */ it("should handle missing module in layout", async () => {
		const mockBuild: RecommendedBuild = {
			title: "Test Build",
			layout: [
				[{ tech: "nonexistent", module: "module", supercharged: false, active: true }],
			],
		};

		const { result } = renderHook(() => useRecommendedBuild(mockTechTree));

		await act(async () => {
			await result.current.applyRecommendedBuild(mockBuild);
		});

		expect(setGridAndResetAuxiliaryStateMock).toHaveBeenCalledTimes(1);
		const newGrid = setGridAndResetAuxiliaryStateMock.mock.calls[0][0];
		expect(newGrid.cells[0][0]).toEqual(
			expect.objectContaining({
				tech: null, // Should be null if module not found
				module: null,
			})
		);
	});
});
