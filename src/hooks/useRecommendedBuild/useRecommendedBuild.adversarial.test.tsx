import type { ApiResponse } from "../../store/GridStore";
import type { BonusStatusData } from "../../store/TechBonusStore";
import type { TechTreeItem } from "../useTechTree/useTechTree";
import { beforeEach, describe, expect, it } from "vitest";

import { createGrid, useGridStore } from "../../store/GridStore";
import { useModuleSelectionStore } from "../../store/ModuleSelectionStore";
import { useTechBonusStore } from "../../store/TechBonusStore";
import { useTechStore } from "../../store/TechStore";

describe("useRecommendedBuild - Adversarial Tests", () => {
	beforeEach(() => {
		useModuleSelectionStore.setState({ moduleSelections: {} });
		useTechStore.setState({
			techGroups: {},
			checkedModules: {},
			activeGroups: {},
			max_bonus: {},
			solved_bonus: {},
			solve_method: {},
			techColors: {},
		});
		useTechBonusStore.setState({ bonusStatus: {} });
		useGridStore.setState({ grid: createGrid(10, 6), result: null, isSharedGrid: false });
		localStorage.clear();
	});

	it("should preserve module selections when applying a recommended build", () => {
		// Pre-populate module selections
		useModuleSelectionStore.getState().setModuleSelection("tech1", ["module1", "module2"]);
		useModuleSelectionStore.getState().setModuleSelection("tech2", ["module3"]);

		expect(useModuleSelectionStore.getState().moduleSelections).toEqual({
			tech1: ["module1", "module2"],
			tech2: ["module3"],
		});

		// Apply a recommended build (just change the grid)
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		// Module selections should still be there
		expect(useModuleSelectionStore.getState().moduleSelections).toEqual({
			tech1: ["module1", "module2"],
			tech2: ["module3"],
		});
	});

	it("should NOT clear module selections when applying a recommended build", () => {
		// This is the opposite of switching ships
		const bonusData: BonusStatusData = {
			icon: "check",
			percent: 100,
			tooltipContent: "Test",
			iconClassName: "test",
			iconStyle: { color: "green" },
		};
		useTechBonusStore.getState().setBonusStatus("tech1", bonusData);
		useModuleSelectionStore.getState().setModuleSelection("bonus_tech", ["bonus_module"]);

		// Apply recommended build
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		// Tech bonus should still be there (not cleared)
		expect(useTechBonusStore.getState().bonusStatus.tech1).toEqual(bonusData);
		// Module selections should still be there (not cleared)
		expect(useModuleSelectionStore.getState().moduleSelections.bonus_tech).toEqual([
			"bonus_module",
		]);
	});

	it("should clear selections when switching ships but NOT when applying recommended build", () => {
		// Set up initial state
		useModuleSelectionStore.getState().setModuleSelection("tech1", ["module1"]);

		// Apply recommended build - selections should remain
		const newGridBuild = createGrid(10, 6);
		useGridStore.getState().setGrid(newGridBuild);
		expect(useModuleSelectionStore.getState().moduleSelections.tech1).toEqual(["module1"]);

		// Now switch ships - this should clear selections
		const newGridShipSwitch = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGridShipSwitch);
		expect(useModuleSelectionStore.getState().moduleSelections).toEqual({});
	});

	it("should apply multiple recommended builds without losing module selections", () => {
		// Set module selections
		useModuleSelectionStore
			.getState()
			.setModuleSelection("persistent_tech", ["persistent_module"]);

		// Apply first recommended build
		let newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		expect(useModuleSelectionStore.getState().moduleSelections.persistent_tech).toEqual([
			"persistent_module",
		]);

		// Apply second recommended build
		newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		// Selections should still be there
		expect(useModuleSelectionStore.getState().moduleSelections.persistent_tech).toEqual([
			"persistent_module",
		]);
	});

	it("should preserve module selections across ship switch then build apply", () => {
		// Set module selections for Ship 1
		useModuleSelectionStore.getState().setModuleSelection("ship1_tech", ["ship1_module"]);

		// Switch ships - clears selections
		let newGrid = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGrid);

		expect(useModuleSelectionStore.getState().moduleSelections).toEqual({});

		// Load new ship's tech tree with selections
		useModuleSelectionStore.getState().setModuleSelection("ship2_tech", ["ship2_module"]);

		// Apply recommended build - should NOT clear the selections
		newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		expect(useModuleSelectionStore.getState().moduleSelections.ship2_tech).toEqual([
			"ship2_module",
		]);
		expect(useModuleSelectionStore.getState().moduleSelections.ship1_tech).toBeUndefined();
	});

	it("should not clear tech bonus status when applying recommended build", () => {
		// Set bonus status
		const bonusData: BonusStatusData = {
			icon: "lightning",
			percent: 150,
			tooltipContent: "Boosted!",
			iconClassName: "boosted",
			iconStyle: { color: "gold" },
		};
		useTechBonusStore.getState().setBonusStatus("boosted_tech", bonusData);

		// Apply recommended build
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		// Bonus status should be preserved
		expect(useTechBonusStore.getState().bonusStatus.boosted_tech).toEqual(bonusData);
	});

	it("should NOT clear checked modules when applying recommended build", () => {
		// Set up tech groups with checked modules
		const mockModule = {
			id: "checked_module",
			checked: true,
			bonus: 10,
			label: "Module",
		} as unknown as TechTreeItem["modules"][0];
		const mockTechGroup = {
			key: "checked_tech",
			type: "normal",
			color: "#FF0000",
			modules: [mockModule],
		} as unknown as TechTreeItem;

		useTechStore.getState().setTechGroups({ checked_tech: [mockTechGroup] });

		// checkedModules should be populated
		expect(useTechStore.getState().checkedModules.checked_tech).toEqual(["checked_module"]);

		// Apply recommended build
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		// checkedModules should still be there
		expect(useTechStore.getState().checkedModules.checked_tech).toEqual(["checked_module"]);
	});

	it("should clear selections when switching ships but preserve when building", () => {
		// Ship 1 selections
		useModuleSelectionStore.getState().setModuleSelection("tech1", ["module1"]);
		useTechBonusStore.getState().setBonusStatus("tech1", {
			icon: "check",
			percent: 100,
			tooltipContent: "Test",
			iconClassName: "test",
			iconStyle: { color: "green" },
		});

		// Apply a build - selections preserved
		let newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		expect(useModuleSelectionStore.getState().moduleSelections.tech1).toEqual(["module1"]);
		expect(useTechBonusStore.getState().bonusStatus.tech1).toBeDefined();

		// Switch ships - selections cleared
		newGrid = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGrid);

		expect(useModuleSelectionStore.getState().moduleSelections).toEqual({});
		expect(useTechBonusStore.getState().bonusStatus).toEqual({});

		// Ship 2 selections
		useModuleSelectionStore.getState().setModuleSelection("tech2", ["module2"]);

		// Apply a build - selections preserved
		newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		expect(useModuleSelectionStore.getState().moduleSelections.tech2).toEqual(["module2"]);
		expect(useModuleSelectionStore.getState().moduleSelections.tech1).toBeUndefined();
	});

	it("should handle applying recommended build after grid result is set", () => {
		// Set optimization result
		const mockResult: ApiResponse = {
			grid: null,
			max_bonus: 100,
			solved_bonus: 50,
			solve_method: "method1",
		};
		useGridStore.getState().setResult(mockResult, "tech1");

		expect(useGridStore.getState().result).toBeDefined();

		// Set module selections
		useModuleSelectionStore.getState().setModuleSelection("tech1", ["module1"]);

		// Apply recommended build - should preserve module selections but grid state is updated
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		// Grid is updated
		expect(useGridStore.getState().grid).toEqual(newGrid);
		// But module selections are preserved (NOT cleared)
		expect(useModuleSelectionStore.getState().moduleSelections.tech1).toEqual(["module1"]);
	});
});
