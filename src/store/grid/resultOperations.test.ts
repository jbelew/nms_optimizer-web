/**
 * Tests for result and optimization-related operations in GridStore
 * Covers: setResult, resetGridTech, hasTechInGrid
 */
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { sessionCoordinator } from "@/store/sessionCoordinator";
import { useTechStore } from "@/store/tech/techStore";

import { createGrid, useGridStore } from "./gridStore";

describe("GridStore - Result and Tech Operations", () => {
	beforeEach(() => {
		act(() => {
			useGridStore.setState({
				grid: createGrid(10, 6),
				initialGridDefinition: undefined,
				result: null,
			});
			useGridStore.getState().triggerRecompute();
			useTechStore.setState({
				maxBonus: {},
				solvedBonus: {},
				solveMethod: {},
			});
		});
	});

	describe("setResult", () => {
		it("should set optimization result in grid store", () => {
			const result = {
				grid: null,
				maxBonus: 500,
				solvedBonus: 400,
				solveMethod: "greedy",
			};

			act(() => {
				useGridStore.getState().setResult(result);
			});

			expect(useGridStore.getState().result).toEqual(result);
		});

		it("should update tech store via sessionCoordinator", () => {
			const result = {
				grid: null,
				maxBonus: 500,
				solvedBonus: 400,
				solveMethod: "greedy",
			};

			act(() => {
				sessionCoordinator.commitOptimizationResult(result, "defense");
			});

			const techState = useTechStore.getState();
			expect(techState.maxBonus["defense"]).toBe(500);
			expect(techState.solvedBonus["defense"]).toBe(400);
			expect(techState.solveMethod["defense"]).toBe("greedy");

			expect(useGridStore.getState().result).toEqual(result);
		});

		it("should handle null result", () => {
			act(() => {
				useGridStore.getState().setResult({
					grid: null,
					maxBonus: 100,
					solvedBonus: 80,
					solveMethod: "test",
				});

				useGridStore.getState().setResult(null);
			});

			expect(useGridStore.getState().result).toBeNull();
		});

		it("should store result with grid data", () => {
			const gridData = createGrid(5, 5);
			const result = {
				grid: gridData,
				maxBonus: 600,
				solvedBonus: 500,
				solveMethod: "optimal",
			};

			act(() => {
				useGridStore.getState().setResult(result);
			});

			const state = useGridStore.getState();
			expect(state.result?.maxBonus).toBe(600);
			expect(state.result?.solvedBonus).toBe(500);
		});

		it("should update different techs independently via sessionCoordinator", () => {
			const defenseResult = {
				grid: null,
				maxBonus: 500,
				solvedBonus: 400,
				solveMethod: "greedy",
			};

			const attackResult = {
				grid: null,
				maxBonus: 600,
				solvedBonus: 550,
				solveMethod: "optimal",
			};

			act(() => {
				sessionCoordinator.commitOptimizationResult(defenseResult, "defense");
				sessionCoordinator.commitOptimizationResult(attackResult, "attack");
			});

			const techState = useTechStore.getState();
			expect(techState.maxBonus["defense"]).toBe(500);
			expect(techState.maxBonus["attack"]).toBe(600);

			// Last result set in GridStore should be the current one
			const gridState = useGridStore.getState();
			expect(gridState.result?.maxBonus).toBe(600);
			expect(gridState.result?.solvedBonus).toBe(550);
		});
	});

	describe("hasTechInGrid", () => {
		it("should return false when tech is not in grid", () => {
			const grid = createGrid(3, 3);
			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
			});

			const hasTech = useGridStore.getState().activeTechs.has("defense");

			expect(hasTech).toBe(false);
		});

		it("should return true when tech is present in grid", () => {
			const grid = createGrid(3, 3);
			grid.cells[0][0].tech = "defense";
			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
			});

			const hasTech = useGridStore.getState().activeTechs.has("defense");

			expect(hasTech).toBe(true);
		});

		it("should return true when tech is in multiple cells", () => {
			const grid = createGrid(3, 3);
			grid.cells[0][0].tech = "defense";
			grid.cells[1][1].tech = "defense";
			grid.cells[2][2].tech = "defense";
			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
			});

			const hasTech = useGridStore.getState().activeTechs.has("defense");

			expect(hasTech).toBe(true);
		});

		it("should distinguish between different techs", () => {
			const grid = createGrid(3, 3);
			grid.cells[0][0].tech = "defense";
			grid.cells[1][1].tech = "attack";
			grid.cells[2][2].tech = "shield";
			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
			});

			const state = useGridStore.getState();
			expect(state.activeTechs.has("defense")).toBe(true);
			expect(state.activeTechs.has("attack")).toBe(true);
			expect(state.activeTechs.has("shield")).toBe(true);
			expect(state.activeTechs.has("nonexistent")).toBe(false);
		});

		it("should handle null tech values", () => {
			const grid = createGrid(3, 3);
			grid.cells[0][0].tech = null;
			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
			});

			const hasTech = useGridStore.getState().activeTechs.has("defense");

			expect(hasTech).toBe(false);
		});

		it("should return false for empty grid", () => {
			const grid = createGrid(3, 3);
			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
			});

			const hasTech = useGridStore.getState().activeTechs.has("defense");

			expect(hasTech).toBe(false);
		});
	});

	describe("resetGridTech", () => {
		it("should remove all instances of a tech from grid", () => {
			const grid = createGrid(3, 3);
			grid.cells[0][0].active = true;
			grid.cells[0][0].tech = "defense";
			grid.cells[0][0].module = "def_mod_1";
			grid.cells[1][1].active = true;
			grid.cells[1][1].tech = "defense";
			grid.cells[1][1].module = "def_mod_2";
			grid.cells[2][2].active = true;
			grid.cells[2][2].tech = "attack";
			grid.cells[2][2].module = "att_mod_1";

			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
				useGridStore.getState().resetGridTech("defense");
			});

			const state = useGridStore.getState();
			expect(state.grid.cells[0][0].tech).toBeNull();
			expect(state.grid.cells[0][0].module).toBeNull();
			expect(state.grid.cells[1][1].tech).toBeNull();
			expect(state.grid.cells[1][1].module).toBeNull();
			expect(state.grid.cells[2][2].tech).toBe("attack");
			expect(state.grid.cells[2][2].module).toBe("att_mod_1");
		});

		it("should preserve active and supercharged state when resetting tech", () => {
			const grid = createGrid(3, 3);
			grid.cells[0][0].active = true;
			grid.cells[0][0].supercharged = true;
			grid.cells[0][0].tech = "defense";
			grid.cells[0][0].module = "def_mod_1";

			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
				useGridStore.getState().resetGridTech("defense");
			});

			const state = useGridStore.getState();
			// Reset cell content preserves active and supercharged
			expect(state.grid.cells[0][0].active).toBe(true);
			expect(state.grid.cells[0][0].supercharged).toBe(true);
			expect(state.grid.cells[0][0].module).toBeNull();
			expect(state.grid.cells[0][0].tech).toBeNull();
		});

		it("should clear all module properties when resetting tech", () => {
			const grid = createGrid(3, 3);
			grid.cells[0][0].active = true;
			grid.cells[0][0].tech = "defense";
			grid.cells[0][0].module = "def_mod_1";
			grid.cells[0][0].label = "Defense Module";
			grid.cells[0][0].type = "shield";
			grid.cells[0][0].value = 100;
			grid.cells[0][0].bonus = 5;

			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
				useGridStore.getState().resetGridTech("defense");
			});

			const state = useGridStore.getState();
			expect(state.grid.cells[0][0].module).toBeNull();
			expect(state.grid.cells[0][0].label).toBe("");
			expect(state.grid.cells[0][0].type).toBe("");
			expect(state.grid.cells[0][0].value).toBe(0);
		});

		it("should not affect other techs", () => {
			const grid = createGrid(3, 3);
			grid.cells[0][0].active = true;
			grid.cells[0][0].tech = "defense";
			grid.cells[0][0].module = "def_mod_1";
			grid.cells[1][1].active = true;
			grid.cells[1][1].tech = "attack";
			grid.cells[1][1].module = "att_mod_1";
			grid.cells[2][2].active = true;
			grid.cells[2][2].tech = "shield";
			grid.cells[2][2].module = "shi_mod_1";

			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
				useGridStore.getState().resetGridTech("defense");
			});

			const state = useGridStore.getState();
			expect(state.grid.cells[0][0].module).toBeNull();
			expect(state.grid.cells[1][1].module).toBe("att_mod_1");
			expect(state.grid.cells[2][2].module).toBe("shi_mod_1");
		});

		it("should handle resetting tech that doesn't exist in grid", () => {
			const grid = createGrid(3, 3);
			grid.cells[0][0].active = true;
			grid.cells[0][0].tech = "defense";
			grid.cells[0][0].module = "def_mod_1";

			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
				useGridStore.getState().resetGridTech("nonexistent");
			});

			const state = useGridStore.getState();
			expect(state.grid.cells[0][0].tech).toBe("defense");
			expect(state.grid.cells[0][0].module).toBe("def_mod_1");
		});

		it("should handle resetting tech in entire grid", () => {
			const grid = createGrid(3, 3);

			// Fill entire grid with same tech
			for (let r = 0; r < 3; r++) {
				for (let c = 0; c < 3; c++) {
					grid.cells[r][c].active = true;
					grid.cells[r][c].tech = "defense";
					grid.cells[r][c].module = `def_mod_${r}_${c}`;
				}
			}

			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
				useGridStore.getState().resetGridTech("defense");
			});

			const state = useGridStore.getState();

			for (let r = 0; r < 3; r++) {
				for (let c = 0; c < 3; c++) {
					expect(state.grid.cells[r][c].tech).toBeNull();
					expect(state.grid.cells[r][c].module).toBeNull();
				}
			}
		});

		it("should reset tech while preserving cell active status", () => {
			const grid = createGrid(2, 2);
			grid.cells[0][0].active = true;
			grid.cells[0][0].tech = "defense";
			grid.cells[0][0].module = "def_mod";
			grid.cells[0][1].active = false;
			grid.cells[1][0].active = true;
			grid.cells[1][0].tech = "defense";
			grid.cells[1][0].module = "def_mod_2";

			act(() => {
				useGridStore.setState({ grid });
				useGridStore.getState().triggerRecompute();
				useGridStore.getState().resetGridTech("defense");
			});

			const state = useGridStore.getState();
			expect(state.grid.cells[0][0].active).toBe(true);
			expect(state.grid.cells[0][0].module).toBeNull();
			expect(state.grid.cells[0][1].active).toBe(false);
			expect(state.grid.cells[1][0].active).toBe(true);
			expect(state.grid.cells[1][0].module).toBeNull();
		});
	});

	describe("grid initialization with definition", () => {
		it("should apply initial grid definition", () => {
			const definition = {
				grid: [
					[
						{
							active: true,
							adjacency: "cardinal",
							adjacency_bonus: 10,
							bonus: 5,
							id: "mod_1",
							image: "image.png",
							label: "Module 1",
							sc_eligible: true,
							supercharged: false,
							tech: "defense",
							type: "shield",
							value: 100,
						},
					],
				],
				gridFixed: true,
				superchargedFixed: false,
			};

			act(() => {
				useGridStore.getState().setInitialGridDefinition(definition);
				useGridStore.getState().setGridFromInitialDefinition(definition);
			});

			const state = useGridStore.getState();
			expect(state.grid.height).toBe(1);
			expect(state.grid.width).toBe(1);
			expect(state.grid.cells[0][0].module).toBe("mod_1");
			expect(state.gridFixed).toBe(true);
			expect(state.superchargedFixed).toBe(false);
		});

		it("should preserve grid definition across resets", () => {
			const definition = {
				grid: [
					[
						{
							active: true,
							adjacency: "cardinal",
							adjacency_bonus: 10,
							bonus: 5,
							id: "mod_1",
							image: "image.png",
							label: "Module 1",
							sc_eligible: true,
							supercharged: false,
							tech: "defense",
							type: "shield",
							value: 100,
						},
					],
				],
				gridFixed: true,
				superchargedFixed: false,
			};

			let initialHeight = 0;

			act(() => {
				useGridStore.getState().setInitialGridDefinition(definition);
				useGridStore.getState().setGridFromInitialDefinition(definition);
				initialHeight = useGridStore.getState().grid.height;
			});

			expect(initialHeight).toBe(1);

			// Modify grid
			act(() => {
				const modGrid = createGrid(5, 5);
				useGridStore.setState({ grid: modGrid });
				useGridStore.getState().triggerRecompute();
			});

			expect(useGridStore.getState().grid.height).toBe(5);

			// Reset should restore from definition
			act(() => {
				useGridStore.getState().resetGrid();
			});

			const state = useGridStore.getState();
			expect(state.grid.height).toBe(initialHeight);
			expect(state.gridFixed).toBe(true);
		});
	});
});
