# WebAssembly (WASM) Optimization Solver

This directory contains the C++ source code, build scripts, and tests for the WebAssembly-based optimization solver. The solver offloads the computationally intensive simulated annealing algorithm from the server to the client's browser.

## Building the WASM Module

The C++ code is compiled to WebAssembly using the Emscripten SDK.

### Prerequisites

- The Emscripten SDK is required. The build process uses a Git submodule to pull the SDK into the `wasm/emsdk` directory.

### Build Command

The build is orchestrated by the `Makefile` located in this directory, but it should be executed from the **project root**:

```bash
# Activate the Emscripten environment and run the build
source wasm/emsdk/emsdk_env.sh && make -f wasm/Makefile
```

This command will:

1. Compile the C++ source from `wasm/src/main.cpp`.
2. Generate the WebAssembly module (`solver.wasm`) and the JavaScript glue code (`solver.js`).
3. Place the compiled artifacts into the `static/js/` directory, making them available to the frontend application.

## Testing

A test suite is included to verify that the WASM implementation produces the same results as the original Python implementation.

### Test Command

To run the tests, execute the `test` target from the **project root**:

```bash
# Activate the Emscripten environment and run the test suite
source wasm/emsdk/emsdk_env.sh && make -f wasm/Makefile test
```

This command will:

1. Build the WASM module if it hasn't been built already.
2. Run `wasm/test/generate_golden.py` to produce a `golden.json` file with the expected output from the Python code.
3. Run `wasm/test/test_wasm.mjs`, which loads the WASM module, runs it with the same inputs, and asserts that its output score matches the score in `golden.json`.

## Integrating into the Frontend

To use the solver in the frontend application, you need to load and interact with the compiled WASM module.

### 1. Loading the Module

The WASM module can be loaded asynchronously. The `solver.js` file exports a factory function that returns a promise, which resolves with the module instance.

```javascript
// Example in a frontend JavaScript file
async function initializeSolver() {
	try {
		// The path to the solver script
		const moduleFactory = await import("/static/js/solver.js");
		const wasmModule = await moduleFactory.default();
		return wasmModule;
	} catch (error) {
		console.error("Failed to load WASM solver:", error);
	}
}
```

### 2. Calling the `simulated_annealing` Function

Once the module is loaded, you can call the exported `simulated_annealing` function. You will need to construct the input data structures (`Grid`, `VectorModule`) using the functions provided by the WASM module.

```javascript
async function runOptimization() {
	const wasmModule = await initializeSolver();
	if (!wasmModule) return;

	// --- 1. Prepare Inputs ---
	// This data would typically come from your application state
	const jsInputs = {
		grid: {
			width: 3,
			height: 2,
			cells: [
				/* ... cell data ... */
			],
		},
		ship: "Sentinel",
		modules: [
			/* ... module data ... */
		],
		tech: "infra",
		tech_modules: [
			/* ... tech-specific module data ... */
		],
		params: {
			/* ... annealing parameters ... */
		},
	};

	// --- 2. Convert JS data to WASM data structures ---
	const grid = new wasmModule.Grid(jsInputs.grid.width, jsInputs.grid.height);
	// Populate grid cells...
	jsInputs.grid.cells.flat().forEach((cellData) => {
		const cell = grid.get_cell(cellData.x, cellData.y);
		cell.active = cellData.active;
		cell.supercharged = cellData.supercharged;
		// ... and so on for other cell properties
	});

	const modules = new wasmModule.VectorModule();
	jsInputs.modules.forEach((m) => modules.push_back(m));

	const tech_modules = new wasmModule.VectorModule();
	jsInputs.tech_modules.forEach((m) => tech_modules.push_back(m));

	// --- 3. Call the WASM function ---
	const result = wasmModule.simulated_annealing(
		grid,
		jsInputs.ship,
		modules,
		jsInputs.tech,
		tech_modules,
		jsInputs.params.initial_temperature,
		jsInputs.params.cooling_rate
		// ... other params
	);

	const score = result.score;
	const finalGrid = result.grid; // This is a WASM Grid object

	console.log("Optimization complete. Final Score:", score);

	// --- 4. Process the result (convert back to JS if needed) ---
	// You can write a helper function to convert the wasmGrid back to a JS object
	// for use in your application.

	// --- 5. Clean up WASM memory ---
	grid.delete();
	modules.delete();
	tech_modules.delete();
	result.grid.delete();
}
```

This README provides a comprehensive guide for building, testing, and integrating the WASM solver.
