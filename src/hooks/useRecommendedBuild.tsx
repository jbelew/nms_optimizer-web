// src/hooks/useRecommendedBuild.tsx
import { useCallback, useMemo } from "react";
import { useGridStore, createGrid } from "../store/GridStore";
import type { TechTree, Module, RecommendedBuild, TechTreeItem } from "./useTechTree";

export const useRecommendedBuild = (techTree: TechTree) => {
	const setGrid = useGridStore((state) => state.setGrid);

	const modulesMap = useMemo(() => {
		const map = new Map<string, Module>();
		if (!techTree) return map;

		for (const category in techTree) {
			const categoryItems = techTree[category];
			if (Array.isArray(categoryItems)) {
				for (const tech of categoryItems) {
					if (typeof tech === 'object' && tech !== null && 'key' in tech && 'modules' in tech) {
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
				const newGrid = createGrid(10, 6);
				const layout = build.layout as (
					| {
							tech: string;
							module: string;
							supercharged?: boolean;
							active?: boolean;
							adjacency_bonus?: boolean;
					  }
					| null
				)[][];

				for (let r = 0; r < layout.length; r++) {
					for (let c = 0; c < layout[r].length; c++) {
						const cellData = layout[r][c];
						if (cellData) {
							newGrid.cells[r][c].active = cellData.active !== false;
							newGrid.cells[r][c].supercharged = cellData.supercharged || false;

							if (cellData.tech && cellData.module) {
								const module = modulesMap.get(`${cellData.tech}/${cellData.module}`);
								if (module) {
									newGrid.cells[r][c].tech = cellData.tech;
									newGrid.cells[r][c].module = module.id;
									newGrid.cells[r][c].label = module.label || "";
									newGrid.cells[r][c].image = module.image || null;
									newGrid.cells[r][c].bonus = module.bonus || 0;
									newGrid.cells[r][c].value = module.value || 0;
									newGrid.cells[r][c].adjacency = module.adjacency || false;
									newGrid.cells[r][c].sc_eligible = module.sc_eligible || false;
									newGrid.cells[r][c].adjacency_bonus = cellData.adjacency_bonus ? 1.0 : 0.0;
								}
							}
						}
					}
				}
				setGrid(newGrid);
			}
		},
		[modulesMap, setGrid]
	);

	return { applyRecommendedBuild };
};
