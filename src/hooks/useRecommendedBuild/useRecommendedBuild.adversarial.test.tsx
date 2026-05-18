import type { Cell, Grid } from "@/store/grid/gridStore";
import type { BonusStatusData } from "@/store/tech/techBonusStore";
import type { TechTreeItem } from "@/types/tech";
import { beforeEach, describe, expect, it } from "vitest";

import { createEmptyCell, useGridStore } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { useModuleSelectionStore } from "@/store/tech/moduleSelectionStore";
import { useTechBonusStore } from "@/store/tech/techBonusStore";
import { useTechStore } from "@/store/tech/techStore";

// Helper to create a basic grid that matches the required type properly
const createGrid = (width: number, height: number): Grid => {
	const cells: Cell[][] = Array(height)
		.fill(null)
		.map(() =>
			Array(width)
				.fill(null)
				.map(() => ({
					...createEmptyCell(),
					active: true,
				}))
		);

	return {
		cells,
		height,
		width,
	};
};

describe("useRecommendedBuild Adversarial Tests", () => {
	beforeEach(() => {
		// Reset stores before each test
		useGridStore.getState().resetGrid();
		useModuleSelectionStore.getState().clearAllModuleSelections();
		useTechBonusStore.getState().clearAllBonusStatus();
		useTechStore.getState().clearResult();
	});

	it("should preserve module selections when the tech tree is updated but tech remains", () => {
		// Set initial module selections
		useModuleSelectionStore.getState().setModuleSelection("tech1", ["module1", "module2"]);
		useModuleSelectionStore.getState().setModuleSelection("tech2", ["module3"]);

		// Simulate applying a build (updating grid)
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
		sessionCoordinator.switchPlatform(newGridShipSwitch);
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
		sessionCoordinator.switchPlatform(newGrid);

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
			icon: "check",
			percent: 0,
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
			bonus: 10,
			checked: true,
			id: "checked_module",
			label: "Module",
		} as unknown as TechTreeItem["modules"][0];
		const mockTechGroup = {
			color: "#FF0000",
			key: "checked_tech",
			modules: [mockModule],
			type: "normal",
		} as unknown as TechTreeItem;

		sessionCoordinator.setTechGroups({ checked_tech: [mockTechGroup] });

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
		});

		// Apply a build - selections preserved
		let newGrid = createGrid(10, 6);
		useGridStore.getState().setGrid(newGrid);

		expect(useModuleSelectionStore.getState().moduleSelections.tech1).toEqual(["module1"]);
		expect(useTechBonusStore.getState().bonusStatus.tech1).toBeDefined();

		// Switch ships - selections cleared
		newGrid = createGrid(10, 6);
		sessionCoordinator.switchPlatform(newGrid);

		// Load build with different selections
		useModuleSelectionStore.getState().setModuleSelection("tech2", ["module2", "module3"]);

		// Should only have build selections, not ship 1's tech1
		const selections = useModuleSelectionStore.getState().moduleSelections;
		expect(selections.tech1).toBeUndefined();
		expect(selections.tech2).toEqual(["module2", "module3"]);
	});

	it("should clear tech bonus state when switching ship types", () => {
		// Set some bonus state
		const bonusData: BonusStatusData = {
			icon: "check",
			percent: 100,
		};
		useTechBonusStore.getState().setBonusStatus("tech1", bonusData);

		expect(useTechBonusStore.getState().bonusStatus.tech1).toEqual(bonusData);

		// Switch ship types
		const newGrid = createGrid(10, 6);
		sessionCoordinator.switchPlatform(newGrid);

		// Bonus state should be cleared
		expect(useTechBonusStore.getState().bonusStatus).toEqual({});
	});
});
