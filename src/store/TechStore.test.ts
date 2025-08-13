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
});
