import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { type Module } from "../hooks/useTechTree/useTechTree";
import { usePlatformStore } from "./PlatformStore";
import { useTechStore } from "./TechStore";

type SetItemFunction = (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void>;

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
 * @property {(rowIndex: number, columnIndex: number) => void} handleCellTap - Handles tapping on a cell.
 * @property {(rowIndex: number, columnIndex: number) => void} handleCellDoubleTap - Handles double tapping on a cell.
 * @property {(rowIndex: number, columnIndex: number) => void} revertCellTap - Reverts the last tap on a cell.
 * @property {() => void} clearInitialCellStateForTap - Clears the initial cell state for a tap.
 * @property {Cell|null} [_initialCellStateForTap] - The initial state of a cell before a tap.
 * @property {number} version - The version of the store.
 * @property {Grid} grid - The current grid state.
 * @property {ApiResponse|null} result - The result of the last optimization.
 * @property {boolean} isSharedGrid - Whether the grid is from a shared link.
 * @property {boolean} gridFixed - Whether the grid layout is fixed.
 * @property {boolean} superchargedFixed - Whether the supercharged cells are fixed.
 * @property {{grid: Module[][], gridFixed: boolean, superchargedFixed: boolean}|undefined} initialGridDefinition - The initial definition of the grid.
 * @property {(grid: Grid) => void} setGrid - Sets the grid state.
 * @property {() => void} resetGrid - Resets the grid to its initial state.
 * @property {(newGrid: Grid) => void} setGridAndResetAuxiliaryState - Sets the grid and resets auxiliary state.
 * @property {(result: ApiResponse|null, tech: string) => void} setResult - Sets the result of an optimization.
 * @property {(rowIndex: number) => void} activateRow - Activates a row of cells.
 * @property {(rowIndex: number) => void} deActivateRow - Deactivates a row of cells.
 * @property {(tech: string) => boolean} hasTechInGrid - Checks if a technology is in the grid.
 * @property {() => boolean} isGridFull - Checks if the grid is full.
 * @property {(tech: string) => void} resetGridTech - Resets the technology in the grid.
 * @property {(rowIndex: number, columnIndex: number) => void} toggleCellActive - Toggles the active state of a cell.
 * @property {(rowIndex: number, columnIndex: number) => void} toggleCellSupercharged - Toggles the supercharged state of a cell.
 * @property {(rowIndex: number, columnIndex: number, active: boolean) => void} setCellActive - Sets the active state of a cell.
 * @property {(rowIndex: number, columnIndex: number, supercharged: boolean) => void} setCellSupercharged - Sets the supercharged state of a cell.
 * @property {(isShared: boolean) => void} setIsSharedGrid - Sets whether the grid is from a shared link.
 * @property {(fixed: boolean) => void} setGridFixed - Sets whether the grid layout is fixed.
 * @property {(fixed: boolean) => void} setSuperchargedFixed - Sets whether the supercharged cells are fixed.
 * @property {(definition: {grid: Module[][], gridFixed: boolean, superchargedFixed: boolean}|undefined) => void} setInitialGridDefinition - Sets the initial definition of the grid.
 * @property {(definition: {grid: Module[][], gridFixed: boolean, superchargedFixed: boolean}) => void} setGridFromInitialDefinition - Sets the grid from an initial definition.
 * @property {() => number} selectTotalSuperchargedCells - Selects the total number of supercharged cells.
 * @property {() => boolean} selectHasModulesInGrid - Selects whether the grid has modules.
 * @property {(modules: Module[]) => void} applyModulesToGrid - Applies a list of modules to the grid.
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
	applyModulesToGrid: (modules: Module[]) => void;
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
