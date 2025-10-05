 
// A self-contained Web Worker for running the WASM optimization.

// --- Type Imports ---
// These would ideally be in a shared file. For now, we define them here.
interface Module {
	active: boolean;
	adjacency: string;
	adjacency_bonus: number;
	bonus: number;
	id: string;
	image: string;
	label: string;
	sc_eligible: boolean;
	supercharged: boolean;
	tech: string;
	type: string;
	value: number;
	checked?: boolean;
}

interface Grid {
	width: number;
	height: number;
	cells: any[][]; // Simplified for worker context
}

interface WasmCell {
	active: boolean;
	supercharged: boolean;
	module: string | null;
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
		min_temperature: number,
		max_iterations: number,
		initial_swap_probability: number,
		final_swap_probability: number,
		start_from_current_grid: boolean,
		max_processing_time: number,
		max_steps_without_improvement: number,
		reheat_factor: number
	) => { score: number; grid: WasmGrid };
}

interface WorkerInputs {
	grid: Grid;
	ship: string;
	modules: string[];
	tech: string;
	moduleMap: Map<string, Module>;
}

let wasmModule: WasmModule | null = null;

// --- WASM Initialization ---
async function initializeWasm() {
	if (wasmModule) return;
	try {
		const moduleFactory = await import("../wasm/solver.js");
		wasmModule = (await moduleFactory.default()) as WasmModule;
	} catch (error) {
		console.error("Failed to load WASM solver in worker:", error);
		// This error will be caught by the main onmessage handler
		throw error;
	}
}

// --- Main Worker Logic ---
self.onmessage = async (event: MessageEvent<WorkerInputs>) => {
	try {
		await initializeWasm();
		if (!wasmModule) {
			throw new Error("WASM module failed to initialize.");
		}

		const { grid: jsGrid, ship, modules: jsModulesIds, tech, moduleMap } = event.data;

		const wasmGrid = new wasmModule.Grid(jsGrid.width, jsGrid.height);
		jsGrid.cells.forEach((row, y) => {
			row.forEach((cellData, x) => {
				wasmModule!.set_cell_properties(
					wasmGrid,
					x,
					y,
					cellData.active,
					cellData.supercharged
				);
			});
		});

		const wasmModules = new wasmModule.VectorModule();
		jsModulesIds.forEach((m) => {
			const module = moduleMap.get(m);
			if (module) wasmModules.push_back(module);
		});

		const result = wasmModule.simulated_annealing(
			wasmGrid,
			ship,
			tech,
			wasmModules,
			1.0,
			0.95,
			0.001,
			5,
			0.6,
			0.1,
			false,
			5,
			50,
			0.2
		);

		const finalGrid = wasmGridToJs(result.grid);

		self.postMessage({ type: "SUCCESS", payload: { grid: finalGrid, score: result.score } });

		// Cleanup WASM memory
		wasmGrid.delete();
		wasmModules.delete();
		result.grid.delete();
	} catch (error) {
		console.error("Error during WASM optimization in worker:", error);
		self.postMessage({ type: "ERROR", error: (error as Error).message });
	}
};

// --- Utility Functions ---
function wasmGridToJs(wasmGrid: WasmGrid): Grid {
	const cells: any[][] = [];
	for (let y = 0; y < wasmGrid.height; y++) {
		const row: any[] = [];
		for (let x = 0; x < wasmGrid.width; x++) {
			const wasmCell = wasmGrid.get_cell(x, y);
			// We only need to return the data that changes. The main thread
			// can use this to update its state.
			row.push({
				active: wasmCell.active,
				supercharged: wasmCell.supercharged,
				module: wasmCell.module, // This will be the module ID string
			});
		}
		cells.push(row);
	}
	return { width: wasmGrid.width, height: wasmGrid.height, cells };
}
