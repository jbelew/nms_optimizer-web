import type { Module } from "@/types/tech";
import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { usePlatformStore } from "@/store/app/platformStore";
import { safeGetItem, safeRemoveItem, safeSetItem } from "@/utils/browser/environment";
import { resolveInitialPlatform } from "@/utils/browser/platformResolver";
import { Logger } from "@/utils/system/monitoring";

/**
 * Structure for the optimization engine's successful result.
 *
 * @see {@link Grid}
 *
 * @category State
 */
export type ApiResponse = {
	/** The newly optimized grid layout. `null` if the solve failed. */
	grid: Grid | null;
	/** The theoretical maximum bonus for the configuration. */
	max_bonus: number;
	/** The identifier of the solver method used (e.g., `'SA'`, `'Pattern'`). */
	solve_method: string;
	/** The actual bonus achieved by the solver. */
	solved_bonus: number;
};

/**
 * Represents a single cell within the technology grid.
 *
 * Each cell maintains its own state for active/inactive status, supercharged status,
 * and the specific module currently placed within it.
 *
 * @category State
 */
export type Cell = {
	/** Whether the cell is part of the active layout. */
	active: boolean;
	/** The type of adjacency bonus the module in this cell provides. */
	adjacency: string;
	/** The calculated bonus multiplier from adjacent technologies. */
	adjacency_bonus: number;
	/** The base bonus value from the module itself. */
	bonus: number;
	/** Whether the cell belongs to an adjacency grouping. */
	group_adjacent: boolean;
	/** Optional icon path/URL for the module. */
	image: null | string;
	/** Display label for the module. */
	label: string;
	/** The unique ID of the module currently placed in this cell. */
	module: null | string;
	/** Whether this cell is allowed to be supercharged. */
	sc_eligible: boolean;
	/** Whether the cell is currently supercharged. */
	supercharged: boolean;
	/** The technology category key (e.g., `'pulse'`). */
	tech: null | string;
	/** The final calculated score/bonus for this specific cell. */
	total: number;
	/** The category/type of the module. */
	type: string;
	/** The raw stat value of the module. */
	value: number;
};

/**
 * Represents the entire technology grid state.
 *
 * The grid is a 2D structure of `Cell` objects, providing a workspace for module placement.
 *
 * @see {@link Cell}
 *
 * @category State
 */
export type Grid = {
	/** 2D array of grid cells. Row-major order. */
	cells: Cell[][];
	/** The number of rows in the grid. */
	height: number;
	/** Whether the grid configuration is valid (e.g. no overlapping modules). */
	valid?: boolean;
	/** The number of columns in the grid. */
	width: number;
};

type SetItemFunction = (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void>;

/**
 * Creates a debounced version of a `setItem` function for `localStorage`.
 *
 * This prevents excessive disk writes during rapid state changes (e.g., when
 * a user is rapidly clicking cells).
 *
 * @param {SetItemFunction} setItemFn - The storage setter function to debounce.
 * @param {number} msToWait - Delay in milliseconds. **Must be a positive integer.**
 *
 * @returns {function(string, StorageValue<Partial<GridStore>>): Promise<void>} The debounced setter.
 *
 * @example
 * ```typescript
 * const debouncedSet = debounceSetItem(mySetFn, 500);
 * await debouncedSet("myKey", { state: { ... } });
 * ```
 */
function debounceSetItem(
	setItemFn: SetItemFunction,
	msToWait: number
): (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void> {
	let timeoutId: null | number = null;

	return (name: string, value: StorageValue<Partial<GridStore>>): Promise<void> => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = window.setTimeout(() => {
			void (async () => {
				try {
					await setItemFn(name, value);
				} catch (e) {
					Logger.error("Failed to save to localStorage", e);
				}
			})();
		}, msToWait);

		return Promise.resolve();
	};
}

/**
 * Factory function to create a default, empty grid cell.
 *
 * Initialized with default values for adjacency, image, and module.
 *
 * @param {boolean} [supercharged=false] - Initial supercharged state.
 * @param {boolean} [active=false] - Initial active state.
 *
 * @returns {Cell} A new `Cell` object with default values.
 *
 * @see {@link Cell}
 *
 * @category Factories
 *
 * @example
 * const newCell = createEmptyCell(true, true);
 *
 * // returns { active: true, supercharged: true, ... }
 */
export const createEmptyCell = (supercharged = false, active = false): Cell => ({
	active,
	adjacency: "none",
	adjacency_bonus: 0.0,
	bonus: 0.0,
	group_adjacent: false,
	image: null,
	label: "",
	module: null,
	sc_eligible: false,
	supercharged: supercharged,
	tech: null,
	total: 0.0,
	type: "",
	value: 0,
});

/**
 * Factory function to create a blank grid of specified dimensions.
 *
 * Initializes a `Grid` object with a 2D array of empty cells.
 *
 * @param {number} width - Number of columns.
 * @param {number} height - Number of rows.
 *
 * @returns {Grid} A new `Grid` object populated with empty cells.
 *
 * @see {@link Grid}
 * @see {@link createEmptyCell}
 *
 * @category Factories
 *
 * @example
 * const grid = createGrid(10, 6);
 *
 * // returns { width: 10, height: 6, cells: [...] }
 */
export const createGrid = (width: number, height: number): Grid => ({
	cells: Array.from({ length: height }, () =>
		Array.from({ length: width }, () => createEmptyCell())
	),
	height,
	width,
});

/**
 * Maps raw module data to the `Cell` structure used by the grid.
 *
 * @param {Module} moduleData - The raw module metadata.
 *
 * @returns {Cell} A populated `Cell` object.
 *
 * @example
 * ```typescript
 * const cell = createCellFromModuleData(rawModule);
 * ```
 */
const createCellFromModuleData = (moduleData: Module): Cell => {
	return {
		active: moduleData?.active !== false,
		adjacency: moduleData?.adjacency ?? "none",
		adjacency_bonus: moduleData?.adjacency_bonus ?? 0.0,
		bonus: moduleData?.bonus ?? 0.0,
		group_adjacent: false,
		image: moduleData?.image ?? null,
		label: moduleData?.label ?? "",
		module: moduleData?.id ?? null,
		sc_eligible: moduleData?.sc_eligible ?? false,
		supercharged: moduleData?.supercharged === true,
		tech: moduleData?.tech ?? null,
		total: 0.0,
		type: moduleData?.type ?? "",
		value: moduleData?.value ?? 0,
	};
};

/**
 * Resets a cell's module-specific content while preserving its structural state.
 *
 * Structural state includes whether the cell is `active` and whether it is `supercharged`.
 *
 * @param {Cell} cell - The cell object to modify in-place. **Will be mutated.**
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link Cell}
 * @see {@link createEmptyCell}
 *
 * @category Utilities
 *
 * @example
 * resetCellContent(grid.cells[0][0]);
 */
export const resetCellContent = (cell: Cell) => {
	const { active, supercharged } = cell;
	const emptyCell = createEmptyCell(supercharged, active);
	Object.assign(cell, emptyCell);
};

/**
 * Actions available to modify the grid state.
 *
 * @category Actions
 */
export interface GridActions {
	/** Activates all cells in the specified row. */
	activateRow: (rowIndex: number) => void;
	/** Batch applies modules to the grid by linear index. */
	applyModulesToGrid: (modules: (Module | null)[]) => void;
	/** Deactivates all cells in the specified row. */
	deActivateRow: (rowIndex: number) => void;
	/** Handles a second tap on a cell by toggling its supercharged state. */
	handleCellDoubleTap: (rowIndex: number, columnIndex: number) => void;
	/** Handles a single tap on a grid cell. */
	handleCellTap: (rowIndex: number, columnIndex: number) => void;
	/** Checks if a specific technology is currently present in the grid. */
	hasTechInGrid: (tech: string) => boolean;
	/** Checks if all active grid cells have a module assigned. */
	isGridFull: () => boolean;
	/** Resets the grid to its initial state or a blank grid. */
	resetGrid: () => void;
	/** Removes all modules of a specific technology from the grid. */
	resetGridTech: (tech: string) => void;
	/** Restores the entire grid state from a saved build. */
	restoreGridState: (savedState: Partial<GridStore>) => void;
	/** Restores a cell to its previous state, typically after an invalid tap. */
	revertCellTap: (rowIndex: number, columnIndex: number, originalState: Cell) => void;
	/** Returns the index of the first row containing only inactive cells. */
	selectFirstInactiveRowIndex: () => number;
	/** Returns true if any cell in the grid has a module. */
	selectHasModulesInGrid: () => boolean;
	/** Returns the index of the last row containing at least one active cell. */
	selectLastActiveRowIndex: () => number;
	/** Returns the total count of supercharged cells. */
	selectTotalSuperchargedCells: () => number;
	/** Updates the current build name. */
	setBuildName: (name: null | string) => void;
	/** Sets the active status of a specific cell. */
	setCellActive: (rowIndex: number, columnIndex: number, active: boolean) => void;
	/** Sets the supercharged status of a specific cell. */
	setCellSupercharged: (rowIndex: number, columnIndex: number, supercharged: boolean) => void;
	/** Replaces the entire grid object. */
	setGrid: (grid: Grid) => void;
	/** Toggles the grid layout lock. */
	setGridFixed: (fixed: boolean) => void;
	/** Builds the grid from an initial definition. */
	setGridFromInitialDefinition: (definition: {
		grid: Module[][];
		gridFixed: boolean;
		superchargedFixed: boolean;
	}) => void;
	/** Stores the initial definition for later resets. */
	setInitialGridDefinition: (
		definition: undefined | { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean }
	) => void;
	/** Marks the grid as being from a shared URL. */
	setIsSharedGrid: (isShared: boolean) => void;
	/** Updates the optimization result. */
	setResult: (result: ApiResponse | null) => void;
	/** Toggles the supercharged slot lock. */
	setSuperchargedFixed: (fixed: boolean) => void;
	/** Toggles the active status of a cell. */
	toggleCellActive: (rowIndex: number, columnIndex: number) => void;
	/** Toggles the supercharged status of a cell. */
	toggleCellSupercharged: (rowIndex: number, columnIndex: number) => void;
	/** Manually triggers recomputation of derived state. */
	triggerRecompute: () => void;
}

/**
 * Derived/computed state fields maintained internally for performance.
 *
 * @category State
 */
export interface GridComputed {
	/** Index of the first row where every cell is inactive, or -1. */
	_firstInactiveRowIndex: number;
	/** Whether any cell in the grid has a non-null module. */
	_hasModulesInGrid: boolean;
	/** Whether every active cell has a module assigned. */
	_isGridFull: boolean;
	/** Index of the last row containing at least one active cell, or -1. */
	_lastActiveRowIndex: number;
	/** Count of cells where `supercharged === true`. */
	_totalSuperchargedCells: number;
	/** Set of technology keys currently placed in at least one grid cell. */
	activeTechs: Set<string>;
}

/**
 * Publicly visible state of the technology grid.
 *
 * @category State
 */
export interface GridState {
	/** The name of the currently loaded build, if any. */
	buildName: null | string;
	/** The current 2D grid of cells. */
	grid: Grid;
	/** Whether the active layout of the grid is locked. */
	gridFixed: boolean;
	/** The default layout definition for the current ship type. */
	initialGridDefinition:
		| undefined
		| { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean };
	/** Whether the grid was populated from a shared URL. */
	isSharedGrid: boolean;
	/** The most recent optimization result from the server. */
	result: ApiResponse | null;
	/** Whether the locations of supercharged slots are locked. */
	superchargedFixed: boolean;
}

/**
 * Combined type for the grid store.
 */
export type GridStore = GridActions & GridComputed & GridState;

const debouncedStorage = {
	getItem: (name: string): null | StorageValue<Partial<GridStore>> => {
		try {
			if (typeof window !== "undefined" && window.localStorage) {
				const performCleanup = () => {
					try {
						const len = localStorage.length;
						const keysToRemove: string[] = [];

						for (let i = 0; i < len; i++) {
							const key = localStorage.key(i);

							if (key && key.startsWith("gridState") && key !== name) {
								keysToRemove.push(key);
							}
						}

						keysToRemove.forEach((key) => {
							safeRemoveItem(key);
						});
					} catch (e) {
						Logger.warn("GridStore: Failed to enumerate localStorage keys.", {
							error: e,
						});
					}
				};

				if ("requestIdleCallback" in window) {
					window.requestIdleCallback(performCleanup, { timeout: 2000 });
				} else {
					setTimeout(performCleanup, 500);
				}
			}

			const storedData = safeGetItem(name);

			if (!storedData) {
				return null;
			}

			let parsedData: StorageValue<Partial<GridStore> & { selectedPlatform?: string }>;

			try {
				parsedData = JSON.parse(storedData) as StorageValue<
					Partial<GridStore> & { selectedPlatform?: string }
				>;
			} catch (parseError) {
				Logger.error(
					`GridStore: Failed to parse stored data for key "${name}". Data may be corrupted.`,
					parseError
				);

				return null;
			}

			const currentPlatform = resolveInitialPlatform();
			const storedGridPlatform = parsedData.state?.selectedPlatform;

			if (storedGridPlatform && storedGridPlatform !== currentPlatform) {
				Logger.warn(
					`GridStore: Discarding stored grid due to platform mismatch. Stored: ${storedGridPlatform}, Current: ${currentPlatform}`
				);

				return null;
			}

			return parsedData;
		} catch (e) {
			Logger.error("Failed to load from localStorage:", e);

			return null;
		}
	},

	removeItem: (name: string): void => {
		safeRemoveItem(name);
	},

	setItem: debounceSetItem((name: string, value: StorageValue<Partial<GridStore>>) => {
		try {
			const storageValue = JSON.stringify(value);
			const success = safeSetItem(name, storageValue);

			return success ? Promise.resolve() : Promise.reject(new Error("Storage blocked"));
		} catch (e) {
			Logger.error("Failed to save to localStorage:", e);

			if (e instanceof Error) {
				return Promise.reject(e);
			}

			return Promise.reject(new Error(String(e)));
		}
	}, 1000),
};

/**
 * Returns the search property of the window's location object.
 *
 * @returns {string} The search property of the window's location object, or an empty string if the window or location are not defined.
 *
 * @example
 * ```typescript
 * const search = getWindowSearch(); // returns "?grid=..." or ""
 * ```
 */
const getWindowSearch = () =>
	typeof window === "undefined" || !window.location ? "" : window.location.search;

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
		immer((set, get) => {
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
				if (!state.grid) {
					state.activeTechs = new Set();
					state._isGridFull = false;
					state._totalSuperchargedCells = 0;
					state._hasModulesInGrid = false;
					state._firstInactiveRowIndex = 0;
					state._lastActiveRowIndex = -1;

					return;
				}

				const { cells } = state.grid;

				if (!cells) {
					state.activeTechs = new Set();
					state._isGridFull = false;
					state._totalSuperchargedCells = 0;
					state._hasModulesInGrid = false;
					state._firstInactiveRowIndex = 0;
					state._lastActiveRowIndex = -1;

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
				state._totalSuperchargedCells = superchargedCount;
				state._hasModulesInGrid = hasModules;
				state._isGridFull = activeCount > 0 && activeCount === activeWithModuleCount;
				state._firstInactiveRowIndex = firstInactiveRow;
				state._lastActiveRowIndex = lastActiveRow;
			};

			return {
				_firstInactiveRowIndex: 0,
				_hasModulesInGrid: false,
				_isGridFull: false,
				_lastActiveRowIndex: -1,
				_totalSuperchargedCells: 0,
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
										adjacency_bonus: m.adjacency_bonus ?? cell.adjacency_bonus,
										bonus: m.bonus ?? cell.bonus,
										group_adjacent: m.group_adjacent ?? cell.group_adjacent,
										image: m.image ?? cell.image,
										label: m.label ?? cell.label,
										module: m.id ?? cell.module,
										sc_eligible: m.sc_eligible ?? cell.sc_eligible,
										supercharged: m.supercharged ?? cell.supercharged,
										tech: m.tech ?? cell.tech,
										type: m.type ?? cell.tech, // Default type to tech if missing
										value: m.value ?? cell.value,
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

				hasTechInGrid: (tech: string): boolean => {
					return get().activeTechs.has(tech);
				},

				initialGridDefinition: undefined,

				isGridFull: (): boolean => {
					return get()._isGridFull;
				},

				isSharedGrid: new URLSearchParams(getWindowSearch()).has("grid"),

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

				selectFirstInactiveRowIndex: () => {
					return get()._firstInactiveRowIndex;
				},

				selectHasModulesInGrid: () => {
					return get()._hasModulesInGrid;
				},

				selectLastActiveRowIndex: () => {
					return get()._lastActiveRowIndex;
				},

				selectTotalSuperchargedCells: () => {
					return get()._totalSuperchargedCells;
				},

				setBuildName: (name) => set({ buildName: name }),

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
							if (cell.active || !supercharged) cell.supercharged = supercharged;
						}

						recomputeDerivedState(state);
					});
				},

				setGrid: (grid) =>
					set((state) => {
						state.grid = grid;
						recomputeDerivedState(state);
					}),

				setGridFixed: (fixed) => set({ gridFixed: fixed }),

				setGridFromInitialDefinition: (definition) => {
					set((state) => {
						applyGridDefinition(state, definition);
						recomputeDerivedState(state);
					});
				},

				setInitialGridDefinition: (definition) =>
					set({ initialGridDefinition: definition }),

				setIsSharedGrid: (isShared) => set({ isSharedGrid: isShared }),

				setResult: (result) => {
					set((state) => {
						state.result = result;
					});
				},
				setSuperchargedFixed: (fixed) => set({ superchargedFixed: fixed }),
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
				const currentUrlHasGrid = new URLSearchParams(getWindowSearch()).has("grid");

				return {
					...currentState,
					...stateFromStorage,
					initialGridDefinition:
						stateFromStorage.initialGridDefinition ||
						currentState.initialGridDefinition,
					isSharedGrid: currentUrlHasGrid,
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
					selectedPlatform: usePlatformStore.getState().selectedPlatform,
					superchargedFixed: state.superchargedFixed,
				};

				return dataToPersist;
			},
			storage: debouncedStorage,
		}
	)
);

// Always expose for E2E if the flag is set, using a method that survives minification
if (typeof window !== "undefined") {
	const w = window as typeof window & {
		__E2E_EXPOSE__?: boolean;
		handleCellDoubleTap?: (row: number, col: number) => void;
		useGridStore?: typeof useGridStore;
	};

	if (import.meta.env.VITE_E2E_TESTING || w.__E2E_EXPOSE__) {
		w["useGridStore"] = useGridStore;
		w["handleCellDoubleTap"] = useGridStore.getState().handleCellDoubleTap;
	}
}
