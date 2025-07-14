// src/hooks/useRecommendedBuild.tsx
import { useCallback, useMemo } from "react";
import { useGridStore, createGrid, createEmptyCell } from "../store/GridStore";
import type { TechTree, Module, RecommendedBuild, TechTreeItem } from "./useTechTree";

export const useRecommendedBuild = (techTree: TechTree) => {
	const {
		setGrid,
		resetGrid,
		setGridFromInitialDefinition,
		setIsSharedGrid,
		initialGridDefinition,
	} = useGridStore.getState();

	const modulesMap = useMemo(() => {
		const map = new Map<string, Module>();
		if (!techTree) return map;

		for (const category in techTree) {
			const categoryItems = techTree[category];
			if (Array.isArray(categoryItems)) {
				for (const tech of categoryItems) {
					if (typeof tech === "object" && tech !== null && "key" in tech && "modules" in tech) {
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
			if (build && build.layout) {
				// Perform a full grid reset before applying the recommended build
				resetGrid();
				setIsSharedGrid(false);

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
							newGrid.cells[r][c].active = cellData.active ?? true;
							newGrid.cells[r][c].supercharged = cellData.supercharged ?? false;

							if (cellData.tech && cellData.module) {
								const module = modulesMap.get(`${cellData.tech}/${cellData.module}`);
								if (module) {
									newGrid.cells[r][c].tech = cellData.tech;
									newGrid.cells[r][c].module = module.id;
									newGrid.cells[r][c].label = module.label ?? "";
									newGrid.cells[r][c].image = module.image ?? null;
									newGrid.cells[r][c].bonus = module.bonus ?? 0;
									newGrid.cells[r][c].value = module.value ?? 0;
									newGrid.cells[r][c].adjacency = module.adjacency ?? false;
									newGrid.cells[r][c].sc_eligible = module.sc_eligible ?? false;
									newGrid.cells[r][c].adjacency_bonus = cellData.adjacency_bonus ? 1.0 : 0.0;
								} else {
									// If module not found, reset the cell but preserve active/supercharged status from cellData
									Object.assign(
										newGrid.cells[r][c],
										createEmptyCell(cellData.supercharged ?? false, cellData.active ?? false)
									);
								}
							} else {
								// If cellData.tech or cellData.module are missing, reset the cell
								Object.assign(
									newGrid.cells[r][c],
									createEmptyCell(cellData.supercharged ?? false, cellData.active ?? false)
								);
							}
						}
					}
				}
				setGrid(newGrid);
			}
		},
		[
			initialGridDefinition,
			modulesMap,
			resetGrid,
			setGrid,
			setGridFromInitialDefinition,
			setIsSharedGrid,
		]
	);

	return { applyRecommendedBuild };
};
