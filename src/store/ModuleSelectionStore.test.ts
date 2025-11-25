import type { TechTreeItem } from "../hooks/useTechTree/useTechTree";
import type { BonusStatusData } from "./TechBonusStore";
import { beforeEach, describe, expect, it } from "vitest";

import { createGrid, useGridStore } from "./GridStore";
import { useModuleSelectionStore } from "./ModuleSelectionStore";
import { useTechBonusStore } from "./TechBonusStore";
import { useTechStore } from "./TechStore";

describe("ModuleSelectionStore - Ship Type Switching", () => {
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
		useGridStore.setState({ grid: useGridStore.getState().grid });
		localStorage.clear();
	});

	it("should clear module selections when switching ship types via setGridAndResetAuxiliaryState", () => {
		// Start with ship 1 selections
		useModuleSelectionStore.getState().setModuleSelection("tech1", ["module1", "module2"]);
		useModuleSelectionStore.getState().setModuleSelection("tech2", ["module3"]);

		expect(useModuleSelectionStore.getState().moduleSelections).toEqual({
			tech1: ["module1", "module2"],
			tech2: ["module3"],
		});

		// Simulate switching ship types
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGrid);

		// Module selections should be cleared
		expect(useModuleSelectionStore.getState().moduleSelections).toEqual({});
	});

	it("should clear localStorage when switching ship types", () => {
		// Set up initial state
		useModuleSelectionStore.getState().setModuleSelection("tech1", ["module1"]);
		localStorage.setItem(
			"moduleSelectionState",
			JSON.stringify({ moduleSelections: { tech1: ["module1"] } })
		);

		expect(localStorage.getItem("moduleSelectionState")).not.toBeNull();

		// Switch ship types
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGrid);

		// localStorage should be cleared
		expect(localStorage.getItem("moduleSelectionState")).toBeNull();
	});

	it("should clear techGroups and checkedModules when switching ship types", () => {
		const mockModule = {
			id: "module1",
			checked: true,
			bonus: 10,
			label: "Module 1",
		} as unknown as TechTreeItem["modules"][0];
		const mockTechGroup = {
			key: "tech1",
			type: "normal",
			color: "#FF0000",
			modules: [mockModule],
		} as unknown as TechTreeItem;

		const mockTechGroups = {
			tech1: [mockTechGroup],
		};

		useTechStore.getState().setTechGroups(mockTechGroups);

		expect(useTechStore.getState().techGroups).toEqual(mockTechGroups);
		expect(useTechStore.getState().checkedModules).toEqual({
			tech1: ["module1"],
		});

		// Switch ship types
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGrid);

		// techGroups and checkedModules should be cleared
		expect(useTechStore.getState().techGroups).toEqual({});
		expect(useTechStore.getState().checkedModules).toEqual({});
		expect(useTechStore.getState().activeGroups).toEqual({});
	});

	it("should not carry over selections from ship 1 to ship 2", () => {
		// Ship 1: Set selections
		const ship1Module = {
			id: "ship1module",
			checked: true,
			bonus: 10,
			label: "Module",
		} as unknown as TechTreeItem["modules"][0];
		const ship1TechGroup = {
			key: "ship1tech",
			type: "normal",
			color: "#FF0000",
			modules: [ship1Module],
		} as unknown as TechTreeItem;

		const ship1Groups = {
			ship1tech: [ship1TechGroup],
		};

		useTechStore.getState().setTechGroups(ship1Groups);
		useModuleSelectionStore.getState().setModuleSelection("ship1tech", ["ship1module"]);

		// Switch to Ship 2
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGrid);

		// Load Ship 2 tech groups
		const ship2Module = {
			id: "ship2module",
			checked: false,
			bonus: 5,
			label: "Module",
		} as unknown as TechTreeItem["modules"][0];
		const ship2TechGroup = {
			key: "ship2tech",
			type: "normal",
			color: "#0000FF",
			modules: [ship2Module],
		} as unknown as TechTreeItem;

		const ship2Groups = {
			ship2tech: [ship2TechGroup],
		};

		useTechStore.getState().setTechGroups(ship2Groups);

		// Ship 2 should use API defaults, not Ship 1 selections
		expect(useModuleSelectionStore.getState().moduleSelections).toEqual({});
		expect(useTechStore.getState().checkedModules.ship2tech).toEqual([]);
	});

	it("should restore persisted selections when loading a build", () => {
		// Set selections directly to the store (simulating hydration from localStorage)
		useModuleSelectionStore.setState({
			moduleSelections: {
				buildtech: ["buildmodule1", "buildmodule2"],
			},
		});

		const store = useModuleSelectionStore.getState();
		expect(store.getModuleSelection("buildtech")).toEqual(["buildmodule1", "buildmodule2"]);
	});

	it("should allow switching ships then loading a build without carrying ship 1 selections", () => {
		// Ship 1: Set selections
		useModuleSelectionStore.getState().setModuleSelection("tech1", ["module1"]);

		// Switch ships (clears selections)
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGrid);

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
			tooltipContent: "Test",
			iconClassName: "test",
			iconStyle: { color: "green" },
		};
		useTechBonusStore.getState().setBonusStatus("tech1", bonusData);

		expect(useTechBonusStore.getState().bonusStatus.tech1).toEqual(bonusData);

		// Switch ship types
		const newGrid = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGrid);

		// Bonus state should be cleared
		expect(useTechBonusStore.getState().bonusStatus).toEqual({});
	});

	it("should handle multiple sequential ship switches without leaking state", () => {
		// Ship 1
		const ship1Module = { id: "mod1", checked: true } as unknown as TechTreeItem["modules"][0];
		const ship1TechGroup = {
			key: "tech1",
			type: "normal",
			color: "#FF0000",
			modules: [ship1Module],
		} as unknown as TechTreeItem;
		const ship1Groups = {
			tech1: [ship1TechGroup],
		};
		useTechStore.getState().setTechGroups(ship1Groups);
		useModuleSelectionStore.getState().setModuleSelection("tech1", ["mod1"]);

		// Switch to Ship 2
		let newGrid = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGrid);

		const ship2Module = { id: "mod2", checked: false } as unknown as TechTreeItem["modules"][0];
		const ship2TechGroup = {
			key: "tech2",
			type: "normal",
			color: "#0000FF",
			modules: [ship2Module],
		} as unknown as TechTreeItem;
		const ship2Groups = {
			tech2: [ship2TechGroup],
		};
		useTechStore.getState().setTechGroups(ship2Groups);
		useModuleSelectionStore.getState().setModuleSelection("tech2", ["mod2"]);

		// Switch to Ship 3
		newGrid = createGrid(10, 6);
		useGridStore.getState().setGridAndResetAuxiliaryState(newGrid);

		const ship3Module = { id: "mod3", checked: true } as unknown as TechTreeItem["modules"][0];
		const ship3TechGroup = {
			key: "tech3",
			type: "normal",
			color: "#00FF00",
			modules: [ship3Module],
		} as unknown as TechTreeItem;
		const ship3Groups = {
			tech3: [ship3TechGroup],
		};
		useTechStore.getState().setTechGroups(ship3Groups);

		// Ship 3 should only have its default selections, not Ship 1 or Ship 2
		const selections = useModuleSelectionStore.getState().moduleSelections;
		expect(selections.tech1).toBeUndefined();
		expect(selections.tech2).toBeUndefined();
		expect(selections.tech3).toBeUndefined(); // Should use API defaults
	});
});
