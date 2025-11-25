// src/hooks/useRecommendedBuild.tsx
import type { Module, RecommendedBuild, TechTree, TechTreeItem } from "../useTechTree/useTechTree";
import { useCallback, useMemo } from "react";

import { createEmptyCell, createGrid, resetCellContent, useGridStore } from "../../store/GridStore";
import { isValidRecommendedBuild } from "../../utils/recommendedBuildValidation";
import { useBreakpoint } from "../useBreakpoint/useBreakpoint";
import { useScrollGridIntoView } from "../useScrollGridIntoView/useScrollGridIntoView";

/**
 * Custom hook to handle the application of recommended builds to the grid.
 * Uses the shared grid container ref from useScrollGridIntoView.
 *
 * @param {TechTree} techTree - The tech tree data.
 * @returns {{applyRecommendedBuild: (build: RecommendedBuild) => void}}
 *          An object containing the function to apply a recommended build.
 */
export const useRecommendedBuild = (techTree: TechTree) => {
	const { setGridAndResetAuxiliaryState } = useGridStore.getState();
	const isAbove1024 = useBreakpoint("1024px");
	const scrollOptions = useMemo(() => ({ skipOnLargeScreens: false }), []);
	const { scrollIntoView } = useScrollGridIntoView(scrollOptions);

	/**
	 * A memoized map of all modules, indexed by a composite key of `tech/moduleId`.
	 * @type {Map<string, Module>}
	 */
	const modulesMap = useMemo(() => {
		const map = new Map<string, Module>();
		if (!techTree) return map;

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
							map.set(`${(tech as TechTreeItem).key}/${module.id}`, module);
						}
					}
				}
			}
		}
		return map;
	}, [techTree]);
	/**
	 * Applies a recommended build to the grid.
	 * Scrolls immediately (on small screens only), then applies the build while the page is already moving.
	 *
	 * @param {RecommendedBuild} build - The recommended build to apply.
	 */
	const applyRecommendedBuild = useCallback(
		async (build: RecommendedBuild) => {
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
								const module = modulesMap.get(
									`${cellData.tech}/${cellData.module}`
								);
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
					await new Promise((resolve) => setTimeout(resolve, 0)); // Yield after each row
				}
				setGridAndResetAuxiliaryState(newGrid);
			}
		},
		[modulesMap, setGridAndResetAuxiliaryState, scrollIntoView, isAbove1024]
	);

	return { applyRecommendedBuild };
};
