import { describe, expect, it } from "vitest";

import {
	ALPHABETICAL_MODULE_GROUPS,
	areAllModulesSelected,
	getModulePrerequisites,
	getSelectAllModuleIds,
	getTechnologyTranslationKey,
	groupModules,
	MODULE_GROUP_ORDER,
	MODULE_RANK_ORDER,
	RANKED_MODULE_GROUPS,
	resolveActiveTechVariant,
	validateModuleSelections,
} from "./techRules";

const mockModules = [
	{ id: "core1", label: "Core Module", type: "core" },
	{ id: "theta1", label: "Upgrade Module Theta", type: "upgrade" },
	{ id: "tau1", label: "Upgrade Module Tau", type: "upgrade" },
	{ id: "sigma1", label: "Upgrade Module Sigma", type: "upgrade" },
	{ id: "theta2", label: "Reactor Theta", type: "reactor" },
	{ id: "tau2", label: "Reactor Tau", type: "reactor" },
	{ id: "sigma2", label: "Reactor Sigma", type: "reactor" },
	{ id: "independent1", label: "Independent Upgrade", type: "upgrade" },
];

describe("techRules", () => {
	describe("constants", () => {
		it("exports canonical Module Rank Order and Module Group constants", () => {
			expect(MODULE_RANK_ORDER).toEqual(["Theta", "Tau", "Sigma"]);
			expect(RANKED_MODULE_GROUPS).toEqual(["atlantid", "cosmetic", "reactor", "upgrade"]);
			expect(ALPHABETICAL_MODULE_GROUPS).toEqual(["bonus", "figurines", "trails"]);
			expect(MODULE_GROUP_ORDER).toEqual([
				"core",
				"figurines",
				"bonus",
				"upgrade",
				"atlantid",
				"reactor",
				"cosmetic",
				"trails",
			]);
		});
	});

	describe("groupModules", () => {
		it("segregates modules into canonical Module Groups including figurine heuristic and alphabetical sorting", () => {
			const grouped = groupModules([
				{ id: "core1", label: "Core 1", type: "core" },
				{ id: "bonus2", label: "Beta Bonus", type: "bonus" },
				{ id: "bonus1", label: "Alpha Bonus", type: "bonus" },
				{ id: "fig2", label: "Polo Figurine", type: "bonus" },
				{ id: "fig1", label: "Artemis Figurine", type: "upgrade" },
				{ id: "trail2", label: "Emerald Trail", type: "trails" },
				{ id: "trail1", label: "Cadmium Trail", type: "trails" },
				{ id: "unknown1", label: "Mystery Module", type: "nonexistent" },
			]);

			expect(grouped.core.map((m) => m.id)).toEqual(["core1"]);
			expect(grouped.bonus.map((m) => m.id)).toEqual(["bonus1", "bonus2"]);
			expect(grouped.figurines.map((m) => m.id)).toEqual(["fig1", "fig2"]);
			expect(grouped.trails.map((m) => m.id)).toEqual(["trail1", "trail2"]);
			expect(grouped.upgrade.map((m) => m.id)).toEqual(["unknown1"]);
		});
	});

	describe("getModulePrerequisites", () => {
		it("maps lower-rank modules to their immediate higher-rank prerequisite in rank-validated Module Groups", () => {
			const map = getModulePrerequisites("upgrade", [
				{ id: "theta1", label: "Upgrade Theta" },
				{ id: "tau1", label: "Upgrade Tau" },
				{ id: "sigma1", label: "Upgrade Sigma" },
				{ id: "other", label: "Standalone Upgrade" },
			]);

			expect(map.get("theta1")).toBeUndefined();
			expect(map.get("tau1")).toBe("theta1");
			expect(map.get("sigma1")).toBe("tau1");
			expect(map.get("other")).toBeUndefined();
		});

		it("returns an empty map for non-validated Module Groups", () => {
			const map = getModulePrerequisites("bonus", [
				{ id: "theta1", label: "Bonus Theta" },
				{ id: "tau1", label: "Bonus Tau" },
			]);

			expect(map.size).toBe(0);
		});
	});

	describe("validateModuleSelections", () => {
		it("does not change anything if no modules were removed", () => {
			const prev = ["core1", "theta1"];
			const proposed = ["core1", "theta1", "tau1"];
			expect(validateModuleSelections(prev, proposed, mockModules)).toEqual(proposed);
		});

		it("cascades deselection from Theta to Tau and Sigma in the same Module Group", () => {
			const prev = ["core1", "theta1", "tau1", "sigma1"];
			const proposed = ["core1", "tau1", "sigma1"];
			expect(validateModuleSelections(prev, proposed, mockModules)).toEqual(["core1"]);
		});

		it("cascades deselection from Tau to Sigma in the same Module Group", () => {
			const prev = ["core1", "theta1", "tau1", "sigma1"];
			const proposed = ["core1", "theta1", "sigma1"];
			expect(validateModuleSelections(prev, proposed, mockModules)).toEqual([
				"core1",
				"theta1",
			]);
		});

		it("does not cascade when Sigma is deselected", () => {
			const prev = ["core1", "theta1", "tau1", "sigma1"];
			const proposed = ["core1", "theta1", "tau1"];
			expect(validateModuleSelections(prev, proposed, mockModules)).toEqual([
				"core1",
				"theta1",
				"tau1",
			]);
		});

		it("does not cascade if a module in a non-validation Module Group is deselected", () => {
			const prev = ["core1", "theta1", "tau1", "sigma1"];
			const proposed = ["theta1", "tau1", "sigma1"];
			expect(validateModuleSelections(prev, proposed, mockModules)).toEqual([
				"theta1",
				"tau1",
				"sigma1",
			]);
		});

		it("handles separate validation Module Groups independently", () => {
			const prev = ["theta1", "tau1", "sigma1", "theta2", "tau2", "sigma2"];
			const proposed = ["tau1", "sigma1", "theta2", "tau2", "sigma2"];
			expect(validateModuleSelections(prev, proposed, mockModules)).toEqual([
				"theta2",
				"tau2",
				"sigma2",
			]);
		});
	});

	describe("areAllModulesSelected & getSelectAllModuleIds", () => {
		const sampleModules = [
			{ id: "core1", type: "core" },
			{ id: "u1", type: "upgrade" },
			{ id: "b1", type: "bonus" },
		];

		it("evaluates whether all non-core modules are selected", () => {
			expect(areAllModulesSelected(sampleModules, ["core1", "u1"])).toBe(false);
			expect(areAllModulesSelected(sampleModules, ["u1", "b1"])).toBe(true);
			expect(areAllModulesSelected(sampleModules, ["core1", "u1", "b1"])).toBe(true);
		});

		it("computes checked module IDs when toggling Select All on and off", () => {
			expect(getSelectAllModuleIds(sampleModules, true)).toEqual(["u1", "b1", "core1"]);
			expect(getSelectAllModuleIds(sampleModules, false)).toEqual(["core1"]);
		});
	});

	describe("resolveActiveTechVariant & getTechnologyTranslationKey", () => {
		it("resolves the matching Technology Variant or falls back to the first variant", () => {
			const variants = [
				{ key: "pulse", type: "normal" },
				{ key: "pulse", type: "max" },
			];

			expect(resolveActiveTechVariant(variants, "max")).toEqual({
				key: "pulse",
				type: "max",
			});
			expect(resolveActiveTechVariant(variants, "missing")).toEqual({
				key: "pulse",
				type: "normal",
			});
			expect(resolveActiveTechVariant([], "normal")).toBeUndefined();
		});

		it("derives dot-separated translation keys from icon paths", () => {
			expect(getTechnologyTranslationKey("pulse", "starship/pulse.webp")).toBe(
				"starship.pulse",
			);
			expect(getTechnologyTranslationKey("pulse", null)).toBe("pulse");
		});
	});
});
