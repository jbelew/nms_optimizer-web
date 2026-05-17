// src/hooks/useRecommendedBuild.tsx
import type { RecommendedBuild, TechTree } from "@/hooks/useTechTree/useTechTree";
import { startTransition, useMemo } from "react";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useScrollGridIntoView } from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import {
	createEmptyCell,
	createGrid,
	resetCellContent,
	useGridStore,
} from "@/store/grid/gridStore";
import { getTechTreeMaps } from "@/utils/tech/techTreeUtils";
import { isValidRecommendedBuild } from "@/utils/validation/dataValidation";

/**
 * Custom hook for applying pre-defined "Recommended Builds" to the technology grid.
 *
 * @remarks
 * This hook maps technology and module identifiers from the recommended build
 * layout to their actual data properties in the `techTree`. It handles
 * automatic scrolling on mobile devices and updates the global `GridStore`.
 *
 * @param {TechTree} techTree - The complete technology tree data required for property mapping.
 *
 * @returns {{ applyRecommendedBuild: (build: RecommendedBuild) => void }} An object containing the `applyRecommendedBuild` function.
 *
 * @see {@link RecommendedBuild} for the build configuration schema.
 * @see {@link TechTree} for the underlying tech data structure.
 * @see {@link useGridStore} for state persistence.
 * @see {@link useBreakpoint} for responsive behavior.
 * @see {@link useScrollGridIntoView} for mobile UX.
 * @see {@link isValidRecommendedBuild} for runtime validation.
 * @see {@link ./useRecommendedBuild.test.tsx Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { applyRecommendedBuild } = useRecommendedBuild(techTree);
 *
 * const onLoadBuild = (build: RecommendedBuild) => {
 *   // Overwrites the entire grid with the pre-defined layout
 *   applyRecommendedBuild(build);
 * };
 * ```
 */
export const useRecommendedBuild = (techTree: TechTree) => {
	const isAbove1024 = useBreakpoint("1024px");
	const scrollOptions = { skipOnLargeScreens: false };
	const { scrollIntoView } = useScrollGridIntoView(scrollOptions);

	/**
	 * Memoized maps of modules, colors, and keys derived from the techTree.
	 *
	 * @remarks
	 * Utilizes the shared getTechTreeMaps utility to avoid redundant iterations.
	 */
	const { modulesMap } = useMemo(() => getTechTreeMaps(techTree), [techTree]);

	/**
	 * Overwrites the current grid state with the layout defined in a recommended build.
	 *
	 * @remarks
	 * Performs validation on the `build` object, maps module IDs to full module data,
	 * and initiates a scroll-into-view on mobile if needed.
	 *
	 * @param {RecommendedBuild} build - The recommended build configuration to apply.
	 *
	 * @returns {void} Side-effects only; updates `GridStore`.
	 *
	 * @see {@link isValidRecommendedBuild}
	 * @see {@link createGrid}
	 * @see {@link createEmptyCell}
	 *
	 * @example
	 * ```ts
	 * applyRecommendedBuild(myBuildObject);
	 * // Side-effect: GridStore.grid is updated and mobile screen scrolls to top.
	 * ```
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
			const layout = build.layout as (null | {
				active?: boolean;
				adjacency_bonus?: number;
				module: string;
				supercharged?: boolean;
				tech: string;
			})[][];

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
									adjacency: module.adjacency ?? "none",
									bonus: module.bonus ?? 0,
									image: module.image ?? null,
									label: module.label ?? "",
									sc_eligible: module.sc_eligible ?? false,
									type: module.type ?? "", // Add the missing 'type' property
									value: module.value ?? 0,
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

			startTransition(() => {
				useGridStore.getState().setGrid(newGrid);
			});
		}
	};

	return { applyRecommendedBuild };
};
