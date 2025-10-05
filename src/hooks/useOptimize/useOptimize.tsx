import type { ApiResponse, Grid } from "../../store/GridStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createEmptyCell, useGridStore } from "../../store/GridStore";
import { useOptimizeStore } from "../../store/OptimizeStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechStore } from "../../store/TechStore";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBreakpoint } from "../useBreakpoint/useBreakpoint";
import { type Module } from "../useTechTree/useTechTree";

export interface UseOptimizeReturn {
	solving: boolean;
	progressPercent: number;
	status?: string;
	handleOptimize: (tech: string, forced?: boolean) => Promise<void>;
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	patternNoFitTech: string | null;
	clearPatternNoFitTech: () => void;
	handleForceCurrentPnfOptimize: () => Promise<void>;
}

// --- WASM Module Type Definitions ---
interface WasmCell {
	active: boolean;
	supercharged: boolean;
	module_id: string | null;
	tech: string | null;
}

interface WasmGrid {
	width: number;
	height: number;
	get_cell: (x: number, y: number) => WasmCell;
	delete: () => void;
}

interface WasmVectorModule {
	push_back: (module: Module) => void;
	delete: () => void;
}

interface WasmModule {
	Grid: new (width: number, height: number) => WasmGrid;
	VectorModule: new () => WasmVectorModule;
	set_cell_properties: (
		grid: WasmGrid,
		x: number,
		y: number,
		active: boolean,
		supercharged: boolean
	) => void;
	simulated_annealing: (
		grid: WasmGrid,
		ship: string,
		tech: string,
		modules: WasmVectorModule,
		initial_temperature: number,
		cooling_rate: number,
		min_temperature: number, // stopping_temperature
		max_iterations: number, // iterations_per_temp
		// The following are new params from the test file, using default values
		initial_swap_probability: number,
		final_swap_probability: number,
		start_from_current_grid: boolean,
		max_processing_time: number,
		max_steps_without_improvement: number,
		reheat_factor: number
	) => { score: number; grid: WasmGrid };
}

// Helper to convert WASM grid to JS grid
type Cell = ReturnType<typeof createEmptyCell>;

const createCellFromModuleData = (
	moduleData: Module | null,
	active: boolean,
	supercharged: boolean
): Cell => {
	if (!moduleData) {
		return createEmptyCell(supercharged, active);
	}
	return {
		active: active,
		adjacency: moduleData.adjacency ?? "none",
		adjacency_bonus: moduleData.adjacency_bonus ?? 0.0,
		bonus: moduleData.bonus ?? 0.0,
		image: moduleData.image ?? null,
		module: moduleData.id ?? null,
		label: moduleData.label ?? "",
		sc_eligible: moduleData.sc_eligible ?? false,
		supercharged: supercharged,
		tech: moduleData.tech ?? null,
		total: 0.0, // This will be calculated by another part of the store
		type: moduleData.type ?? "",
		value: moduleData.value ?? 0,
	};
};

function wasmGridToJsGrid(wasmGrid: WasmGrid, moduleMap: Map<string, Module>): Grid {
	const width = wasmGrid.width;
	const height = wasmGrid.height;
	const cells: Cell[][] = [];

	for (let y = 0; y < height; y++) {
		const row: Cell[] = [];
		for (let x = 0; x < width; x++) {
			const wasmCell = wasmGrid.get_cell(x, y);
			const module = wasmCell.module_id ? (moduleMap.get(wasmCell.module_id) ?? null) : null;
			const jsCell = createCellFromModuleData(module, wasmCell.active, wasmCell.supercharged);
			row.push(jsCell);
		}
		cells.push(row);
	}
	return { width, height, cells };
}

/**
 * Manages the optimization process by using a client-side WASM module.
 * It handles loading the solver, sending optimization requests, and processing the final results.
 * It also manages UI state related to the optimization, such as loading indicators and error states.
 *
 * @returns {UseOptimizeReturn} An object containing state and functions for the optimization process.
 */
export const useOptimize = (): UseOptimizeReturn => {
	const { setGrid, setResult, grid } = useGridStore();
	const {
		setShowError: setShowErrorStore,
		patternNoFitTech,
		setPatternNoFitTech,
	} = useOptimizeStore();
	const { checkedModules, techGroups } = useTechStore();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const { sendEvent } = useAnalytics();
	const isLarge = useBreakpoint("1024px");

	const [solving, setSolving] = useState(false);
	const [progressPercent, setProgressPercent] = useState(0);
	const [status, setStatus] = useState<string | undefined>();
	const gridContainerRef = useRef<HTMLDivElement | null>(null);

	const [wasmModule, setWasmModule] = useState<WasmModule | null>(null);

	const moduleMap = useMemo(() => {
		const map = new Map<string, Module>();
		for (const tech in techGroups) {
			for (const group of techGroups[tech]) {
				for (const mod of group.modules) {
					map.set(mod.id, { ...mod, tech });
				}
			}
		}
		return map;
	}, [techGroups]);

	useEffect(() => {
		async function initializeSolver() {
			try {
				const moduleFactory = await import("../../wasm/solver.js");
				const module = (await moduleFactory.default()) as WasmModule;
				setWasmModule(module);
			} catch (error) {
				console.error("Failed to load WASM solver:", error);
				setShowErrorStore(true);
			}
		}
		initializeSolver();
	}, [setShowErrorStore]);

	const resetProgress = useCallback(() => {
		setSolving(false);
		setProgressPercent(0);
		setStatus(undefined);
	}, []);

	// Scroll into view when solving on smaller screens
	useEffect(() => {
		if (solving && gridContainerRef.current && !isLarge) {
			const element = gridContainerRef.current;
			const offset = 8;
			requestAnimationFrame(() => {
				const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
				window.scrollTo({ top, behavior: "smooth" });
			});
		}
	}, [solving, isLarge]);

	const handleOptimize = useCallback(
		async (tech: string, forced: boolean = false) => {
			if (!wasmModule) {
				console.error("WASM module not loaded yet.");
				setShowErrorStore(true);
				return;
			}

			setSolving(true);
			setProgressPercent(5); // Indicate start
			setStatus("Loading WASM solver...");
			setShowErrorStore(false);

			if (forced || patternNoFitTech === tech) setPatternNoFitTech(null);

			const updatedGrid: Grid = {
				...grid,
				cells: grid.cells.map((row) =>
					row.map((cell) =>
						cell.tech === tech
							? { ...createEmptyCell(cell.supercharged, cell.active) }
							: cell
					)
				),
			};

			// The WASM solver runs synchronously on the main thread from JS perspective,
			// so we wrap it in a timeout to allow the UI to update.
			setTimeout(() => {
				try {
					setStatus("Preparing inputs...");
					// --- 1. Prepare Inputs ---
					const jsInputs = {
						grid: updatedGrid,
						ship: selectedShipType,
						modules: checkedModules[tech] || [],
						tech: tech,
						tech_modules: [], // Per README, this is separate. Assuming empty for now.
						params: {
							initial_temperature: 1000,
							cooling_rate: 0.995,
							max_iterations: 200000,
							min_temperature: 0.001,
						},
					};

					// --- 2. Convert JS data to WASM data structures ---
					const firstModule = moduleMap.get(jsInputs.modules[0]);
					setStatus(`First module: ${JSON.stringify(firstModule)}`);
					setProgressPercent(10);
					const wasmGrid = new wasmModule.Grid(jsInputs.grid.width, jsInputs.grid.height);
					jsInputs.grid.cells.forEach((row, y) => {
						row.forEach((cellData, x) => {
							wasmModule.set_cell_properties(
								wasmGrid,
								x,
								y,
								cellData.active,
								cellData.supercharged
							);
						});
					});

					const wasmModules = new wasmModule.VectorModule();
					jsInputs.modules.forEach((m) => {
						const module = moduleMap.get(m);
						if (module) wasmModules.push_back(module);
					});

					// --- 3. Call the WASM function ---
					// Parameters are based on the working test case in golden.json
					const result = wasmModule.simulated_annealing(
						wasmGrid,
						jsInputs.ship,
						jsInputs.tech,
						wasmModules,
						1.0, // initial_temperature
						0.95, // cooling_rate
						0.001, // stopping_temperature
						5, // iterations_per_temp
						0.6, // initial_swap_probability
						0.1, // final_swap_probability
						false, // start_from_current_grid
						5, // max_processing_time (seconds)
						50, // max_steps_without_improvement
						0.2 // reheat_factor
					);

					const score = result.score;
					const finalWasmGrid = result.grid;

					// --- 4. Process the result (convert back to JS if needed) ---
					const finalGrid = wasmGridToJsGrid(finalWasmGrid, moduleMap);
					// --- 5. Construct ApiResponse-like object ---
					const apiResponse: ApiResponse = {
						solve_method: "WASM",
						grid: finalGrid,
						solved_bonus: score,
						max_bonus: 0, // WASM solver doesn't provide this
					};

					if (patternNoFitTech === tech) setPatternNoFitTech(null);
					setResult(apiResponse, tech);
					const gaTech =
						tech === "pulse" && checkedModules[tech]?.includes("PC")
							? "photonix"
							: tech;
					if (apiResponse.grid) {
						console.log("Optimization Result Grid:", apiResponse.grid);
						sendEvent({
							category: "User Interactions",
							action: "optimize_tech",
							platform: selectedShipType,
							tech: gaTech,
							solve_method: apiResponse.solve_method,
							value: 1,
							supercharged:
								typeof apiResponse.max_bonus === "number" &&
								apiResponse.max_bonus > 100,
						});
						setGrid(apiResponse.grid);
					}

					// --- 6. Clean up WASM memory ---
					wasmGrid.delete();
					wasmModules.delete();

					finalWasmGrid.delete();

					setProgressPercent(100);
					resetProgress();
				} catch (error) {
					console.error("Error during WASM optimization:", error);
					setShowErrorStore(true);
					resetProgress();
				}
			}, 50); // Timeout to allow UI to render "solving" state
		},
		[
			wasmModule,
			setShowErrorStore,
			patternNoFitTech,
			setPatternNoFitTech,
			grid,
			selectedShipType,
			checkedModules,
			sendEvent,
			setResult,
			setGrid,
			resetProgress,
			moduleMap,
		]
	);

	const clearPatternNoFitTech = useCallback(
		() => setPatternNoFitTech(null),
		[setPatternNoFitTech]
	);

	const handleForceCurrentPnfOptimize = useCallback(async () => {
		if (patternNoFitTech) await handleOptimize(patternNoFitTech, true);
	}, [patternNoFitTech, handleOptimize]);

	return {
		solving,
		progressPercent,
		status,
		handleOptimize,
		gridContainerRef,
		patternNoFitTech,
		clearPatternNoFitTech,
		handleForceCurrentPnfOptimize,
	};
};
