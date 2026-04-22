import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { type Module } from "../../hooks/useTechTree/useTechTree";
import { safeGetItem, safeRemoveItem, safeSetItem } from "../../utils/browser/environment";
import { usePlatformStore } from "../app/platformStore";
import { useModuleSelectionStore } from "../tech/moduleSelectionStore";
import { useTechBonusStore } from "../tech/techBonusStore";
import { useTechStore } from "../tech/techStore";

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
 * await debouncedSet("myKey", { state: { ... }, version: 1 });
 * ```
 */
function debounceSetItem(
	setItemFn: SetItemFunction,
	msToWait: number
): (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void> {
	let timeoutId: number | null = null;

	return (name: string, value: StorageValue<Partial<GridStore>>): Promise<void> => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = window.setTimeout(() => {
			void (async () => {
				try {
					await setItemFn(name, value);
				} catch (e) {
					console.error("Failed to save to localStorage", e);
				}
			})();
		}, msToWait);

		return Promise.resolve();
	};
}

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
	/** Optional icon path/URL for the module. */
	image: string | null;
	/** The unique ID of the module currently placed in this cell. */
	module: string | null;
	/** Display label for the module. */
	label: string;
	/** Whether this cell is allowed to be supercharged. */
	sc_eligible: boolean;
	/** Whether the cell is currently supercharged. */
	supercharged: boolean;
	/** Whether the cell belongs to an adjacency grouping. */
	group_adjacent: boolean;
	/** The technology category key (e.g., `'pulse'`). */
	tech: string | null;
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
	/** The number of columns in the grid. */
	width: number;
	/** Whether the grid configuration is valid (e.g. no overlapping modules). */
	valid?: boolean;
};

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
	/** The actual bonus achieved by the solver. */
	solved_bonus: number;
	/** The identifier of the solver method used (e.g., `'SA'`, `'Pattern'`). */
	solve_method: string;
};

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
	image: null,
	module: null,
	label: "",
	sc_eligible: false,
	supercharged: supercharged,
	group_adjacent: false,
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
	width,
	height,
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
		image: moduleData?.image ?? null,
		module: moduleData?.id ?? null,
		label: moduleData?.label ?? "",
		sc_eligible: moduleData?.sc_eligible ?? false,
		supercharged: moduleData?.supercharged === true,
		group_adjacent: false,
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
 * State and actions for the technology grid store.
 *
 * @category State
 */
export type GridStore = {
	/** Version of the persisted state schema. */
	version: number;
	/** The current 2D grid of cells. */
	grid: Grid;
	/** The most recent optimization result from the server. */
	result: ApiResponse | null;
	/** Whether the grid was populated from a shared URL. */
	isSharedGrid: boolean;
	/** The name of the currently loaded build, if any. */
	buildName: string | null;
	/** Whether the active layout of the grid is locked. */
	gridFixed: boolean;
	/** Whether the locations of supercharged slots are locked. */
	superchargedFixed: boolean;
	/** The default layout definition for the current ship type. */
	initialGridDefinition:
		| { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean }
		| undefined;

	/** Internal state tracking for tap/double-tap logic. */
	_initialCellStateForTap?: Cell | null;

	/**
	 * Updates the `isSharedGrid` status.
	 *
	 * @param {boolean} isShared - Whether the current grid is from a share URL.
	 */
	setIsSharedGrid: (isShared: boolean) => void;
	/**
	 * Updates the `buildName` status.
	 *
	 * @param {string | null} name - The name of the loaded build.
	 */
	setBuildName: (name: string | null) => void;
	/**
	 * Updates the entire grid object.
	 *
	 * @param {Grid} grid - The new grid state.
	 */
	setGrid: (grid: Grid) => void;
	/** Resets the grid to its initial state, clearing all modules and results. */
	resetGrid: () => void;
	/** Sets a new grid and purges auxiliary results/selections. Used when switching ships. */
	setGridAndResetAuxiliaryState: (newGrid: Grid) => void;
	/** Updates the optimization result and synchronizes tech-specific stats. */
	setResult: (result: ApiResponse | null, tech: string) => void;

	/** Handles a single tap on a grid cell. */
	handleCellTap: (rowIndex: number, columnIndex: number) => void;
	/** Handles a double tap on a grid cell. */
	handleCellDoubleTap: (rowIndex: number, columnIndex: number) => void;
	/** Restores a cell to its state prior to a tap interaction. */
	revertCellTap: (rowIndex: number, columnIndex: number) => void;
	/** Clears the temporary interaction state. */
	clearInitialCellStateForTap: () => void;

	/** Toggles the `active` status of a cell. */
	toggleCellActive: (rowIndex: number, columnIndex: number) => void;
	/** Toggles the `supercharged` status of a cell. */
	toggleCellSupercharged: (rowIndex: number, columnIndex: number) => void;
	/** Sets the `active` status of a cell explicitly. */
	setCellActive: (rowIndex: number, columnIndex: number, active: boolean) => void;
	/** Sets the `supercharged` status of a cell explicitly. */
	setCellSupercharged: (rowIndex: number, columnIndex: number, supercharged: boolean) => void;

	/** Activates all cells in the specified row. */
	activateRow: (rowIndex: number) => void;
	/** Deactivates all cells in the specified row. */
	deActivateRow: (rowIndex: number) => void;

	/** Checks if a specific technology is currently present in the grid. */
	hasTechInGrid: (tech: string) => boolean;
	/** Checks if all active grid cells have a module assigned. */
	isGridFull: () => boolean;
	/** Removes all modules of a specific technology from the grid. */
	resetGridTech: (tech: string) => void;

	/** Returns the total count of supercharged cells. */
	selectTotalSuperchargedCells: () => number;
	/** Returns true if any cell in the grid has a module. */
	selectHasModulesInGrid: () => boolean;
	/** Returns the index of the first row containing only inactive cells. */
	selectFirstInactiveRowIndex: () => number;
	/** Returns the index of the last row containing at least one active cell. */
	selectLastActiveRowIndex: () => number;

	/** Toggles the grid layout lock. */
	setGridFixed: (fixed: boolean) => void;
	/** Toggles the supercharged slot lock. */
	setSuperchargedFixed: (fixed: boolean) => void;
	/** Stores the default grid definition for the current ship. */
	setInitialGridDefinition: (
		definition: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean } | undefined
	) => void;
	/** Builds and sets the grid state from a static definition. */
	setGridFromInitialDefinition: (definition: {
		grid: Module[][];
		gridFixed: boolean;
		superchargedFixed: boolean;
	}) => void;
	/** Batch applies modules to the grid by linear index. */
	applyModulesToGrid: (modules: (Module | null)[]) => void;
};

const debouncedStorage = {
	setItem: debounceSetItem((name: string, value: StorageValue<Partial<GridStore>>) => {
		try {
			const storageValue = JSON.stringify(value);
			const success = safeSetItem(name, storageValue);

			return success ? Promise.resolve() : Promise.reject(new Error("Storage blocked"));
		} catch (e) {
			console.error("Failed to save to localStorage:", e);

			if (e instanceof Error) {
				return Promise.reject(e);
			}

			return Promise.reject(new Error(String(e)));
		}
	}, 1000),

	getItem: (name: string): StorageValue<Partial<GridStore>> | null => {
		try {
			if (typeof window !== "undefined" && window.localStorage) {
				const performCleanup = () => {
					try {
						const len = localStorage.length;
						const keysToRemove: string[] = [];

						for (let i = 0; i < len; i++) {
							const key = localStorage.key(i);

							if (key && key.startsWith("app-state") && key !== name) {
								keysToRemove.push(key);
							}
						}

						keysToRemove.forEach((key) => {
							console.log(`GridStore: Removing old app-state key: ${key}`);
							safeRemoveItem(key);
						});
					} catch (e) {
						console.warn("GridStore: Failed to enumerate localStorage keys.", e);
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
				console.log(`GridStore: No stored data found for key: ${name}`);

				return null;
			}

			let parsedData: StorageValue<Partial<GridStore> & { selectedPlatform?: string }>;

			try {
				parsedData = JSON.parse(storedData) as StorageValue<
					Partial<GridStore> & { selectedPlatform?: string }
				>;
			} catch (parseError) {
				console.error(
					`GridStore: Failed to parse stored data for key "${name}". Data may be corrupted.`,
					parseError instanceof Error ? parseError.message : String(parseError)
				);

				return null;
			}

			const urlParams = new URLSearchParams(getWindowSearch());
			const platformFromUrl = urlParams.get("platform");
			const platformFromStorage = safeGetItem("selectedPlatform");
			const currentPlatform = platformFromUrl || platformFromStorage || "standard";
			const storedGridPlatform = parsedData.state?.selectedPlatform;

			if (storedGridPlatform && storedGridPlatform !== currentPlatform) {
				console.warn(
					`GridStore: Discarding stored grid due to platform mismatch. Stored: ${storedGridPlatform}, Current: ${currentPlatform}`
				);

				return null;
			}

			return parsedData;
		} catch (e) {
			console.error("Failed to load from localStorage:", e);

			return null;
		}
	},

	removeItem: (name: string): void => {
		safeRemoveItem(name);
	},
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

			return {
				version: 1, // Initialize version to 1
				grid: createGrid(10, 6),
				result: null,
				isSharedGrid: new URLSearchParams(getWindowSearch()).has("grid"),
				buildName: null,
				gridFixed: false,
				superchargedFixed: false,
				initialGridDefinition: undefined,
				_initialCellStateForTap: null,

				setIsSharedGrid: (isShared) => set({ isSharedGrid: isShared }),

				setBuildName: (name) => set({ buildName: name }),

				setGrid: (grid) => set({ grid }),

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
					});
					useTechStore.getState().clearResult();
					useTechStore.getState().clearAllCheckedModules();
					useTechBonusStore.getState().clearAllBonusStatus();
					useModuleSelectionStore.getState().clearAllModuleSelections();
					// Clear persisted storage
					safeRemoveItem("techBonusState");
					safeRemoveItem("moduleSelectionState");
				},

				setGridAndResetAuxiliaryState: (newGrid) => {
					set((state) => {
						state.grid = newGrid;
						state.result = null;
						state.isSharedGrid = false;
						state.buildName = null;
					});
					useTechStore.getState().clearResult();
					useTechStore.getState().clearTechGroups();
					useTechBonusStore.getState().clearAllBonusStatus();
					useModuleSelectionStore.getState().clearAllModuleSelections();
					// Clear persisted storage when user explicitly switches ship types
					safeRemoveItem("techBonusState");
					safeRemoveItem("moduleSelectionState");
				},

				setResult: (result, tech) => {
					const { setTechMaxBonus, setTechSolvedBonus, setTechSolveMethod } =
						useTechStore.getState();
					set((state) => {
						state.result = result;
					});

					if (result) {
						setTechMaxBonus(tech, result.max_bonus);
						setTechSolvedBonus(tech, result.solved_bonus);
						setTechSolveMethod(tech, result.solve_method);
					}
				},

				handleCellTap: (rowIndex: number, columnIndex: number) => {
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (cell) {
							state._initialCellStateForTap = { ...cell };
							cell.active = !cell.active;

							if (!cell.active) {
								cell.supercharged = false;
							}
						}
					});
				},

				handleCellDoubleTap: (rowIndex: number, columnIndex: number) => {
					set((state) => {
						const initialCellState = state._initialCellStateForTap;
						const currentCell = state.grid.cells[rowIndex]?.[columnIndex];

						if (initialCellState && currentCell) {
							currentCell.supercharged = !initialCellState.supercharged;
							currentCell.active = true;
						}

						state._initialCellStateForTap = null;
					});
				},

				revertCellTap: (rowIndex: number, columnIndex: number) => {
					set((state) => {
						const initialCellState = state._initialCellStateForTap;
						const currentCell = state.grid.cells[rowIndex]?.[columnIndex];

						if (initialCellState && currentCell) {
							currentCell.active = initialCellState.active;
							currentCell.supercharged = initialCellState.supercharged;
						}

						state._initialCellStateForTap = null;
					});
				},

				clearInitialCellStateForTap: () => {
					set((state) => {
						state._initialCellStateForTap = null;
					});
				},

				toggleCellActive: (rowIndex, columnIndex) => {
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (cell.supercharged) {
							cell.supercharged = !cell.supercharged;
						}

						if (cell && (!cell.active || !cell.module)) {
							cell.active = !cell.active;
						} else {
							console.error(`Cell not found at [${rowIndex}, ${columnIndex}]`);
						}
					});
				},

				toggleCellSupercharged: (rowIndex, columnIndex) =>
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (!cell) {
							console.error(`Cell not found at [${rowIndex}, ${columnIndex}]`);

							return;
						}

						if (!cell.active) {
							cell.active = true;
						}

						cell.supercharged = !cell.supercharged;
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
					});
				},

				setCellSupercharged: (rowIndex, columnIndex, supercharged) => {
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (cell) {
							if (cell.active || !supercharged) cell.supercharged = supercharged;
						}
					});
				},

				activateRow: (rowIndex: number) => {
					set((state) => {
						if (state.grid.cells[rowIndex]) {
							state.grid.cells[rowIndex].forEach((cell: Cell) => {
								cell.active = true;
							});
						}
					});
				},

				deActivateRow: (rowIndex: number) => {
					set((state) => {
						if (state.grid.cells[rowIndex]) {
							state.grid.cells[rowIndex].forEach((cell: Cell) => {
								cell.active = false;
								cell.supercharged = false;
							});
						}
					});
				},

				hasTechInGrid: (tech: string): boolean => {
					const grid = get().grid;

					return grid.cells.some((row) => row.some((cell) => cell.tech === tech));
				},

				isGridFull: (): boolean => {
					const grid = get().grid;
					if (!grid || !grid.cells) return false;

					const activeCells = grid.cells.flat().filter((cell) => cell.active);

					if (activeCells.length === 0) {
						return false;
					}

					return activeCells.every((cell) => cell.module !== null);
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
					});
				},

				selectTotalSuperchargedCells: () => {
					const grid = get().grid;
					if (!grid || !grid.cells) return 0;

					return grid.cells.reduce(
						(total, row) =>
							total +
							row.reduce((count, cell) => count + (cell.supercharged ? 1 : 0), 0),
						0
					);
				},

				selectHasModulesInGrid: () => {
					const grid = get().grid;
					if (!grid || !grid.cells) return false;

					return grid.cells.some((row) => row.some((cell) => cell.module !== null));
				},

				selectFirstInactiveRowIndex: () => {
					const grid = get().grid;
					if (!grid || !grid.cells) return 0;

					return grid.cells.findIndex((r) => r.every((cell) => !cell.active));
				},

				selectLastActiveRowIndex: () => {
					const grid = get().grid;
					if (!grid || !grid.cells) return -1;

					return grid.cells.map((r) => r.some((cell) => cell.active)).lastIndexOf(true);
				},

				setGridFixed: (fixed) => set({ gridFixed: fixed }),
				setSuperchargedFixed: (fixed) => set({ superchargedFixed: fixed }),
				setInitialGridDefinition: (definition) =>
					set({ initialGridDefinition: definition }),

				setGridFromInitialDefinition: (definition) => {
					set((state) => {
						applyGridDefinition(state, definition);
					});
				},

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
										image: m.image ?? cell.image,
										module: m.id ?? cell.module,
										label: m.label ?? cell.label,
										sc_eligible: m.sc_eligible ?? cell.sc_eligible,
										supercharged: m.supercharged ?? cell.supercharged,
										group_adjacent: m.group_adjacent ?? cell.group_adjacent,
										tech: m.tech ?? cell.tech,
										type: m.type ?? cell.type,
										value: m.value ?? cell.value,
									});
								} else {
									resetCellContent(cell);
								}
							}
						});
					});
				},
			};
		}),
		{
			name: "gridState",
			version: 1, // Current version of the storage schema
			storage: debouncedStorage,
			partialize: (state) => {
				const dataToPersist = {
					grid: state.grid,
					isSharedGrid: state.isSharedGrid,
					buildName: state.buildName,
					gridFixed: state.gridFixed,
					superchargedFixed: state.superchargedFixed,
					initialGridDefinition: state.initialGridDefinition,
					selectedPlatform: usePlatformStore.getState().selectedPlatform,
				};

				return dataToPersist;
			},
			migrate: (persistedState: unknown, version: number) => {
				const state = persistedState as Partial<GridStore>;

				if (version === 0) {
					return state;
				}

				return state;
			},
			merge: (persistedState, currentState) => {
				const stateFromStorage = persistedState as Partial<GridStore>;
				const currentUrlHasGrid = new URLSearchParams(getWindowSearch()).has("grid");

				return {
					...currentState,
					...stateFromStorage,
					isSharedGrid: currentUrlHasGrid,
					initialGridDefinition:
						stateFromStorage.initialGridDefinition ||
						currentState.initialGridDefinition,
				};
			},
		}
	)
);

// Always expose for E2E if the flag is set, using a method that survives minification
if (typeof window !== "undefined") {
	const w = window as typeof window & {
		__E2E_EXPOSE__?: boolean;
		useGridStore?: typeof useGridStore;
		handleCellDoubleTap?: (row: number, col: number) => void;
	};

	if (import.meta.env.VITE_E2E_TESTING || w.__E2E_EXPOSE__) {
		w["useGridStore"] = useGridStore;
		w["handleCellDoubleTap"] = useGridStore.getState().handleCellDoubleTap;
	}
}
