import type { Cell, Grid, GridStore } from "./gridTypes";
import type { Module } from "@/types/tech";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { resolveInitialPlatform } from "@/utils/browser/platformResolver";
import { Logger } from "@/utils/system/monitoring";

import { createCellFromModuleData, createGrid, resetCellContent } from "./gridFactories";
import { debouncedStorage } from "./gridPersistence";

export * from "./gridFactories";

export * from "./gridPersistence";

export * from "./gridTypes";

/**
 * Zustand store for managing the technology grid, cell states, and optimization results.
 *
 * @remarks
 * This is the primary store for the application's interactive grid. It manages:
 * 1. The 2D `Grid` state and its individual `Cell` properties.
 * 2. Persistence of grid layouts via `localStorage` (debounced for performance).
 * 3. Synchronization with shared URL parameters for grid loading.
 * 4. Integration with optimization results from the backend.
 *
 * It uses `immer` for deep nested state updates and `persist` for local storage synchronization.
 *
 * @returns {import("zustand").UseBoundStore<import("zustand").StoreApi<GridStore>>} The grid store hook.
 *
 * @see {@link GridStore}
 * @see {@link Grid}
 * @see {@link Cell}
 * @see {@link ./createGrid.test.ts createGrid Tests}
 * @see {@link ./gridSelectors.test.ts Selectors Tests}
 * @see {@link ./hasTechInGrid.test.ts hasTechInGrid Tests}
 * @see {@link ./persistence_regression.test.ts Regression Test}
 *
 * @hook
 *
 * @category State
 *
 * @example
 * ```tsx
 * const grid = useGridStore((s) => s.grid);
 * const handleCellTap = useGridStore((s) => s.handleCellTap);
 * ```
 */
export const useGridStore = create<GridStore>()(
	persist(
		immer((set, _get) => {
			/**
			 * Applies a grid definition to the state.
			 *
			 * @param state - The current state.
			 * @param definition - The grid definition to apply.
			 *
			 * @example
			 * ```typescript
			 * applyGridDefinition(state, { grid: [...], gridFixed: true, superchargedFixed: false });
			 * ```
			 */
			const applyGridDefinition = (
				state: GridStore,
				definition: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean }
			) => {
				const newCells: Cell[][] = definition.grid.map((row) =>
					row.map(createCellFromModuleData)
				);
				state.grid.cells = newCells;
				state.grid.width = newCells[0]?.length ?? 0;
				state.grid.height = newCells.length;
				state.gridFixed = definition.gridFixed;
				state.superchargedFixed = definition.superchargedFixed;
			};

			/**
			 * Scans the grid once and updates all precomputed derived state fields.
			 *
			 * @param state - The current mutable Immer draft state.
			 *
			 * @example
			 * ```typescript
			 * set((state) => {
			 *   state.grid.cells[0][0].active = true;
			 *   recomputeDerivedState(state);
			 * });
			 * ```
			 */
			const recomputeDerivedState = (state: GridStore) => {
				if (!state.grid || !state.grid.cells) {
					state.activeTechs = new Set();
					state.totalSuperchargedCells = 0;
					state.hasModulesInGrid = false;
					state.isGridFull = false;
					state.firstInactiveRowIndex = -1;
					state.lastActiveRowIndex = -1;

					return;
				}

				const cells = state.grid.cells;

				const techs = new Set<string>();
				let superchargedCount = 0;
				let hasModules = false;
				let activeCount = 0;
				let activeWithModuleCount = 0;
				let firstInactiveRow = -1;
				let lastActiveRow = -1;

				for (let r = 0; r < cells.length; r++) {
					const row = cells[r];
					let rowHasActive = false;
					let rowAllInactive = true;

					for (let c = 0; c < row.length; c++) {
						const cell = row[c];
						if (cell.tech) techs.add(cell.tech);

						if (cell.supercharged) superchargedCount++;

						if (cell.module !== null) hasModules = true;

						if (cell.active) {
							rowHasActive = true;
							rowAllInactive = false;
							activeCount++;

							if (cell.module !== null) activeWithModuleCount++;
						}
					}

					if (rowHasActive) lastActiveRow = r;
					if (rowAllInactive && firstInactiveRow === -1) firstInactiveRow = r;
				}

				state.activeTechs = techs;
				state.totalSuperchargedCells = superchargedCount;
				state.hasModulesInGrid = hasModules;
				state.isGridFull = activeCount > 0 && activeCount === activeWithModuleCount;
				state.firstInactiveRowIndex = firstInactiveRow;
				state.lastActiveRowIndex = lastActiveRow;
			};

			return {
				activateRow: (rowIndex: number) => {
					set((state) => {
						if (state.grid.cells[rowIndex]) {
							state.grid.cells[rowIndex].forEach((cell: Cell) => {
								cell.active = true;
							});
						}

						recomputeDerivedState(state);
					});
				},
				// Precomputed derived state — defaults for empty grid
				activeTechs: new Set<string>(),
				applyModulesToGrid: (modules: (Module | null)[]) => {
					set((state) => {
						modules.forEach((moduleData, index) => {
							const rowIndex = Math.floor(index / state.grid.width);
							const colIndex = index % state.grid.width;
							const cell = state.grid.cells[rowIndex]?.[colIndex];

							if (cell) {
								if (moduleData) {
									const m = moduleData as Module & { group_adjacent?: boolean };
									Object.assign(cell, {
										active: m.active ?? cell.active,
										adjacency: m.adjacency ?? cell.adjacency,
										adjacency_bonus:
											m.adjacency_bonus !== undefined
												? m.adjacency_bonus
												: cell.adjacency_bonus,
										bonus: m.bonus !== undefined ? m.bonus : cell.bonus,
										group_adjacent: m.group_adjacent ?? cell.group_adjacent,
										image: m.image ?? cell.image,
										label: m.label ?? cell.label,
										module: m.id ?? cell.module,
										sc_eligible: m.sc_eligible ?? cell.sc_eligible,
										supercharged: m.supercharged ?? cell.supercharged,
										tech: m.tech ?? cell.tech,
										type: m.type ?? cell.tech, // Default type to tech if missing
										value: m.value !== undefined ? m.value : cell.value,
									});
								} else {
									resetCellContent(cell);
								}
							}
						});

						recomputeDerivedState(state);
					});
				},

				buildName: null,
				deActivateRow: (rowIndex: number) => {
					set((state) => {
						if (state.grid.cells[rowIndex]) {
							state.grid.cells[rowIndex].forEach((cell: Cell) => {
								cell.active = false;
								cell.supercharged = false;
							});
						}

						recomputeDerivedState(state);
					});
				},
				firstInactiveRowIndex: 0,
				grid: createGrid(10, 6),
				gridFixed: false,
				handleCellDoubleTap: (rowIndex: number, columnIndex: number) => {
					set((state) => {
						const currentCell = state.grid.cells[rowIndex]?.[columnIndex];

						if (currentCell) {
							currentCell.supercharged = !currentCell.supercharged;
							currentCell.active = true;
						}

						recomputeDerivedState(state);
					});
				},

				handleCellTap: (rowIndex: number, columnIndex: number) => {
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (cell) {
							cell.active = !cell.active;

							if (!cell.active) {
								cell.supercharged = false;
							}
						}

						recomputeDerivedState(state);
					});
				},
				hasModulesInGrid: false,

				initialGridDefinition: undefined,

				isGridFull: false,

				isSharedGrid: false,

				lastActiveRowIndex: -1,

				resetGrid: () => {
					set((state) => {
						const definition = state.initialGridDefinition;

						if (definition) {
							applyGridDefinition(state, definition);
						} else {
							const newGrid = createGrid(state.grid.width, state.grid.height);
							state.grid.cells = newGrid.cells;
							state.gridFixed = false;
							state.superchargedFixed = false;
						}

						state.result = null;
						state.isSharedGrid = false;
						state.buildName = null;
						recomputeDerivedState(state);
					});
				},

				resetGridTech: (tech: string) => {
					set((state) => {
						state.grid.cells.forEach((row) => {
							row.forEach((cell) => {
								if (cell.tech === tech) {
									resetCellContent(cell);
								}
							});
						});

						recomputeDerivedState(state);
					});
				},

				restoreGridState: (savedState) =>
					set((state) => {
						// Safely merge saved state into current draft
						// We use Object.assign on the state draft to update fields
						// Immer will handle the proxy correctly.
						Object.assign(state, savedState);

						// Ensure derived state is re-calculated based on restored data
						recomputeDerivedState(state);
					}),

				result: null,

				revertCellTap: (rowIndex: number, columnIndex: number, originalState: Cell) => {
					set((state) => {
						const currentCell = state.grid.cells[rowIndex]?.[columnIndex];

						if (currentCell) {
							currentCell.active = originalState.active;
							currentCell.supercharged = originalState.supercharged;
						}

						recomputeDerivedState(state);
					});
				},

				setBuildName: (name) =>
					set((state) => {
						state.buildName = name;
					}),

				setCellActive: (rowIndex, columnIndex, active) => {
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (cell) {
							cell.active = active;

							if (!active) {
								cell.supercharged = false;
							}
						}

						recomputeDerivedState(state);
					});
				},

				setCellSupercharged: (rowIndex, columnIndex, supercharged) => {
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (cell) {
							if (supercharged && !cell.active) return;
							cell.supercharged = supercharged;
						}

						recomputeDerivedState(state);
					});
				},

				setGrid: (grid) =>
					set((state) => {
						state.grid = grid;
						recomputeDerivedState(state);
					}),

				setGridFixed: (fixed) =>
					set((state) => {
						state.gridFixed = fixed;
					}),

				setGridFromInitialDefinition: (definition) => {
					set((state) => {
						applyGridDefinition(state, definition);
						recomputeDerivedState(state);
					});
				},

				setInitialGridDefinition: (definition) =>
					set((state) => {
						state.initialGridDefinition = definition;
					}),

				setIsSharedGrid: (isShared) =>
					set((state) => {
						state.isSharedGrid = isShared;
					}),

				setResult: (result) => {
					set((state) => {
						state.result = result;
					});
				},

				setSuperchargedFixed: (fixed) =>
					set((state) => {
						state.superchargedFixed = fixed;
					}),

				superchargedFixed: false,

				toggleCellActive: (rowIndex, columnIndex) => {
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (!cell) {
							Logger.error(`Cell not found at [${rowIndex}, ${columnIndex}]`);

							return;
						}

						if (cell.supercharged) {
							cell.supercharged = !cell.supercharged;
						}

						if (!cell.active || !cell.module) {
							cell.active = !cell.active;
						}

						recomputeDerivedState(state);
					});
				},

				toggleCellSupercharged: (rowIndex, columnIndex) =>
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (!cell) {
							Logger.error(`Cell not found at [${rowIndex}, ${columnIndex}]`);

							return;
						}

						if (!cell.active) {
							cell.active = true;
						}

						cell.supercharged = !cell.supercharged;
						recomputeDerivedState(state);
					}),

				totalSuperchargedCells: 0,

				triggerRecompute: () => {
					set((state) => {
						recomputeDerivedState(state);
					});
				},
			};
		}),
		{
			merge: (persistedState, currentState) => {
				const stateFromStorage = persistedState as Partial<GridStore>;

				return {
					...currentState,
					...stateFromStorage,
					initialGridDefinition:
						stateFromStorage.initialGridDefinition ||
						currentState.initialGridDefinition,
					isSharedGrid: false,
				};
			},
			name: "gridState",
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.triggerRecompute();
				}
			},
			partialize: (state) => {
				const dataToPersist = {
					buildName: state.buildName,
					grid: state.grid,
					gridFixed: state.gridFixed,
					initialGridDefinition: state.initialGridDefinition,
					isSharedGrid: state.isSharedGrid,
					selectedPlatform: resolveInitialPlatform(),
					superchargedFixed: state.superchargedFixed,
				};

				return dataToPersist;
			},
			storage: debouncedStorage,
		}
	)
);

// Always expose for E2E if the flag is set, using a method that survives minification
if (typeof window !== "undefined" && import.meta.env.VITE_E2E_TESTING) {
	const w = window as typeof window & {
		handleCellDoubleTap?: (row: number, col: number) => void;
		useGridStore?: typeof useGridStore;
	};

	w["useGridStore"] = useGridStore;
	w["handleCellDoubleTap"] = useGridStore.getState().handleCellDoubleTap;
}
