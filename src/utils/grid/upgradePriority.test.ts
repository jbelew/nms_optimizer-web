import { describe, expect, it } from "vitest";

import { getUpgradePriority } from "./upgradePriority";

describe("getUpgradePriority", () => {
	it("should return empty string for undefined or null label", () => {
		expect(getUpgradePriority(undefined)).toBe("");
		expect(getUpgradePriority("")).toBe("");
	});

	it("should return empty string for labels without tiers", () => {
		expect(getUpgradePriority("Pulse Drive")).toBe("");
		expect(getUpgradePriority("Hazard Protection")).toBe("");
	});

	it("should identify Salvaged tiers", () => {
		expect(getUpgradePriority("Salvaged Theta Module")).toBe("S1");
		expect(getUpgradePriority("Salvaged Tau Module")).toBe("S2");
		expect(getUpgradePriority("Salvaged Sigma Module")).toBe("S3");
	});

	it("should identify Forbidden tiers", () => {
		expect(getUpgradePriority("Forbidden Theta Module")).toBe("F1");
		expect(getUpgradePriority("Forbidden Tau Module")).toBe("F2");
		expect(getUpgradePriority("Forbidden Sigma Module")).toBe("F3");
	});

	it("should identify Reactor tiers", () => {
		expect(getUpgradePriority("Reactor Theta Module")).toBe("R1");
		expect(getUpgradePriority("Reactor Tau Module")).toBe("R2");
		expect(getUpgradePriority("Reactor Sigma Module")).toBe("R3");
	});

	it("should identify Booster/Component tiers", () => {
		expect(getUpgradePriority("Theta Booster")).toBe("C1");
		expect(getUpgradePriority("Tau Array")).toBe("C2");
		expect(getUpgradePriority("Sigma Ion Barrier")).toBe("C3");
	});

	it("should identify simple Upgrade tiers", () => {
		expect(getUpgradePriority("Theta Upgrade")).toBe("1");
		expect(getUpgradePriority("Tau Upgrade")).toBe("2");
		expect(getUpgradePriority("Sigma Upgrade")).toBe("3");
	});

	it("should be case-insensitive", () => {
		expect(getUpgradePriority("salvaged theta")).toBe("S1");
		expect(getUpgradePriority("SALVAGED THETA")).toBe("S1");
	});

	it("should prioritize correctly when multiple keywords match", () => {
		// Salvaged check comes before Forbidden and Reactor in the current implementation
		expect(getUpgradePriority("Salvaged Forbidden Reactor Theta")).toBe("S1");
		expect(getUpgradePriority("Forbidden Reactor Tau")).toBe("F2");
	});

	it("should return empty string if tier is found but no type prefix matches", () => {
		expect(getUpgradePriority("Regular Theta Module")).toBe("");
	});
});
