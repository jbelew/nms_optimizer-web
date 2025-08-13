// src/hooks/useRecommendedBuild.tsx
import type { Module, RecommendedBuild, TechTree, TechTreeItem } from "./useTechTree";
import { useCallback, useMemo } from "react";

import { createEmptyCell, createGrid, resetCellContent, useGridStore } from "../store/GridStore";
import { isValidRecommendedBuild } from "../utils/recommendedBuildValidation";

export const useRecommendedBuild = (
	techTree: TechTree,
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>
) => {
	const { setGridAndResetAuxiliaryState } = useGridStore.getState();

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

	const applyRecommendedBuild = useCallback(
		(build: RecommendedBuild) => {
			if (!isValidRecommendedBuild(build)) {
				console.error("Invalid RecommendedBuild object received:", build);
				return;
			}
			if (build && build.layout) {
				const newGrid = createGrid(10, 6);
				const layout = build.layout as ({
					tech: string;
					module: string;
					supercharged?: boolean;
					active?: boolean;
					adjacency_bonus?: boolean;
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

							// Ensure tech and module are empty strings if not provided
							cell.tech = cellData.tech ?? "";
							cell.module = cellData.module ?? "";

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
							// Adjacency bonus is also from cellData, so it should be assigned outside the module check
							cell.adjacency_bonus =
								typeof cellData.adjacency_bonus === "number"
									? cellData.adjacency_bonus
									: 0.0;

							newGrid.cells[r][c] = cell;
						} else {
							// If cellData is null, ensure the cell is empty and inactive/not supercharged by default
							newGrid.cells[r][c] = createEmptyCell();
						}
					}
				}
				setGridAndResetAuxiliaryState(newGrid);

				// Scroll to the top of the grid container after applying the build
				if (gridContainerRef.current) {
					const element = gridContainerRef.current;
					const offset = 8; // Same offset as in useOptimize.tsx

					const scrollIntoView = () => {
						const elementRect = element.getBoundingClientRect();
						const absoluteElementTop = elementRect.top + window.pageYOffset;
						const targetScrollPosition = absoluteElementTop - offset;

						requestAnimationFrame(() => {
							window.scrollTo({
								top: targetScrollPosition,
								behavior: "smooth",
							});
						});
					};
					requestAnimationFrame(scrollIntoView);
				}
			}
		},
		[modulesMap, setGridAndResetAuxiliaryState, gridContainerRef]
	);

	return { applyRecommendedBuild };
};
