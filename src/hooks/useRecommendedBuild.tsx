// src/hooks/useRecommendedBuild.tsx
import { useCallback } from "react";
import { useGridStore, createGrid } from "../store/GridStore";
import type { TechTree, Module } from "./useTechTree";

export const useRecommendedBuild = (techTree: TechTree) => {
  const setGrid = useGridStore((state) => state.setGrid);

  const applyRecommendedBuild = useCallback(() => {
    if (techTree.recommended_build && techTree.recommended_build.layout) {
      const newGrid = createGrid(10, 6);
      const layout = techTree.recommended_build.layout as ({ tech: string; module: string; supercharged?: boolean; active?: boolean; adjacency_bonus?: boolean } | null)[][];

      for (let r = 0; r < layout.length; r++) {
        for (let c = 0; c < layout[r].length; c++) {
          const cellData = layout[r][c];
          if (cellData) {
            newGrid.cells[r][c].active = cellData.active !== false;
            newGrid.cells[r][c].supercharged = cellData.supercharged || false;

            if (cellData.tech && cellData.module) {
              for (const category in techTree) {
                const categoryItems = techTree[category];
                if (Array.isArray(categoryItems)) {
                  const tech = categoryItems.find(t => t.key === cellData.tech);
                  if (tech) {
                    const module = tech.modules.find((m: Module) => m.id === cellData.module);
                    if (module) {
                      newGrid.cells[r][c].tech = tech.key;
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
          }
        }
      }
      setGrid(newGrid);
    }
  }, [techTree, setGrid]);

  return { applyRecommendedBuild };
};
