import { beforeEach, describe, expect, it } from "vitest";

import { useTechStore } from "./techStore";

describe("TechStore", () => {
	beforeEach(() => {
		// Reset the store before each test
		useTechStore.setState(() => ({
			checkedModules: {}, // Add closing parenthesis here
			max_bonus: {},
			solve_method: {},
			solved_bonus: {},
			techColors: {},
		}));
	});

	it("should have a default state", () => {
		const { checkedModules, max_bonus, solve_method, solved_bonus, techColors } =
			useTechStore.getState();
		expect(max_bonus).toEqual({});
		expect(solved_bonus).toEqual({});
		expect(solve_method).toEqual({});
		expect(techColors).toEqual({});
		expect(checkedModules).toEqual({});
	});

	it("should set and clear max bonus for a tech", () => {
		const { clearTechMaxBonus, setTechMaxBonus } = useTechStore.getState();
		setTechMaxBonus("test-tech", 100);
		expect(useTechStore.getState().max_bonus["test-tech"]).toBe(100);
		clearTechMaxBonus("test-tech");
		expect(useTechStore.getState().max_bonus["test-tech"]).toBe(0);
	});

	it("should set and clear solved bonus for a tech", () => {
		const { clearTechSolvedBonus, setTechSolvedBonus } = useTechStore.getState();
		setTechSolvedBonus("test-tech", 90);
		expect(useTechStore.getState().solved_bonus["test-tech"]).toBe(90);
		clearTechSolvedBonus("test-tech");
		expect(useTechStore.getState().solved_bonus["test-tech"]).toBe(0);
	});

	it("should set solve method for a tech", () => {
		const { setTechSolveMethod } = useTechStore.getState();
		setTechSolveMethod("test-tech", "test-method");
		expect(useTechStore.getState().solve_method["test-tech"]).toBe("test-method");
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
		expect(useTechStore.getState().max_bonus).toEqual({});
		expect(useTechStore.getState().solved_bonus).toEqual({});
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
});
