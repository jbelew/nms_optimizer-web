import { describe, expect, it } from "vitest";

import { MODULE_RANK_ORDER, validateModuleSelections, VALIDATION_GROUPS } from "./techRules";

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

describe("techRules - validateModuleSelections", () => {
	it("should not change anything if no modules were removed", () => {
		const prev = ["core1", "theta1"];
		const proposed = ["core1", "theta1", "tau1"]; // Added tau1
		const result = validateModuleSelections(prev, proposed, mockModules);
		expect(result).toEqual(proposed);
	});

	it("should cascade deselection from Theta to Tau and Sigma in the same group", () => {
		const prev = ["core1", "theta1", "tau1", "sigma1"];
		const proposed = ["core1", "tau1", "sigma1"]; // Theta removed
		const result = validateModuleSelections(prev, proposed, mockModules);
		expect(result).toEqual(["core1"]);
	});

	it("should cascade deselection from Tau to Sigma in the same group", () => {
		const prev = ["core1", "theta1", "tau1", "sigma1"];
		const proposed = ["core1", "theta1", "sigma1"]; // Tau removed
		// Note: since Theta is still present, removing Tau removes Sigma.
		const result = validateModuleSelections(prev, proposed, mockModules);
		expect(result).toEqual(["core1", "theta1"]);
	});

	it("should not cascade when Sigma is deselected", () => {
		const prev = ["core1", "theta1", "tau1", "sigma1"];
		const proposed = ["core1", "theta1", "tau1"]; // Sigma removed
		const result = validateModuleSelections(prev, proposed, mockModules);
		expect(result).toEqual(["core1", "theta1", "tau1"]);
	});

	it("should not cascade if a module in a non-validation group is deselected", () => {
		const prev = ["core1", "theta1", "tau1", "sigma1"];
		const proposed = ["theta1", "tau1", "sigma1"]; // core1 removed
		const result = validateModuleSelections(prev, proposed, mockModules);
		expect(result).toEqual(["theta1", "tau1", "sigma1"]);
	});

	it("should handle separate validation groups independently", () => {
		const prev = ["theta1", "tau1", "sigma1", "theta2", "tau2", "sigma2"];
		const proposed = ["tau1", "sigma1", "theta2", "tau2", "sigma2"]; // theta1 removed
		const result = validateModuleSelections(prev, proposed, mockModules);
		// theta1 removed should clear tau1, sigma1.
		// theta2, tau2, sigma2 should remain intact.
		expect(result).toEqual(["theta2", "tau2", "sigma2"]);
	});

	it("should export correct constants", () => {
		expect(MODULE_RANK_ORDER).toEqual(["Theta", "Tau", "Sigma"]);
		expect(VALIDATION_GROUPS).toEqual(["atlantid", "cosmetic", "reactor", "upgrade"]);
	});
});
