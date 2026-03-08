// src/hooks/useRecommendedBuild.tsx
import type { Module, RecommendedBuild, TechTree, TechTreeItem } from "../useTechTree/useTechTree";

import { createEmptyCell, createGrid, resetCellContent, useGridStore } from "../../store/GridStore";
import { isValidRecommendedBuild } from "../../utils/recommendedBuildValidation";
import { useBreakpoint } from "../useBreakpoint/useBreakpoint";
import { useScrollGridIntoView } from "../useScrollGridIntoView/useScrollGridIntoView";

/**
 * Custom hook for applying pre-defined "Recommended Builds" to the technology grid.
 *
 * This hook maps technology and module identifiers from the recommended build
 * layout to their actual data properties in the `techTree`. It handles
 * automatic scrolling on mobile devices and updates the global `GridStore`.
 *
 * @param {TechTree} techTree - The complete technology tree data required for property mapping. **Must not be null.**
 * @returns {{ applyRecommendedBuild: function(RecommendedBuild): void }} A function to apply a selected build.
 *
 * @example
 * const { applyRecommendedBuild } = useRecommendedBuild(techTree);
 */
export const useRecommendedBuild = (techTree: TechTree) => {
	const isAbove1024 = useBreakpoint("1024px");
	const scrollOptions = { skipOnLargeScreens: false };
	const { scrollIntoView } = useScrollGridIntoView(scrollOptions);

	/**
	 * A map of all modules, indexed by a composite key of `tech/moduleId`.
	 */
	const modulesMap = new Map<string, Module>();

	if (techTree) {
		for (const category in techTree) {
			const categoryItems = techTree[category];

			if (Array.isArray(categoryItems)) {
				for (const tech of categoryItems) {
					if (
						typeof tech === "object" &&
						tech !== null &&
						"key" in tech &&
						"modules" in tech
					) {
						for (const module of (tech as TechTreeItem).modules) {
							modulesMap.set(`${(tech as TechTreeItem).key}/${module.id}`, module);
						}
					}
				}
			}
		}
	}

	/**
	 * Overwrites the current grid state with the layout defined in a recommended build.
	 *
	 * Performs validation on the build object and initiates a scroll-into-view on mobile.
	 *
	 * @param {RecommendedBuild} build - The recommended build configuration. **Must pass `isValidRecommendedBuild` check.**
	 */
	const applyRecommendedBuild = (build: RecommendedBuild) => {
		if (!isValidRecommendedBuild(build)) {
			console.error("Invalid RecommendedBuild object received:", build);

			return;
		}

		if (build && build.layout && build.layout.length > 0) {
			// Scroll immediately before computations on screens < 1024px
			if (!isAbove1024) {
				scrollIntoView();
			}

			const newGrid = createGrid(10, 6);
			const layout = build.layout as ({
				tech: string;
				module: string;
				supercharged?: boolean;
				active?: boolean;
				adjacency_bonus?: number;
			} | null)[][];

			for (let r = 0; r < layout.length; r++) {
				for (let c = 0; c < layout[r].length; c++) {
					const cellData = layout[r][c];

					if (cellData) {
						// Initialize with empty cell, then apply specific overrides
						let cell = createEmptyCell(
							cellData.supercharged ?? false,
							cellData.active ?? true
						);

						// Ensure tech and module are null if not provided
						cell.tech = cellData.tech ?? null;
						cell.module = cellData.module ?? null;

						if (cellData.tech && cellData.module) {
							const module = modulesMap.get(`${cellData.tech}/${cellData.module}`);

							if (module) {
								cell = {
									...cell,
									label: module.label ?? "",
									image: module.image ?? null,
									bonus: module.bonus ?? 0,
									value: module.value ?? 0,
									adjacency: module.adjacency ?? "none",
									sc_eligible: module.sc_eligible ?? false,
									type: module.type ?? "", // Add the missing 'type' property
								};
							} else {
								// If module not found, reset the cell to empty state
								resetCellContent(cell);
							}
						}

						cell.adjacency_bonus = cellData.adjacency_bonus ?? 0.0;

						newGrid.cells[r][c] = cell;
					} else {
						// If cellData is null, ensure the cell is empty and inactive/not supercharged by default
						newGrid.cells[r][c] = createEmptyCell();
					}
				}
			}

			useGridStore.getState().setGrid(newGrid);
		}
	};

	return { applyRecommendedBuild };
};
