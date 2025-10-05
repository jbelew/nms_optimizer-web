import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically import the WASM module
async function loadModule() {
	const modulePath = path.join(__dirname, "..", "..", "static", "js", "solver.js");
	const factory = await import(modulePath);
	return factory.default(); // or whatever the correct export is
}

function wasmGridToJs(wasmGrid) {
	const cells = [];
	for (let y = 0; y < wasmGrid.height; y++) {
		const row = [];
		for (let x = 0; x < wasmGrid.width; x++) {
			const cell = wasmGrid.get_cell(x, y);
			const jsCell = {
				active: cell.active,
				supercharged: cell.supercharged,
				module_id: cell.module_id,
				tech: cell.tech,
				x: cell.x,
				y: cell.y,
				adjacency: cell.adjacency,
			};
			row.push(jsCell);
		}
		cells.push(row);
	}
	return {
		width: wasmGrid.width,
		height: wasmGrid.height,
		cells: cells,
	};
}

async function main() {
	try {
		const Module = await loadModule();

		const goldenPath = path.join(__dirname, "golden.json");
		const goldenData = JSON.parse(fs.readFileSync(goldenPath, "utf-8"));
		const { inputs, output: goldenOutput } = goldenData;

		// Map JS inputs to WASM data structures
		const grid = new Module.Grid(inputs.grid.width, inputs.grid.height);
		for (let y = 0; y < inputs.grid.height; y++) {
			for (let x = 0; x < inputs.grid.width; x++) {
				const cellData = inputs.grid.cells[y][x];
				Module.set_cell_properties(grid, x, y, cellData.active, cellData.supercharged);
			}
		}

		const tech_modules = new Module.VectorModule();
		inputs.tech_modules.forEach((m) => tech_modules.push_back(m));

		const wasmResult = Module.simulated_annealing(
			grid,
			inputs.ship,
			inputs.tech,
			tech_modules,
			inputs.params.initial_temperature,
			inputs.params.cooling_rate,
			inputs.params.stopping_temperature,
			inputs.params.iterations_per_temp,
			inputs.params.initial_swap_probability,
			inputs.params.final_swap_probability,
			inputs.params.start_from_current_grid,
			inputs.params.max_processing_time,
			inputs.params.max_steps_without_improvement,
			inputs.params.reheat_factor
		);

		const wasmScore = wasmResult.score;
		const goldenScore = goldenOutput.score;

		console.log(`Golden Score: ${goldenScore}`);
		console.log(`WASM Score:   ${wasmScore}`);

		// Using a tolerance for floating point comparison
		const tolerance = 1e-4;
		assert.ok(
			Math.abs(wasmScore - goldenScore) < tolerance,
			`Score mismatch! Golden: ${goldenScore}, WASM: ${wasmScore}`
		);

		console.log("✅ Test Passed: Scores match!");

		// Cleanup WASM memory
		wasmResult.grid.delete();
		grid.delete();
		tech_modules.delete();
	} catch (error) {
		console.error("❌ Test Failed:", error);
		process.exit(1);
	}
}

main();
