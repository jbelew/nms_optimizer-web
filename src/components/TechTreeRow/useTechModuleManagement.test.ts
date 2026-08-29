import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useTechStore } from "@/store/tech/techStore";

import { useTechModuleManagement } from "./useTechModuleManagement";

const mockModules = [
	{ id: "core1", image: "", label: "Core 1", type: "core" },
	{ id: "bonus1", image: "", label: "Bonus 1", type: "bonus" },
	{ id: "upgradeC", image: "", label: "Sigma Upgrade", type: "upgrade" },
	{ id: "upgradeB", image: "", label: "Tau Upgrade", type: "upgrade" },
	{ id: "upgradeA", image: "", label: "Theta Upgrade", type: "upgrade" },
	{ id: "reactor1", image: "", label: "Reactor 1", type: "reactor" },
	{ id: "cosmetic1", image: "", label: "Cosmetic 1", type: "cosmetic" },
];

describe("useTechModuleManagement", () => {
	beforeEach(() => {
		useTechStore.setState(() => ({
			activeGroups: {},
			checkedModules: {},
			techGroups: {},
		}));
	});

	it("should group modules correctly", () => {
		const { result } = renderHook(() => useTechModuleManagement("testTech", mockModules));

		expect(result.current.groupedModules.core).toHaveLength(1);
		expect(result.current.groupedModules.bonus).toHaveLength(1);
		expect(result.current.groupedModules.upgrade).toHaveLength(3);
		expect(result.current.groupedModules.reactor).toHaveLength(1);
		expect(result.current.groupedModules.cosmetic).toHaveLength(1);
	});

	it("should handle selecting and deselecting all non-core modules", () => {
		// Mock techGroups in store
		useTechStore.setState({
			techGroups: {
				testTech: [
					{
						color: "blue" as const,
						image: null,
						key: "testTech",
						label: "Test",
						module_count: mockModules.length,
						modules: mockModules.map((m) => ({
							...m,
							active: true,
							adjacency: "",
							adjacency_bonus: 0,
							bonus: 0,
							sc_eligible: false,
							supercharged: false,
							tech: "testTech",
							value: 0,
						})),
					},
				],
			},
		});

		const { result } = renderHook(() => useTechModuleManagement("testTech", mockModules));

		// Select all non-core
		act(() => {
			result.current.handleSelectAllChange(true);
		});

		expect(useTechStore.getState().checkedModules["testTech"]).toEqual(
			expect.arrayContaining([
				"core1",
				"bonus1",
				"upgradeC",
				"upgradeB",
				"upgradeA",
				"reactor1",
				"cosmetic1",
			])
		);

		// Deselect all non-core
		act(() => {
			result.current.handleSelectAllChange(false);
		});

		expect(useTechStore.getState().checkedModules["testTech"]).toEqual(["core1"]);
	});

	it("should handle dependency chains for upgrades end-to-end", () => {
		// Set up state in the actual store
		useTechStore.setState({
			checkedModules: {
				testTech: ["core1", "upgradeC", "upgradeB", "upgradeA"],
			},
			techGroups: {
				testTech: [
					{
						color: "blue" as const,
						image: null,
						key: "testTech",
						label: "Test",
						module_count: mockModules.length,
						modules: mockModules.map((m) => ({
							...m,
							active: true,
							adjacency: "",
							adjacency_bonus: 0,
							bonus: 0,
							sc_eligible: false,
							supercharged: false,
							tech: "testTech",
							value: 0,
						})),
					},
				],
			},
		});

		const { result } = renderHook(() => useTechModuleManagement("testTech", mockModules));

		// Deselecting Tau (upgradeB) should also deselect Sigma (upgradeC)
		act(() => {
			result.current.handleValueChange(["core1", "upgradeC", "upgradeA"]); // upgradeB removed
		});

		// Expect both upgradeB and upgradeC to be removed from the checkedModules
		expect(useTechStore.getState().checkedModules["testTech"]).toEqual(["core1", "upgradeA"]);
	});

	it("should cascade deselection from Theta to Tau and Sigma", () => {
		useTechStore.setState({
			checkedModules: {
				testTech: ["core1", "upgradeC", "upgradeB", "upgradeA"],
			},
			techGroups: {
				testTech: [
					{
						color: "blue" as const,
						image: null,
						key: "testTech",
						label: "Test",
						module_count: mockModules.length,
						modules: mockModules.map((m) => ({
							...m,
							active: true,
							adjacency: "",
							adjacency_bonus: 0,
							bonus: 0,
							sc_eligible: false,
							supercharged: false,
							tech: "testTech",
							value: 0,
						})),
					},
				],
			},
		});

		const { result } = renderHook(() => useTechModuleManagement("testTech", mockModules));

		// Deselecting Theta (upgradeA) should also deselect Tau (upgradeB) and Sigma (upgradeC)
		act(() => {
			result.current.handleValueChange(["core1", "upgradeC", "upgradeB"]); // upgradeA removed
		});

		expect(useTechStore.getState().checkedModules["testTech"]).toEqual(["core1"]);
	});
});
