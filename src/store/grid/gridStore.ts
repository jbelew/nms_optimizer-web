import type { Cell, Grid, GridStore } from "./gridTypes";
import type { Module } from "@/types/tech";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { UI_TIMING } from "@/constants";
import { useUiStore } from "@/store/ui/uiStore";
import { resolveInitialPlatform } from "@/utils/browser/platformResolver";
import { Logger } from "@/utils/system/monitoring";

import { applyValidationFeedback } from "./applyValidationFeedback";
import { createCellFromModuleData, createGrid, resetCellContent } from "./gridFactories";
import { debouncedStorage } from "./gridPersistence";
import { validateToggleActive, validateToggleSupercharged } from "./gridRules";

export * from "./applyValidationFeedback";

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
				const cells = state.grid?.cells;

				// Basic guard for empty grid (though should not happen with current init)
				if (!cells || cells.length === 0) {
					state.activeTechs = new Set();
					state.totalSuperchargedCells = 0;
					state.hasModulesInGrid = false;
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
				_initialCellStateForTap: null,
				_lastTapCell: [-1, -1],
				_lastTapTime: 0,

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
				clearInteractionState: () =>
					set((state) => {
						state._initialCellStateForTap = null;
						state._lastTapCell = [-1, -1];
						state._lastTapTime = 0;
					}),
				deActivateRow: (rowIndex: number) => {
					set((state) => {
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

							if (!cell.active && !state.superchargedFixed) {
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

				registerCellTap: (rowIndex: number, columnIndex: number, timestamp: number) => {
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (!cell) {
							Logger.error(`Cell not found at [${rowIndex}, ${columnIndex}]`);

							return;
						}

						if (cell.module) {
							const uiState = useUiStore.getState();
							uiState.incrementModuleLockedCount();
							uiState.triggerShake();

							return;
						}

						const timeSinceLastTap = timestamp - state._lastTapTime;
						const isSameCell =
							state._lastTapCell[0] === rowIndex &&
							state._lastTapCell[1] === columnIndex;

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

							if (!validation.valid) {
								applyValidationFeedback(validation);

								if (state._initialCellStateForTap) {
									const currentCell = state.grid.cells[rowIndex]?.[columnIndex];

									if (currentCell) {
										currentCell.active = state._initialCellStateForTap.active;
										currentCell.supercharged =
											state._initialCellStateForTap.supercharged;
									}
								}

								state._initialCellStateForTap = null;
								state._lastTapCell = [-1, -1];
								state._lastTapTime = 0;
							} else {
								if (state._initialCellStateForTap) {
									const currentCell = state.grid.cells[rowIndex]?.[columnIndex];

									if (currentCell) {
										currentCell.active = state._initialCellStateForTap.active;
										currentCell.supercharged =
											state._initialCellStateForTap.supercharged;
									}
								}

								const currentCell = state.grid.cells[rowIndex]?.[columnIndex];

								if (currentCell) {
									currentCell.supercharged = !currentCell.supercharged;
									currentCell.active = true;
								}

								state._initialCellStateForTap = null;
								state._lastTapCell = [-1, -1];
								state._lastTapTime = 0;
							}
						} else {
							state._lastTapCell = [rowIndex, columnIndex];
							state._lastTapTime = timestamp;

							const validation = validateToggleActive({
								cell,
								gridFixed: state.gridFixed,
							});

							if (!validation.valid) {
								applyValidationFeedback(validation);
								state._initialCellStateForTap = null;
							} else {
								state._initialCellStateForTap = { ...cell };
								const currentCell = state.grid.cells[rowIndex]?.[columnIndex];

								if (currentCell) {
									currentCell.active = !currentCell.active;

									if (!currentCell.active && !state.superchargedFixed) {
										currentCell.supercharged = false;
									}
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
					let success = false;
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (cell) {
							if (cell.active !== active) {
								const validation = validateToggleActive({
									cell,
									gridFixed: state.gridFixed,
								});

								if (!validation.valid) {
									applyValidationFeedback(validation);

									return;
								}
							}

							cell.active = active;

							if (!active && !state.superchargedFixed) {
								cell.supercharged = false;
							}

							success = true;
						}

						recomputeDerivedState(state);
					});

					return success;
				},

				setCellSupercharged: (rowIndex, columnIndex, supercharged) => {
					let success = false;
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (cell) {
							if (cell.supercharged !== supercharged) {
								if (supercharged && !cell.active) return;
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
							}

							cell.supercharged = supercharged;
							success = true;
						}

						recomputeDerivedState(state);
					});

					return success;
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

				setInitialCellStateForTap: (cell) =>
					set((state) => {
						state._initialCellStateForTap = cell;
					}),

				setInitialGridDefinition: (definition) =>
					set((state) => {
						state.initialGridDefinition = definition;
					}),

				setIsSharedGrid: (isShared) =>
					set((state) => {
						state.isSharedGrid = isShared;
					}),

				setLastTap: (cell, time) =>
					set((state) => {
						state._lastTapCell = cell;
						state._lastTapTime = time;
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
	w["handleCellDoubleTap"] = useGridStore.getState().handleCellDoubleTap;
	w["registerCellTap"] = useGridStore.getState().registerCellTap;

	w["useInteractionStore"] = {
		getState: () => ({
			_initialCellStateForTap: useGridStore.getState()._initialCellStateForTap,
			_lastTapCell: useGridStore.getState()._lastTapCell,
			_lastTapTime: useGridStore.getState()._lastTapTime,
			clearInteractionState: useGridStore.getState().clearInteractionState,
			setInitialCellStateForTap: useGridStore.getState().setInitialCellStateForTap,
			setLastTap: useGridStore.getState().setLastTap,
		}),
		setState: (updates: Partial<GridStore>) => {
			useGridStore.setState(updates);
		},
	};
}
