// src/store/GridStore.ts
import { create } from "zustand";
import { persist, type StorageValue } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { useTechStore } from "./TechStore";
import { usePlatformStore } from "./PlatformStore";
import { type Module } from "../hooks/useTechTree.tsx";

// --- Define the specific function type we are debouncing ---
type SetItemFunction = (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void>;

/**
 * Creates a debounced version of the specific setItem function that delays
 * calling the original function until `msToWait` milliseconds have passed
 * since the last time the debounced function was called.
 *
 * This is useful for debouncing the storage of the grid state to prevent
 * excessive writes to the browser's storage.
 *
 * @param {SetItemFunction} setItemFn The specific setItem function to debounce
 * @param {number} msToWait The number of milliseconds to wait
 * @returns {(name: string, value: StorageValue<Partial<GridStore>>) => Promise<void>} A debounced version of the setItem function
 */
function debounceSetItem(
	setItemFn: SetItemFunction,
	msToWait: number
): (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void> {
	let timeoutId: number | null = null;

	return (name: string, value: StorageValue<Partial<GridStore>>): Promise<void> => {
		return new Promise<void>((resolve, reject) => {
			// Cancel the existing timeout if it exists
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
			}

			// Set a new timeout for the wait period
			timeoutId = window.setTimeout(() => {
				// Use an async IIFE and apply `void` to its result to ensure
				// the function passed to setTimeout effectively returns void.
				void (async () => {
					try {
						await setItemFn(name, value);
						resolve(); // Resolve the outer promise when the debounced function completes
					} catch (e) {
						// Ensure that an Error object is rejected
						if (e instanceof Error) {
							reject(e);
						} else {
							reject(new Error(String(e)));
						}
					}
				})();
			}, msToWait);
		});
	};
}

// --- Define types (Cell, Grid, ApiResponse) ---
export type Cell = {
	active: boolean;
	adjacency: boolean;
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

export type Grid = {
	cells: Cell[][];
	height: number;
	width: number;
};

export type ApiResponse = {
	grid: Grid | null; // Grid can be null if "Pattern No Fit"
	max_bonus: number;
	solved_bonus: number;
	solve_method: string;
};

// --- Utility functions (createEmptyCell, createGrid) ---
export const createEmptyCell = (supercharged = false, active = true): Cell => ({
	active,
	adjacency: false,
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

export const createGrid = (width: number, height: number): Grid => ({
	cells: Array.from({ length: height }, () =>
		Array.from({ length: width }, () => createEmptyCell())
	),
	width,
	height,
});

// --- Zustand Store Interface (GridStore) ---
export type GridStore = {
	grid: Grid;
	result: ApiResponse | null;
	isSharedGrid: boolean;
	gridFixed: boolean;
	superchargedFixed: boolean;
	initialGridDefinition: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean; } | undefined;
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
	setInitialGridDefinition: (definition: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean; } | undefined) => void;
	setGridFromInitialDefinition: (definition: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean; }) => void;
	selectTotalSuperchargedCells: () => number;
	selectHasModulesInGrid: () => boolean;
	applyModulesToGrid: (modules: Module[]) => void;
};

// --- Create Debounced Storage ---
const debouncedStorage = {
	// Use the specific debounceSetItem function
	setItem: debounceSetItem(
		(name: string, value: StorageValue<Partial<GridStore>>) => {
			try {
				const storageValue = JSON.stringify(value);
				localStorage.setItem(name, storageValue);
				return Promise.resolve();
			} catch (e) {
				console.error("Failed to save to localStorage:", e);
				// Ensure that an Error object is rejected
				if (e instanceof Error) {
					return Promise.reject(e);
				}
				return Promise.reject(new Error(String(e)));
			}
		},
		500
	),

	getItem: (name: string): StorageValue<Partial<GridStore>> | null => {
		try {
			const storedData = localStorage.getItem(name);
			if (!storedData) {
				console.log(`GridStore: No stored data found for key: ${name}`);
				return null;
			}
			const parsedData = JSON.parse(storedData) as StorageValue<Partial<GridStore> & { selectedPlatform?: string }>;

			// Get the current platform from the PlatformStore
			const currentPlatform = usePlatformStore.getState().selectedPlatform;
			console.log("GridStore: Current platform from PlatformStore:", currentPlatform);

			// Check if the stored platform matches the current platform
			if (parsedData.state && parsedData.state.selectedPlatform && parsedData.state.selectedPlatform !== currentPlatform) {
				console.warn(
					`GridStore: Discarding stored grid due to platform mismatch. Stored: ${parsedData.state.selectedPlatform}, Current: ${currentPlatform}`
				);
				return null; // Discard stored data if platforms don't match
			}

			console.log("GridStore: Retrieved data from localStorage:", parsedData);

			

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

// --- Create the store using persist and immer middleware ---
export const useGridStore = create<GridStore>()(
	persist(
		immer((set, get) => ({
			// --- State properties ---
			grid: createGrid(10, 6),
			result: null,
			isSharedGrid: new URLSearchParams(getWindowSearch()).has("grid"), // Initialize based on current URL
			gridFixed: false,
			superchargedFixed: false,
			initialGridDefinition: undefined,

			setIsSharedGrid: (isShared) => set({ isSharedGrid: isShared }),

			setGrid: (grid) => set({ grid }),

			resetGrid: () => {
				set((state) => {
					state.grid = createGrid(state.grid.width, state.grid.height);
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
				const { setTechMaxBonus, setTechSolvedBonus, setTechSolveMethod } = useTechStore.getState();
				set((state) => {
					state.result = result;
				});
				if (result) {
					setTechMaxBonus(tech, result.max_bonus);
					setTechSolvedBonus(tech, result.solved_bonus);
					setTechSolveMethod(tech, result.solve_method);
				}
			},

			toggleCellActive: (rowIndex, columnIndex) => {
				set((state) => {
					const cell = state.grid.cells[rowIndex]?.[columnIndex];
					if (cell && (!cell.active || !cell.module)) {
						cell.active = !cell.active;
						if (!cell.active) {
							cell.supercharged = false;
						}
					} else if (cell && cell.module) {
						console.warn(
							`Cannot deactivate cell [${rowIndex}, ${columnIndex}] because it contains a module.`
						);
					} else {
						console.error(`Cell not found at [${rowIndex}, ${columnIndex}]`);
					}
				});
			},

			toggleCellSupercharged: (rowIndex, columnIndex) =>
				set((state) => {
					const cell = state.grid.cells[rowIndex]?.[columnIndex];
					if (cell?.active) {
						cell.supercharged = !cell.supercharged;
					}
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
						if (cell.active || (!cell.active && !supercharged)) {
							cell.supercharged = supercharged;
						}
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
				let hasActiveCells = false;
				for (const row of grid.cells) {
					for (const cell of row) {
						if (cell.active) {
							hasActiveCells = true;
							if (cell.module === null) {
								return false; // Found an active cell without a module, so not full
							}
						}
					}
				}
				// If loop completes: all active cells had modules OR no active cells were found.
				// Returns true if there were active cells and all were full, false otherwise.
				return hasActiveCells;
			},

			resetGridTech: (tech: string) => {
				set((state) => {
					state.grid.cells.forEach((row: Cell[]) => {
						row.forEach((cell: Cell) => {
							if (cell.tech === tech) {
								// Preserve active and supercharged status from the original cell
								// createEmptyCell will handle resetting other fields, including setting tech to null.
								Object.assign(cell, createEmptyCell(cell.supercharged, cell.active));
							}
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
			setInitialGridDefinition: (definition) => set({ initialGridDefinition: definition }),

			setGridFromInitialDefinition: (definition) => {
				set((state) => {
					if (definition) {
						const newCells: Cell[][] = definition.grid.map((row) =>
							row.map((moduleData) => {
								const baseCell = createEmptyCell();
								if (moduleData && Object.keys(moduleData).length > 0) {
									return {
										...baseCell,
										active: moduleData.active ?? baseCell.active,
										adjacency: moduleData.adjacency ?? baseCell.adjacency,
										adjacency_bonus: moduleData.adjacency_bonus ?? baseCell.adjacency_bonus,
										bonus: moduleData.bonus ?? baseCell.bonus,
										image: moduleData.image ?? baseCell.image,
										module: moduleData.id ?? baseCell.module, // Use moduleData.id for module, fallback to baseCell.module
										label: moduleData.label ?? baseCell.label,
										sc_eligible: moduleData.sc_eligible ?? baseCell.sc_eligible,
										supercharged: moduleData.supercharged ?? baseCell.supercharged,
										tech: moduleData.tech ?? baseCell.tech,
										type: moduleData.type ?? baseCell.type,
										value: moduleData.value ?? baseCell.value,
									};
								} else {
									return baseCell;
								}
							})
						);
						state.grid = { cells: newCells, width: newCells[0].length, height: newCells.length };
						state.gridFixed = definition.gridFixed;
						state.superchargedFixed = definition.superchargedFixed;
					}
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
								// Create a new cell based on the existing one, then merge moduleData
								Object.assign(cell, {
									active: moduleData.active ?? cell.active,
									adjacency: moduleData.adjacency ?? cell.adjacency,
									adjacency_bonus: moduleData.adjacency_bonus ?? cell.adjacency_bonus,
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
								Object.assign(cell, createEmptyCell(cell.supercharged, cell.active));
							}
						}
					});
				});
			},
		})),
		// --- Persist Configuration ---
		{
			name: "grid-storage_v3",
			storage: debouncedStorage, // Use the storage object with the specifically debounced setItem
						partialize: (state) => {
				const dataToPersist = {
					grid: state.grid,
					isSharedGrid: state.isSharedGrid,
					selectedPlatform: usePlatformStore.getState().selectedPlatform, // Add selectedPlatform to persisted state
				};
				console.log("GridStore: Persisting data:", dataToPersist);
				return dataToPersist;
			},
			/**
			 * Custom merge function to ensure `isSharedGrid` is always
			 * determined by the URL at the time of hydration, overriding any
			 * persisted value for this specific flag.
			 */
			merge: (persistedState, currentState) => {
				const stateFromStorage = persistedState as Partial<GridStore>; // Cast persistedState
				const currentUrlHasGrid = new URLSearchParams(getWindowSearch()).has("grid");
				return {
					...currentState, // Default state from create()
					...stateFromStorage, // State from localStorage (if getItem didn't return null)
					isSharedGrid: currentUrlHasGrid, // Always prioritize URL for this flag
				};
			},
		}
	)
);

// --- Selectors ---
export const selectTotalSuperchargedCells = (state: GridStore): number => {
	let count = 0;
	for (const row of state.grid.cells) {
		for (const cell of row) {
			if (cell.supercharged) {
				count++;
			}
		}
	}
	return count;
};

export const selectHasModulesInGrid = (state: GridStore): boolean => {
	for (const row of state.grid.cells) {
		for (const cell of row) {
			if (cell.module !== null) {
				return true;
			}
		}
	}
	return false;
};

export const selectGridFixed = (state: GridStore): boolean => state.gridFixed;