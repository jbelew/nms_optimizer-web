import type { Grid } from "../GridStore";
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "../GridStore";

describe("hasTechInGrid selector in GridStore", () => {
	const gridWidth = 3;
	const gridHeight = 3;

	// Helper to set up a specific grid state for a test
	const setupGridState = (gridSetup: Grid | null) => {
		act(() => {
			// Start by resetting to a known default (actions are preserved)
			useGridStore.getState().resetGrid();

			let gridToSet: Grid;
			if (gridSetup === null) {
				// For empty grid test
				gridToSet = createGrid(0, 0); // Or handle as per store's empty state logic
			} else {
				gridToSet = gridSetup;
			}

			useGridStore.setState({
				grid: gridToSet,
				result: null,
				isSharedGrid: false,
			});
		});
	};

	beforeEach(() => {
		// Default setup for most tests, can be overridden by setupGridState
		act(() => {
			useGridStore.getState().resetGrid();
			const defaultGrid = createGrid(gridWidth, gridHeight);
			defaultGrid.cells.forEach((row) =>
				row.forEach((cell) => {
					Object.assign(cell, createEmptyCell(false, true)); // Active, no tech, not SC
				})
			);
			useGridStore.setState({ grid: defaultGrid });
		});
	});

	it("should return true if the specified techName exists in at least one cell", () => {
		const techName = "tech_a";
		const customGrid = createGrid(gridWidth, gridHeight);
		customGrid.cells[1][1].tech = techName;
		setupGridState(customGrid);

		const result = useGridStore.getState().hasTechInGrid(techName);
		expect(result).toBe(true);
	});

	it("should return false if the specified techName does not exist in any cell", () => {
		const techName = "tech_b";
		const customGrid = createGrid(gridWidth, gridHeight);
		customGrid.cells[0][0].tech = "other_tech_1";
		customGrid.cells[1][1].tech = "other_tech_2";
		setupGridState(customGrid);

		const result = useGridStore.getState().hasTechInGrid(techName);
		expect(result).toBe(false);
	});

	it("should return false for an empty grid", () => {
		setupGridState(createGrid(0, 0)); // Grid with 0 cells
		const result = useGridStore.getState().hasTechInGrid("any_tech");
		expect(result).toBe(false);
	});

	it("should return false for a grid where all cells have null tech", () => {
		// beforeEach already sets up a grid with null tech initially
		const result = useGridStore.getState().hasTechInGrid("any_tech");
		expect(result).toBe(false);
	});

	it("should return true when multiple instances of the same tech exist", () => {
		const techName = "tech_c";
		const customGrid = createGrid(gridWidth, gridHeight);
		customGrid.cells[0][1].tech = techName;
		customGrid.cells[2][2].tech = techName;
		setupGridState(customGrid);

		const result = useGridStore.getState().hasTechInGrid(techName);
		expect(result).toBe(true);
	});

	it("should correctly identify presence of one tech and absence of another in a mixed grid", () => {
		const presentTech = "tech_present";
		const absentTech = "tech_absent";
		const customGrid = createGrid(gridWidth, gridHeight);
		customGrid.cells[0][0].tech = "other_tech";
		customGrid.cells[1][1].tech = presentTech;
		customGrid.cells[2][0].tech = "another_one";
		setupGridState(customGrid);

		expect(useGridStore.getState().hasTechInGrid(presentTech)).toBe(true);
		expect(useGridStore.getState().hasTechInGrid(absentTech)).toBe(false);
	});

	it("should return false if tech is null and checking for null (edge case, though techName is string)", () => {
		// The hasTechInGrid selector expects a string techName.
		// If we were to allow `null` as a search term (which is not its design):
		const customGrid = createGrid(gridWidth, gridHeight);
		customGrid.cells[0][0].tech = null; // Cell has null tech
		setupGridState(customGrid);

		// Assuming hasTechInGrid(null) would try to match cell.tech === null
		// However, the type for techName is `string`. This test is more conceptual.
		// The current implementation will treat `null` as a string "null" if passed.
		// Let's test against an actual string that won't match.
		expect(useGridStore.getState().hasTechInGrid("null")).toBe(false); // tech is actual null, not string "null"
		expect(useGridStore.getState().hasTechInGrid("any_tech_not_present")).toBe(false);
	});
});
