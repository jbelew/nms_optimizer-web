import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { type Module } from "../hooks/useTechTree.tsx";
import { usePlatformStore } from "./PlatformStore";
import { useTechStore } from "./TechStore";

type SetItemFunction = (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void>;

function debounceSetItem(
	setItemFn: SetItemFunction,
	msToWait: number
): (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void> {
	let timeoutId: number | null = null;

	return (name: string, value: StorageValue<Partial<GridStore>>): Promise<void> => {
		return new Promise<void>((resolve, reject) => {
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
			}

			timeoutId = window.setTimeout(() => {
				void (async () => {
					try {
						await setItemFn(name, value);
						resolve();
					} catch (e) {
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

export type Grid = {
	cells: Cell[][];
	height: number;
	width: number;
};

export type ApiResponse = {
	grid: Grid | null;
	max_bonus: number;
	solved_bonus: number;
	solve_method: string;
};

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

export const resetCellContent = (cell: Cell) => {
	const { active, supercharged } = cell;
	const emptyCell = createEmptyCell(supercharged, active);
	Object.assign(cell, emptyCell);
};

export type GridStore = {
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

export const useGridStore = create<GridStore>()(
	persist(
		immer((set, get) => {
			const applyGridDefinition = (
				state: GridStore,
				definition: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean }
			) => {
				const newCells: Cell[][] = definition.grid.map((row) => row.map(createCellFromModuleData));
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

				toggleCellActive: (rowIndex, columnIndex) => {
					set((state) => {
						const cell = state.grid.cells[rowIndex]?.[columnIndex];

						if (cell && (!cell.active || !cell.module)) {
							if (cell.supercharged) {
								cell.supercharged = !cell.supercharged;
							}
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
				setInitialGridDefinition: (definition) => set({ initialGridDefinition: definition }),

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
						stateFromStorage.initialGridDefinition || currentState.initialGridDefinition,
				};
			},
		}
	)
);
