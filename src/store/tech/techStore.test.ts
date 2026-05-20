import { beforeEach, describe, expect, it } from "vitest";

import { useTechStore } from "./techStore";

describe("TechStore", () => {
	beforeEach(() => {
		// Reset the store before each test
		useTechStore.setState(() => ({
			checkedModules: {}, // Add closing parenthesis here
			maxBonus: {},
			solvedBonus: {},
			solveMethod: {},
			techColors: {},
		}));
	});

	it("should have a default state", () => {
		const { checkedModules, maxBonus, solvedBonus, solveMethod, techColors } =
			useTechStore.getState();
		expect(maxBonus).toEqual({});
		expect(solvedBonus).toEqual({});
		expect(solveMethod).toEqual({});
		expect(techColors).toEqual({});
		expect(checkedModules).toEqual({});
	});

	it("should set and clear max bonus for a tech", () => {
		const { clearTechMaxBonus, setTechMaxBonus } = useTechStore.getState();
		setTechMaxBonus("test-tech", 100);
		expect(useTechStore.getState().maxBonus["test-tech"]).toBe(100);
		clearTechMaxBonus("test-tech");
		expect(useTechStore.getState().maxBonus["test-tech"]).toBe(0);
	});

	it("should set and clear solved bonus for a tech", () => {
		const { clearTechSolvedBonus, setTechSolvedBonus } = useTechStore.getState();
		setTechSolvedBonus("test-tech", 90);
		expect(useTechStore.getState().solvedBonus["test-tech"]).toBe(90);
		clearTechSolvedBonus("test-tech");
		expect(useTechStore.getState().solvedBonus["test-tech"]).toBe(0);
	});

	it("should set solve method for a tech", () => {
		const { setTechSolveMethod } = useTechStore.getState();
		setTechSolveMethod("test-tech", "test-method");
		expect(useTechStore.getState().solveMethod["test-tech"]).toBe("test-method");
	});

	it("should set and get tech colors", () => {
		const { getTechColor, setTechColors } = useTechStore.getState();
		const colors = { "test-tech": "red" };
		setTechColors(colors);
		expect(useTechStore.getState().techColors).toEqual(colors);
		expect(getTechColor("test-tech")).toBe("red");
		expect(getTechColor("unknown-tech")).toBeUndefined();
	});

	it("should set and clear checked modules for a tech", () => {
		const { clearCheckedModules, setCheckedModules } = useTechStore.getState();
		setCheckedModules("test-tech", () => ["module1", "module2"]);
		expect(useTechStore.getState().checkedModules["test-tech"]).toEqual(["module1", "module2"]);
		clearCheckedModules("test-tech");
		expect(useTechStore.getState().checkedModules["test-tech"]).toEqual([]);
	});

	it("should update checked modules for a tech", () => {
		const { setCheckedModules } = useTechStore.getState();
		setCheckedModules("test-tech", () => ["module1"]);
		setCheckedModules("test-tech", (prev) => [...(prev || []), "module2"]);
		expect(useTechStore.getState().checkedModules["test-tech"]).toEqual(["module1", "module2"]);
	});

	it("should clear result", () => {
		const { clearResult, setTechMaxBonus, setTechSolvedBonus } = useTechStore.getState();
		setTechMaxBonus("test-tech", 100);
		setTechSolvedBonus("test-tech", 90);
		clearResult();
		expect(useTechStore.getState().maxBonus).toEqual({});
		expect(useTechStore.getState().solvedBonus).toEqual({});
	});

	it("should set tech groups and initialize checked modules", () => {
		const { setTechGroups } = useTechStore.getState();
		const mockTechGroups = {
			"test-tech": [
				{
					color: "red" as const,
					image: null,
					key: "test-tech",
					label: "Test",
					module_count: 2,
					modules: [
						{
							active: true,
							adjacency: "",
							adjacency_bonus: 0,
							bonus: 5,
							checked: true,
							id: "mod1",
							image: "",
							label: "Module 1",
							sc_eligible: false,
							supercharged: false,
							tech: "test-tech",
							type: "",
							value: 10,
						},
						{
							active: true,
							adjacency: "",
							adjacency_bonus: 0,
							bonus: 3,
							checked: false,
							id: "mod2",
							image: "",
							label: "Module 2",
							sc_eligible: false,
							supercharged: false,
							tech: "test-tech",
							type: "",
							value: 8,
						},
					],
				},
			],
		};
		setTechGroups(mockTechGroups, { "test-tech": ["mod1"] });
		expect(useTechStore.getState().techGroups).toEqual(mockTechGroups);
		expect(useTechStore.getState().checkedModules["test-tech"]).toEqual(["mod1"]);
	});

	it("should set tech groups with no modules", () => {
		const { setTechGroups } = useTechStore.getState();
		const mockTechGroups = {
			"test-tech": [
				{
					color: "red" as const,
					image: null,
					key: "test-tech",
					label: "Test",
					module_count: 0,
					modules: [],
				},
			],
		};
		setTechGroups(mockTechGroups, { "test-tech": [] });
		expect(useTechStore.getState().techGroups).toEqual(mockTechGroups);
		expect(useTechStore.getState().checkedModules["test-tech"]).toEqual([]);
	});

	it("should set active group for a tech", () => {
		const { setActiveGroup } = useTechStore.getState();
		setActiveGroup("test-tech", "normal");
		expect(useTechStore.getState().activeGroups["test-tech"]).toBe("normal");
		setActiveGroup("test-tech", "max");
		expect(useTechStore.getState().activeGroups["test-tech"]).toBe("max");
	});

	it("should initialize the tech tree", () => {
		const { initializeTechTree } = useTechStore.getState();
		const colors = { "test-tech": "blue" };
		const mockTechGroups = {
			"test-tech": [
				{
					color: "blue" as const,
					image: null,
					key: "test-tech",
					label: "Test",
					module_count: 0,
					modules: [],
				},
			],
		};
		const activeGroups = { "test-tech": "default" };
		const initialChecked = { "test-tech": ["mod1"] };

		initializeTechTree(colors, mockTechGroups, activeGroups, initialChecked);

		expect(useTechStore.getState().techColors).toEqual(colors);
		expect(useTechStore.getState().techGroups).toEqual(mockTechGroups);
		expect(useTechStore.getState().activeGroups).toEqual(activeGroups);
		expect(useTechStore.getState().checkedModules).toEqual(initialChecked);
	});

	it("should synchronize snake_case aliases correctly via syncAliases", () => {
		const { setTechMaxBonus, setTechSolvedBonus, setTechSolveMethod } = useTechStore.getState();

		setTechMaxBonus("test-tech", 500);
		expect(useTechStore.getState().max_bonus["test-tech"]).toBe(500);

		setTechSolvedBonus("test-tech", 450);
		expect(useTechStore.getState().solved_bonus["test-tech"]).toBe(450);

		setTechSolveMethod("test-tech", "annealing");
		expect(useTechStore.getState().solve_method["test-tech"]).toBe("annealing");
	});

	it("should clear all checked modules and reset to default tree selections", () => {
		const { clearAllCheckedModules, initializeTechTree } = useTechStore.getState();
		const mockTechGroups = {
			"test-tech": [
				{
					color: "blue" as const,
					image: null,
					key: "test-tech",
					label: "Test",
					module_count: 2,
					modules: [
						{
							active: true,
							adjacency: "",
							adjacency_bonus: 0,
							bonus: 5,
							checked: true, // default checked
							id: "mod1",
							image: "",
							label: "Module 1",
							sc_eligible: false,
							supercharged: false,
							tech: "test-tech",
							type: "",
							value: 10,
						},
						{
							active: true,
							adjacency: "",
							adjacency_bonus: 0,
							bonus: 3,
							checked: false, // default unchecked
							id: "mod2",
							image: "",
							label: "Module 2",
							sc_eligible: false,
							supercharged: false,
							tech: "test-tech",
							type: "",
							value: 8,
						},
					],
				},
			],
		};

		initializeTechTree({}, mockTechGroups, {}, { "test-tech": ["mod1", "mod2"] });
		// Manually checked both, but default has mod1 as checked.
		expect(useTechStore.getState().checkedModules["test-tech"]).toEqual(["mod1", "mod2"]);

		clearAllCheckedModules();

		// Should reset to only the default checked ones ("mod1")
		expect(useTechStore.getState().checkedModules["test-tech"]).toEqual(["mod1"]);
	});

	it("should handle batch active groups update", () => {
		const { setActiveGroups } = useTechStore.getState();
		setActiveGroups({ "tech-a": "proc", "tech-b": "max" });
		expect(useTechStore.getState().activeGroups).toEqual({ "tech-a": "proc", "tech-b": "max" });
	});

	it("should clear tech groups completely", () => {
		const { clearTechGroups, initializeTechTree } = useTechStore.getState();
		initializeTechTree({ a: "red" }, { a: [] }, { a: "default" }, { a: ["mod"] });

		clearTechGroups();

		expect(useTechStore.getState().activeGroups).toEqual({});
		expect(useTechStore.getState().checkedModules).toEqual({});
		expect(useTechStore.getState().techGroups).toEqual({});
	});
});
