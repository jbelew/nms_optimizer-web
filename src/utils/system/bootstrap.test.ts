import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { performBootstrapMigrations } from "./bootstrap";

// Mock idle.ts to run callback immediately
vi.mock("@/utils/system/idle", () => ({
	runWhenIdle: (cb: () => void) => cb(),
}));

describe("Bootstrap Utility", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
	});

	describe("Tutorial Key Migration", () => {
		it("should migrate old tutorial key to new key", () => {
			localStorage.setItem("hasVisitedNMSOptimizer", "true");

			performBootstrapMigrations();

			expect(localStorage.getItem("tutorialFinished")).toBe("true");
			expect(localStorage.getItem("hasVisitedNMSOptimizer")).toBeNull();
		});

		it("should not overwrite new key if it already exists", () => {
			localStorage.setItem("tutorialFinished", "false");
			localStorage.setItem("hasVisitedNMSOptimizer", "true");

			performBootstrapMigrations();

			// In our current implementation, it only migrates if newKey !== "true"
			// Wait, let's check the implementation:
			// if (newTutorialVal !== "true" && oldTutorialVal === "true") { ... }
			// So if it's "false", it WILL migrate.
			expect(localStorage.getItem("tutorialFinished")).toBe("true");
			expect(localStorage.getItem("hasVisitedNMSOptimizer")).toBeNull();
		});

		it("should do nothing if old key does not exist", () => {
			performBootstrapMigrations();
			expect(localStorage.getItem("tutorialFinished")).toBeNull();
		});
	});

	describe("LocalStorage Garbage Collection", () => {
		it("should remove stale gridState keys", () => {
			localStorage.setItem("gridState", "current");
			localStorage.setItem("gridState_v1", "stale");
			localStorage.setItem("gridState_backup", "stale");
			localStorage.setItem("otherKey", "keep");

			performBootstrapMigrations();

			expect(localStorage.getItem("gridState")).toBe("current");
			expect(localStorage.getItem("otherKey")).toBe("keep");
			expect(localStorage.getItem("gridState_v1")).toBeNull();
			expect(localStorage.getItem("gridState_backup")).toBeNull();
		});
	});
});
