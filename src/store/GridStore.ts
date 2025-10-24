import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { type Module } from "../hooks/useTechTree/useTechTree";
import { usePlatformStore } from "./PlatformStore";
import { useTechStore } from "./TechStore";

type SetItemFunction = (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void>;

/**
 * Creates a debounced version of a setItem function.
 *
 * @param setItemFn The function to debounce.
 * @param msToWait The number of milliseconds to wait before invoking the function.
 * @returns A debounced version of the setItem function.
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
 * Represents a single cell in the grid.
 * @typedef {object} Cell
 * @property {boolean} active - Whether the cell is active and part of the grid.
 * @property {string} adjacency - Adjacency bonus type.
 * @property {number} adjacency_bonus - The bonus from adjacent modules.
 * @property {number} bonus - The base bonus of the module.
 * @property {string|null} image - The image of the module.
 * @property {string|null} module - The ID of the module in the cell.
 * @property {string} label - The label of the module.
 * @property {boolean} sc_eligible - Whether the module is eligible for a supercharged bonus.
 * @property {boolean} supercharged - Whether the cell is supercharged.
 * @property {string|null} tech - The technology type of the module.
 * @property {number} total - The total bonus of the cell.
 * @property {string} type - The type of the module.
 * @property {number} value - The value of the module.
 */
export type Cell = {
	active: boolean;
	adjacency: string;
	adjacency_bonus: number;
	bonus: number;
	image: string | null;
	module: string | null;
	label: string;
	sc_eligible: boolean;
	supercharged: boolean;
	tech: string | null;
	total: number;
	type: string;
	value: number;
};

/**
 * Represents the entire grid.
 * @typedef {object} Grid
 * @property {Cell[][]} cells - A 2D array of cells.
 * @property {number} height - The height of the grid.
 * @property {number} width - The width of the grid.
 */
export type Grid = {
	cells: Cell[][];
	height: number;
	width: number;
};

/**
 * Represents the response from the optimization API.
 * @typedef {object} ApiResponse
 * @property {Grid|null} grid - The optimized grid.
 * @property {number} max_bonus - The maximum possible bonus.
 * @property {number} solved_bonus - The bonus of the solved grid.
 * @property {string} solve_method - The method used to solve the grid.
 */
export type ApiResponse = {
	grid: Grid | null;
	max_bonus: number;
	solved_bonus: number;
	solve_method: string;
};

/**
 * Creates an empty cell.
 *
 * @param {boolean} [supercharged=false] - Whether the cell should be supercharged.
 * @param {boolean} [active=false] - Whether the cell should be active.
 * @returns {Cell} The created empty cell.
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
	tech: null,
	total: 0.0,
	type: "",
	value: 0,
});

/**
 * Creates a grid of a given width and height.
 *
 * @param {number} width - The width of the grid.
 * @param {number} height - The height of the grid.
 * @returns {Grid} The created grid.
 */
export const createGrid = (width: number, height: number): Grid => ({
	cells: Array.from({ length: height }, () =>
		Array.from({ length: width }, () => createEmptyCell())
	),
	width,
	height,
});

/**
 * Creates a cell from module data.
 *
 * @param moduleData The module data to create the cell from.
 * @returns The created cell.
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
		tech: moduleData?.tech ?? null,
		total: 0.0,
		type: moduleData?.type ?? "",
		value: moduleData?.value ?? 0,
	};
};

/**
 * Resets the content of a cell to its empty state, preserving its active and supercharged status.
 *
 * @param {Cell} cell - The cell to reset.
 */
export const resetCellContent = (cell: Cell) => {
	const { active, supercharged } = cell;
	const emptyCell = createEmptyCell(supercharged, active);
	Object.assign(cell, emptyCell);
};

/**
 * @typedef {object} GridStore
 * @property {(rowIndex: number, columnIndex: number) => void} handleCellTap - Handles single tap on a cell, toggling its active state.
 * @property {(rowIndex: number, columnIndex: number) => void} handleCellDoubleTap - Handles double tap on a cell, toggling its supercharged state.
 * @property {(rowIndex: number, columnIndex: number) => void} revertCellTap - Reverts the last tap action on a cell to its initial state.
 * @property {() => void} clearInitialCellStateForTap - Clears the temporary initial cell state used for tap/double-tap logic.
 * @property {Cell|null} [_initialCellStateForTap] - Internal state: stores a cell's state before a tap to handle double-tap logic.
 * @property {number} version - The version of the store's schema, used for persistence migration.
 * @property {Grid} grid - The main grid object containing the state of all cells.
 * @property {ApiResponse|null} result - The API response from the last successful optimization.
 * @property {boolean} isSharedGrid - True if the current grid state was loaded from a shared URL.
 * @property {boolean} gridFixed - True if the grid's dimensions (active/inactive cells) are fixed.
 * @property {boolean} superchargedFixed - True if the locations of supercharged cells are fixed.
 * @property {{grid: Module[][], gridFixed: boolean, superchargedFixed: boolean}|undefined} initialGridDefinition - The initial grid layout definition, used for resetting.
 * @property {(grid: Grid) => void} setGrid - Action to directly set the entire grid state.
 * @property {() => void} resetGrid - Action to reset the grid to its initial definition or an empty state.
 * @property {(newGrid: Grid) => void} setGridAndResetAuxiliaryState - Action to set a new grid while also resetting related state like results.
 * @property {(result: ApiResponse|null, tech: string) => void} setResult - Action to set the optimization result and update related tech stats.
 * @property {(rowIndex: number) => void} activateRow - Action to activate all cells in a specific row.
 * @property {(rowIndex: number) => void} deActivateRow - Action to deactivate all cells in a specific row.
 * @property {(tech: string) => boolean} hasTechInGrid - Selector to check if a specific technology is present in the grid.
 * @property {() => boolean} isGridFull - Selector to check if all active cells in the grid are filled with modules.
 * @property {(tech: string) => void} resetGridTech - Action to remove all instances of a specific technology from the grid.
 * @property {(rowIndex: number, columnIndex: number) => void} toggleCellActive - Action to toggle the active state of a single cell.
 * @property {(rowIndex: number, columnIndex: number) => void} toggleCellSupercharged - Action to toggle the supercharged state of a single cell.
 * @property {(rowIndex: number, columnIndex: number, active: boolean) => void} setCellActive - Action to explicitly set the active state of a cell.
 * @property {(rowIndex: number, columnIndex: number, supercharged: boolean) => void} setCellSupercharged - Action to explicitly set the supercharged state of a cell.
 * @property {(isShared: boolean) => void} setIsSharedGrid - Action to set the `isSharedGrid` flag.
 * @property {(fixed: boolean) => void} setGridFixed - Action to set the `gridFixed` flag.
 * @property {(fixed: boolean) => void} setSuperchargedFixed - Action to set the `superchargedFixed` flag.
 * @property {(definition: {grid: Module[][], gridFixed: boolean, superchargedFixed: boolean}|undefined) => void} setInitialGridDefinition - Action to set the initial grid definition from a tech tree.
 * @property {(definition: {grid: Module[][], gridFixed: boolean, superchargedFixed: boolean}) => void} setGridFromInitialDefinition - Action to build the grid state from a given definition.
 * @property {() => number} selectTotalSuperchargedCells - Selector to get the total count of supercharged cells.
 * @property {() => boolean} selectHasModulesInGrid - Selector to check if any cell in the grid contains a module.
 * @property {(modules: Module[]) => void} applyModulesToGrid - Action to apply a list of modules to the grid, used for recommended builds.
 */
export type GridStore = {
	handleCellTap: (rowIndex: number, columnIndex: number) => void;
	handleCellDoubleTap: (rowIndex: number, columnIndex: number) => void;
	revertCellTap: (rowIndex: number, columnIndex: number) => void;
	clearInitialCellStateForTap: () => void;
	_initialCellStateForTap?: Cell | null;
	version: number; // Add version property
	grid: Grid;
	result: ApiResponse | null;
	isSharedGrid: boolean;
	gridFixed: boolean;
	superchargedFixed: boolean;
	initialGridDefinition:
		| { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean }
		| undefined;
	setGrid: (grid: Grid) => void;
	resetGrid: () => void;
	setGridAndResetAuxiliaryState: (newGrid: Grid) => void;
	setResult: (result: ApiResponse | null, tech: string) => void;
	activateRow: (rowIndex: number) => void;
	deActivateRow: (rowIndex: number) => void;
	hasTechInGrid: (tech: string) => boolean;
	isGridFull: () => boolean;
	resetGridTech: (tech: string) => void;
	toggleCellActive: (rowIndex: number, columnIndex: number) => void;
	toggleCellSupercharged: (rowIndex: number, columnIndex: number) => void;
	setCellActive: (rowIndex: number, columnIndex: number, active: boolean) => void;
	setCellSupercharged: (rowIndex: number, columnIndex: number, supercharged: boolean) => void;
	setIsSharedGrid: (isShared: boolean) => void;
	setGridFixed: (fixed: boolean) => void;
	setSuperchargedFixed: (fixed: boolean) => void;
	setInitialGridDefinition: (
		definition: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean } | undefined
	) => void;
	setGridFromInitialDefinition: (definition: {
		grid: Module[][];
		gridFixed: boolean;
		superchargedFixed: boolean;
	}) => void;
	selectTotalSuperchargedCells: () => number;
	selectHasModulesInGrid: () => boolean;
	selectFirstInactiveRowIndex: () => number;
	selectLastActiveRowIndex: () => number;
	applyModulesToGrid: (modules: (Module | null)[]) => void;
};

const debouncedStorage = {
	setItem: debounceSetItem((name: string, value: StorageValue<Partial<GridStore>>) => {
		try {
			const storageValue = JSON.stringify(value);
			localStorage.setItem(name, storageValue);
			return Promise.resolve();
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
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith("app-state") && key !== name) {
					console.log(`GridStore: Removing old app-state key: ${key}`);
					localStorage.removeItem(key);
				}
			}

			const storedData = localStorage.getItem(name);
			if (!storedData) {
				console.log(`GridStore: No stored data found for key: ${name}`);
				return null;
			}
			const parsedData = JSON.parse(storedData) as StorageValue<
				Partial<GridStore> & { selectedPlatform?: string }
			>;

			const urlParams = new URLSearchParams(getWindowSearch());
			const platformFromUrl = urlParams.get("platform");
			const platformFromStorage = localStorage.getItem("selectedPlatform");
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
		localStorage.removeItem(name);
	},
};

/**
 * Returns the search property of the window's location object.
 *
 * @returns The search property of the window's location object, or an empty string if the window or location are not defined.
 */
const getWindowSearch = () =>
	typeof window === "undefined" || !window.location ? "" : window.location.search;

/**
 * Zustand store for managing the state of the grid.
 *
 * @remarks
 * This store uses `immer` for immutable state updates and `persist` for saving the state to localStorage.
 */
export const useGridStore = create<GridStore>()(
	persist(
		immer((set, get) => {
			/**
			 * Applies a grid definition to the state.
			 *
			 * @param state The current state.
			 * @param definition The grid definition to apply.
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
				gridFixed: false,
				superchargedFixed: false,
				initialGridDefinition: undefined,
				_initialCellStateForTap: null,

				setIsSharedGrid: (isShared) => set({ isSharedGrid: isShared }),

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
					});
					useTechStore.getState().clearResult();
				},

				setGridAndResetAuxiliaryState: (newGrid) => {
					set((state) => {
						state.grid = newGrid;
						state.result = null;
						state.isSharedGrid = false;
					});
					useTechStore.getState().clearResult();
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
						const row = state.grid.cells[rowIndex];
						if (row) {
							for (let i = 0; i < row.length; i++) {
								const cell = row[i];
								if (cell) {
									cell.active = true;
								}
							}
						}
					});
				},

				deActivateRow: (rowIndex: number) => {
					set((state) => {
						const row = state.grid.cells[rowIndex];
						if (row) {
							for (let i = 0; i < row.length; i++) {
								const cell = row[i];
								if (cell) {
									cell.active = false;
									cell.supercharged = false;
								}
							}
						}
					});
				},

				hasTechInGrid: (tech: string): boolean => {
					const grid = get().grid;
					return grid.cells.some((row) => row.some((cell) => cell.tech === tech));
				},

				isGridFull: (): boolean => {
					const activeCells = get()
						.grid.cells.flat()
						.filter((cell) => cell.active);

					if (activeCells.length === 0) {
						return false;
					}

					return activeCells.every((cell) => cell.module !== null);
				},
				resetGridTech: (tech: string) => {
					set((state) => {
						state.grid.cells.forEach((row: Cell[]) => {
							row.forEach((cell: Cell) => {
								if (cell.tech === tech) resetCellContent(cell);
							});
						});
					});
				},

				selectTotalSuperchargedCells: () => {
					const grid = get().grid;
					if (!grid || !grid.cells) return 0;
					return grid.cells.flat().filter((c) => c.supercharged).length;
				},

				selectHasModulesInGrid: () => {
					const grid = get().grid;
					if (!grid || !grid.cells) return false;
					return grid.cells.flat().some((cell) => cell.module !== null);
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
									Object.assign(cell, {
										active: moduleData.active ?? cell.active,
										adjacency: moduleData.adjacency ?? cell.adjacency,
										adjacency_bonus:
											moduleData.adjacency_bonus ?? cell.adjacency_bonus,
										bonus: moduleData.bonus ?? cell.bonus,
										image: moduleData.image ?? cell.image,
										module: moduleData.id ?? cell.module,
										label: moduleData.label ?? cell.label,
										sc_eligible: moduleData.sc_eligible ?? cell.sc_eligible,
										supercharged: moduleData.supercharged ?? cell.supercharged,
										tech: moduleData.tech ?? cell.tech,
										type: moduleData.type ?? cell.type,
										value: moduleData.value ?? cell.value,
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

if (import.meta.env.VITE_E2E_TESTING) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - for e2e testing
	window.useGridStore = useGridStore;
	// @ts-expect-error - For e2e testing
	window.handleCellDoubleTap = useGridStore.getState().handleCellDoubleTap;
}
