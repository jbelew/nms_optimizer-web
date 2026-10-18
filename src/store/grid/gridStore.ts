import type { Cell, Grid, GridStore } from "./gridTypes";
import type { Module } from "@/types/tech";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";

import { UI_TIMING } from "@/constants";
import { resolveInitialPlatform } from "@/store/app/platformStore";
import { Logger } from "@/utils/system/monitoring";

import { applyValidationFeedback } from "./applyValidationFeedback";
import { createCellFromModuleData, createGrid, resetCellContent } from "./gridFactories";
import { debouncedStorage } from "./gridPersistence";
import { validateToggleActive, validateToggleSupercharged } from "./gridRules";

export * from "./applyValidationFeedback";

export * from "./gridFactories";

export * from "./gridPersistence";

export * from "./gridRules";

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
 * const toggleCellActive = useGridStore((s) => s.toggleCellActive);
 * ```
 */
export const useGridStore = create<GridStore>()(
	persist(
		immer((set, get) => {
			let initialCellStateForTap: null | Pick<Cell, "active" | "supercharged"> = null;
			let lastTapCell: [number, number] = [-1, -1];
			let lastTapTime = 0;

			const resetTapState = (): void => {
				initialCellStateForTap = null;
				lastTapCell = [-1, -1];
				lastTapTime = 0;
			};

			/**
			 * Synchronizes `state.grid.cells` with `targetCells` while preserving object
			 * references for unmodified cells and rows in the Immer draft.
			 *
			 * @param state - The current mutable Immer draft state.
			 * @param targetCells - The target 2D cell matrix to apply.
			 *
			 * @returns Updates `state.grid` in place.
			 */
			const syncGridCellsInPlace = (state: GridStore, targetCells: Cell[][]): void => {
				const targetHeight = targetCells.length;
				const targetWidth = targetCells[0]?.length ?? 0;
				const currentCells = state.grid?.cells;

				const hasMatchingDimensions =
					Array.isArray(currentCells) &&
					currentCells.length === targetHeight &&
					currentCells.every((row, r) => row?.length === targetCells[r]?.length);

				if (!hasMatchingDimensions) {
					state.grid.cells = targetCells;
					state.grid.width = targetWidth;
					state.grid.height = targetHeight;

					return;
				}

				for (let r = 0; r < targetHeight; r++) {
					const currentRow = currentCells[r];
					const targetRow = targetCells[r];

					for (let c = 0; c < targetRow.length; c++) {
						const currentCell = currentRow[c];
						const targetCell = targetRow[c];

						if (!shallow(currentCell, targetCell)) {
							Object.assign(currentCell, targetCell);
						}
					}
				}

				state.grid.width = targetWidth;
				state.grid.height = targetHeight;
			};

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
				syncGridCellsInPlace(state, newCells);
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
				const cells = state.grid?.cells;
				const currentActiveTechs = get().activeTechs;

				// Basic guard for empty grid (though should not happen with current init)
				if (!cells || cells.length === 0) {
					if (currentActiveTechs.size > 0) {
						state.activeTechs = new Set();
					}

					state.totalSuperchargedCells = 0;
					state.hasModulesInGrid = false;
					state.isDefaultGrid = !state.isSharedGrid;
					state.isGridFull = false;
					state.firstInactiveRowIndex = -1;
					state.lastActiveRowIndex = -1;

					return;
				}

				const techs = new Set<string>();
				let superchargedCount = 0;
				let hasModules = false;
				let activeCount = 0;
				let activeWithModuleCount = 0;
				let firstInactiveRow = -1;
				let lastActiveRow = -1;
				const initialCells = state.initialGridDefinition?.grid;
				const hasInitialCells = Array.isArray(initialCells) && initialCells.length > 0;
				let isDefault =
					!state.isSharedGrid &&
					(!hasInitialCells || initialCells.length === cells.length);

				for (let r = 0; r < cells.length; r++) {
					const row = cells[r];
					let rowHasActive = false;
					let rowAllInactive = true;

					if (isDefault && hasInitialCells && initialCells[r]?.length !== row.length) {
						isDefault = false;
					}

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

						if (isDefault) {
							const initialCell = hasInitialCells ? initialCells[r]?.[c] : undefined;
							const expectedActive = initialCell
								? (initialCell.active ?? true)
								: false;
							const expectedSupercharged = initialCell
								? (initialCell.supercharged ?? false)
								: false;
							const expectedModule = initialCell?.id || null;

							if (
								cell.active !== expectedActive ||
								cell.supercharged !== expectedSupercharged ||
								cell.module !== expectedModule
							) {
								isDefault = false;
							}
						}
					}

					if (rowHasActive) lastActiveRow = r;
					if (rowAllInactive && firstInactiveRow === -1) firstInactiveRow = r;
				}

				if (!shallow(currentActiveTechs, techs)) {
					state.activeTechs = techs;
				}

				state.totalSuperchargedCells = superchargedCount;
				state.hasModulesInGrid = hasModules;
				state.isDefaultGrid = isDefault;
				state.isGridFull = activeCount > 0 && activeCount === activeWithModuleCount;
				state.firstInactiveRowIndex = firstInactiveRow;
				state.lastActiveRowIndex = lastActiveRow;
			};

			return {
				activateRow: (rowIndex: number) => {
					set((state) => {
						if (state.gridFixed || state.hasModulesInGrid) {
							return;
						}

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
				buildName: null,
				deActivateRow: (rowIndex: number) => {
					set((state) => {
						if (state.gridFixed || state.hasModulesInGrid) {
							return;
						}

						if (state.grid.cells[rowIndex]) {
							state.grid.cells[rowIndex].forEach((cell: Cell) => {
								cell.active = false;

								if (!state.superchargedFixed) {
									cell.supercharged = false;
								}
							});
						}

						recomputeDerivedState(state);
					});
				},

				firstInactiveRowIndex: 0,
				grid: createGrid(10, 6),

				gridFixed: false,

				hasModulesInGrid: false,
				initialGridDefinition: undefined,
				isDefaultGrid: true,
				isGridFull: false,

				isSharedGrid: false,

				lastActiveRowIndex: -1,

				registerCellTap: (rowIndex: number, columnIndex: number, timestamp: number) => {
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (!cell) {
							Logger.error(`Cell not found at [${rowIndex}, ${columnIndex}]`);

							return;
						}

						if (cell.module) {
							applyValidationFeedback({ reason: "moduleLocked", valid: false });

							return;
						}

						const timeSinceLastTap = timestamp - lastTapTime;
						const isSameCell =
							lastTapCell[0] === rowIndex && lastTapCell[1] === columnIndex;

						if (
							isSameCell &&
							timeSinceLastTap < UI_TIMING.DOUBLE_TAP_THRESHOLD &&
							timeSinceLastTap > 0
						) {
							const validation = validateToggleSupercharged({
								cell,
								gridFixed: state.gridFixed,
								rowIndex,
								superchargedFixed: state.superchargedFixed,
								totalSupercharged: state.totalSuperchargedCells,
							});

							if (initialCellStateForTap) {
								cell.active = initialCellStateForTap.active;
								cell.supercharged = initialCellStateForTap.supercharged;
							}

							if (!validation.valid) {
								applyValidationFeedback(validation);
							} else {
								cell.supercharged = !cell.supercharged;
								cell.active = true;
							}

							resetTapState();
						} else {
							lastTapCell = [rowIndex, columnIndex];
							lastTapTime = timestamp;

							const validation = validateToggleActive({
								cell,
								gridFixed: state.gridFixed,
							});

							if (!validation.valid) {
								applyValidationFeedback(validation);
								initialCellStateForTap = null;
							} else {
								initialCellStateForTap = {
									active: cell.active,
									supercharged: cell.supercharged,
								};
								cell.active = !cell.active;

								if (!cell.active && !state.superchargedFixed) {
									cell.supercharged = false;
								}
							}
						}

						recomputeDerivedState(state);
					});
				},

				resetGrid: () => {
					set((state) => {
						const definition = state.initialGridDefinition;

						if (definition) {
							applyGridDefinition(state, definition);
						} else {
							const newGrid = createGrid(state.grid.width, state.grid.height);
							syncGridCellsInPlace(state, newGrid.cells);
							state.gridFixed = false;
							state.superchargedFixed = false;
						}

						state.result = null;
						state.isSharedGrid = false;
						state.buildName = null;
						resetTapState();
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
						resetTapState();

						// Ensure derived state is re-calculated based on restored data
						recomputeDerivedState(state);
					}),

				result: null,

				setBuildName: (name) =>
					set((state) => {
						state.buildName = name;
					}),

				setGrid: (grid) =>
					set((state) => {
						state.grid = grid;
						resetTapState();
						recomputeDerivedState(state);
					}),

				setGridFixed: (fixed) =>
					set((state) => {
						state.gridFixed = fixed;
					}),

				setGridFromInitialDefinition: (definition) => {
					set((state) => {
						applyGridDefinition(state, definition);
						resetTapState();
						recomputeDerivedState(state);
					});
				},

				setInitialGridDefinition: (definition) =>
					set((state) => {
						state.initialGridDefinition = definition;
						recomputeDerivedState(state);
					}),

				setIsSharedGrid: (isShared) =>
					set((state) => {
						state.isSharedGrid = isShared;
						recomputeDerivedState(state);
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
					let success = false;
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (!cell) {
							Logger.error(`Cell not found at [${rowIndex}, ${columnIndex}]`);

							return;
						}

						const validation = validateToggleActive({
							cell,
							gridFixed: state.gridFixed,
						});

						if (!validation.valid) {
							applyValidationFeedback(validation);

							return;
						}

						if (cell.supercharged && !state.superchargedFixed) {
							cell.supercharged = false;
						}

						if (!cell.active || !cell.module) {
							cell.active = !cell.active;
						}

						success = true;
						recomputeDerivedState(state);
					});

					return success;
				},

				toggleCellSupercharged: (rowIndex, columnIndex) => {
					let success = false;
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (!cell) {
							Logger.error(`Cell not found at [${rowIndex}, ${columnIndex}]`);

							return;
						}

						const validation = validateToggleSupercharged({
							cell,
							gridFixed: state.gridFixed,
							rowIndex,
							superchargedFixed: state.superchargedFixed,
							totalSupercharged: state.totalSuperchargedCells,
						});

						if (!validation.valid) {
							applyValidationFeedback(validation);

							return;
						}

						if (!cell.active) {
							cell.active = true;
						}

						cell.supercharged = !cell.supercharged;
						success = true;
						recomputeDerivedState(state);
					});

					return success;
				},

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
	const w = window as Record<string, unknown> & typeof window;

	w["useGridStore"] = useGridStore;
	w["registerCellTap"] = useGridStore.getState().registerCellTap;
}
