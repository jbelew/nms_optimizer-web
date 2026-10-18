import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { Cell } from "./gridStore";
import { createEmptyCell, createGrid, getRowControlEligibility, useGridStore } from "./gridStore";

describe("activateRow and deActivateRow actions in GridStore", () => {
	const gridWidth = 3;
	const gridHeight = 3;

	beforeEach(() => {
		act(() => {
			useGridStore.getState().resetGrid();
			const defaultTestGrid = createGrid(gridWidth, gridHeight);
			// Initialize with a known mixed state for thorough testing
			defaultTestGrid.cells.forEach((row, rIdx) => {
				row.forEach((cell, cIdx) => {
					Object.assign(cell, createEmptyCell(false, true)); // Base: active, not supercharged

					if (rIdx === 0) {
						// Row 0: mix of active/inactive, some supercharged
						if (cIdx === 0) cell.active = true;
						cell.supercharged = true;
						if (cIdx === 1) cell.active = false;
						cell.supercharged = false;
						if (cIdx === 2) cell.active = true;
						cell.supercharged = false;
					} else if (rIdx === 1) {
						// Row 1: to be targeted by actions, initially mixed
						if (cIdx === 0) cell.active = false;
						cell.supercharged = true; // inactive but SC
						if (cIdx === 1) cell.active = true;
						cell.supercharged = false;
						if (cIdx === 2) cell.active = false;
						cell.supercharged = false;
					} else if (rIdx === 2) {
						// Row 2: control row, all active, some supercharged
						if (cIdx === 0) cell.active = true;
						cell.supercharged = false;
						if (cIdx === 1) cell.active = true;
						cell.supercharged = true;
						if (cIdx === 2) cell.active = true;
						cell.supercharged = false;
					}
				});
			});
			useGridStore.setState({
				grid: defaultTestGrid,
				gridFixed: false,
				hasModulesInGrid: false,
				isSharedGrid: false,
				result: null,
			});
		});
	});

	describe("activateRow", () => {
		const targetRowIndex = 1; // Row 1 will be targeted

		it("should activate all cells in the specified row", () => {
			act(() => {
				useGridStore.getState().activateRow(targetRowIndex);
			});
			const targetRowCells = useGridStore.getState().grid.cells[targetRowIndex];
			targetRowCells.forEach((cell) => {
				expect(cell.active).toBe(true);
			});
		});

		it("should not change the supercharged status of cells when activating them", () => {
			// Get initial supercharged states for the target row
			const initialSuperchargedStates = useGridStore
				.getState()
				.grid.cells[targetRowIndex].map((c) => c.supercharged);

			act(() => {
				useGridStore.getState().activateRow(targetRowIndex);
			});

			const targetRowCells = useGridStore.getState().grid.cells[targetRowIndex];
			targetRowCells.forEach((cell, cIdx) => {
				expect(cell.supercharged).toBe(initialSuperchargedStates[cIdx]);
			});
		});

		it("should not affect cells in other rows", () => {
			const originalOtherRows: Cell[][] = [];

			for (let r = 0; r < gridHeight; r++) {
				if (r !== targetRowIndex) {
					originalOtherRows.push(
						JSON.parse(JSON.stringify(useGridStore.getState().grid.cells[r])),
					);
				}
			}

			act(() => {
				useGridStore.getState().activateRow(targetRowIndex);
			});

			const finalGridCells = useGridStore.getState().grid.cells;
			let otherRowIdx = 0;

			for (let r = 0; r < gridHeight; r++) {
				if (r !== targetRowIndex) {
					expect(finalGridCells[r]).toEqual(originalOtherRows[otherRowIdx]);
					otherRowIdx++;
				}
			}
		});

		it("should be a no-op when gridFixed is true", () => {
			act(() => {
				useGridStore.setState({ gridFixed: true });
				useGridStore.getState().activateRow(targetRowIndex);
			});

			const targetRowCells = useGridStore.getState().grid.cells[targetRowIndex];
			expect(targetRowCells[0].active).toBe(false);
			expect(targetRowCells[2].active).toBe(false);
		});

		it("should be a no-op when hasModulesInGrid is true", () => {
			act(() => {
				useGridStore.setState({ hasModulesInGrid: true });
				useGridStore.getState().activateRow(targetRowIndex);
			});

			const targetRowCells = useGridStore.getState().grid.cells[targetRowIndex];
			expect(targetRowCells[0].active).toBe(false);
			expect(targetRowCells[2].active).toBe(false);
		});
	});

	describe("deActivateRow", () => {
		const targetRowIndex = 1; // Row 1 will be targeted (initially mixed state)

		it("should deactivate all cells in the specified row", () => {
			act(() => {
				useGridStore.getState().deActivateRow(targetRowIndex);
			});
			const targetRowCells = useGridStore.getState().grid.cells[targetRowIndex];
			targetRowCells.forEach((cell) => {
				expect(cell.active).toBe(false);
			});
		});

		it("should set supercharged to false for all cells in the deactivated row", () => {
			// Ensure some cells in the target row start as supercharged
			act(() => {
				const grid = useGridStore.getState().grid;
				grid.cells[targetRowIndex][0].supercharged = true;
				grid.cells[targetRowIndex][1].supercharged = true;
				useGridStore.setState({ grid: JSON.parse(JSON.stringify(grid)) });
			});

			act(() => {
				useGridStore.getState().deActivateRow(targetRowIndex);
			});

			const targetRowCells = useGridStore.getState().grid.cells[targetRowIndex];
			targetRowCells.forEach((cell) => {
				expect(cell.supercharged).toBe(false);
			});
		});

		it("should not affect cells in other rows", () => {
			const originalOtherRows: Cell[][] = [];

			for (let r = 0; r < gridHeight; r++) {
				if (r !== targetRowIndex) {
					originalOtherRows.push(
						JSON.parse(JSON.stringify(useGridStore.getState().grid.cells[r])),
					);
				}
			}

			act(() => {
				useGridStore.getState().deActivateRow(targetRowIndex);
			});

			const finalGridCells = useGridStore.getState().grid.cells;
			let otherRowIdx = 0;

			for (let r = 0; r < gridHeight; r++) {
				if (r !== targetRowIndex) {
					expect(finalGridCells[r]).toEqual(originalOtherRows[otherRowIdx]);
					otherRowIdx++;
				}
			}
		});

		it("should be a no-op when gridFixed is true", () => {
			act(() => {
				useGridStore.setState({ gridFixed: true });
				useGridStore.getState().deActivateRow(targetRowIndex);
			});

			const targetRowCells = useGridStore.getState().grid.cells[targetRowIndex];
			expect(targetRowCells[1].active).toBe(true);
		});

		it("should be a no-op when hasModulesInGrid is true", () => {
			act(() => {
				useGridStore.setState({ hasModulesInGrid: true });
				useGridStore.getState().deActivateRow(targetRowIndex);
			});

			const targetRowCells = useGridStore.getState().grid.cells[targetRowIndex];
			expect(targetRowCells[1].active).toBe(true);
		});
	});
});

describe("getRowControlEligibility", () => {
	it("returns both flags as false when totalRows is 0 or rowIndex is out of bounds", () => {
		expect(
			getRowControlEligibility({
				firstInactiveRowIndex: 2,
				lastActiveRowIndex: 5,
				rowIndex: 0,
				totalRows: 0,
			}),
		).toEqual({ canActivateRow: false, canDeactivateRow: false });
	});

	it("returns canActivateRow true when rowIndex matches firstInactiveRowIndex and grid has active cells", () => {
		expect(
			getRowControlEligibility({
				firstInactiveRowIndex: 2,
				lastActiveRowIndex: 1,
				rowIndex: 2,
				totalRows: 3,
			}),
		).toEqual({ canActivateRow: true, canDeactivateRow: false });
	});

	it("returns canActivateRow false when rowIndex does not match firstInactiveRowIndex", () => {
		expect(
			getRowControlEligibility({
				firstInactiveRowIndex: 3,
				lastActiveRowIndex: 1,
				rowIndex: 2,
				totalRows: 4,
			}),
		).toEqual({ canActivateRow: false, canDeactivateRow: false });
	});

	it("returns canDeactivateRow true when rowIndex is lastActiveRowIndex within LAST_N_ROWS_THRESHOLD", () => {
		expect(
			getRowControlEligibility({
				firstInactiveRowIndex: 5,
				lastActiveRowIndex: 7,
				rowIndex: 7,
				totalRows: 10,
			}),
		).toEqual({ canActivateRow: false, canDeactivateRow: true });
	});

	it("returns canDeactivateRow false when rowIndex is lastActiveRowIndex but outside LAST_N_ROWS_THRESHOLD", () => {
		expect(
			getRowControlEligibility({
				firstInactiveRowIndex: 2,
				lastActiveRowIndex: 1,
				rowIndex: 1,
				totalRows: 8,
			}),
		).toEqual({ canActivateRow: false, canDeactivateRow: false });
	});

	it("returns both flags as false when grid has no active cells (lastActiveRowIndex === -1)", () => {
		expect(
			getRowControlEligibility({
				firstInactiveRowIndex: 0,
				lastActiveRowIndex: -1,
				rowIndex: 0,
				totalRows: 6,
			}),
		).toEqual({ canActivateRow: false, canDeactivateRow: false });
	});

	it("handles edge case where rowIndex is at the bottom grid boundary", () => {
		expect(
			getRowControlEligibility({
				firstInactiveRowIndex: -1,
				lastActiveRowIndex: 9,
				rowIndex: 9,
				totalRows: 10,
			}),
		).toEqual({ canActivateRow: false, canDeactivateRow: true });
	});
});
