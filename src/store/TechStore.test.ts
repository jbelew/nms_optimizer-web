import { beforeEach, describe, expect, it } from "vitest";

import { useTechStore } from "./TechStore";

describe("TechStore", () => {
	beforeEach(() => {
		// Reset the store before each test
		useTechStore.setState(() => ({
			max_bonus: {},
			solved_bonus: {},
			solve_method: {},
			techColors: {},
			checkedModules: {}, // Add closing parenthesis here
		}));
	});

	it("should have a default state", () => {
		const { max_bonus, solved_bonus, solve_method, techColors, checkedModules } =
			useTechStore.getState();
		expect(max_bonus).toEqual({});
		expect(solved_bonus).toEqual({});
		expect(solve_method).toEqual({});
		expect(techColors).toEqual({});
		expect(checkedModules).toEqual({});
	});

	it("should set and clear max bonus for a tech", () => {
		const { setTechMaxBonus, clearTechMaxBonus } = useTechStore.getState();
		setTechMaxBonus("test-tech", 100);
		expect(useTechStore.getState().max_bonus["test-tech"]).toBe(100);
		clearTechMaxBonus("test-tech");
		expect(useTechStore.getState().max_bonus["test-tech"]).toBe(0);
	});

	it("should set and clear solved bonus for a tech", () => {
		const { setTechSolvedBonus, clearTechSolvedBonus } = useTechStore.getState();
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
		const { setTechColors, getTechColor } = useTechStore.getState();
		const colors = { "test-tech": "red" };
		setTechColors(colors);
		expect(useTechStore.getState().techColors).toEqual(colors);
		expect(getTechColor("test-tech")).toBe("red");
		expect(getTechColor("unknown-tech")).toBeUndefined();
	});

	it("should set and clear checked modules for a tech", () => {
		const { setCheckedModules, clearCheckedModules } = useTechStore.getState();
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
		const { setTechMaxBonus, setTechSolvedBonus, clearResult } = useTechStore.getState();
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
					label: "Test",
					key: "test-tech",
					modules: [
						{
							id: "mod1",
							checked: true,
							active: true,
							adjacency: "",
							adjacency_bonus: 0,
							bonus: 5,
							image: "",
							label: "Module 1",
							sc_eligible: false,
							supercharged: false,
							tech: "test-tech",
							type: "",
							value: 10,
						},
						{
							id: "mod2",
							checked: false,
							active: true,
							adjacency: "",
							adjacency_bonus: 0,
							bonus: 3,
							image: "",
							label: "Module 2",
							sc_eligible: false,
							supercharged: false,
							tech: "test-tech",
							type: "",
							value: 8,
						},
					],
					image: null,
					color: "red" as const,
					module_count: 2,
				},
			],
		};
		setTechGroups(mockTechGroups);
		expect(useTechStore.getState().techGroups).toEqual(mockTechGroups);
		expect(useTechStore.getState().checkedModules["test-tech"]).toEqual(["mod1"]);
	});

	it("should set tech groups with no modules", () => {
		const { setTechGroups } = useTechStore.getState();
		const mockTechGroups = {
			"test-tech": [
				{
					label: "Test",
					key: "test-tech",
					modules: [],
					image: null,
					color: "red" as const,
					module_count: 0,
				},
			],
		};
		setTechGroups(mockTechGroups);
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
