import { afterEach, describe, expect, it, vi } from "vitest";

import { isTouchDevice } from "./isTouchDevice";

describe("isTouchDevice", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("should return true if ontouchstart is in window", () => {
		vi.stubGlobal("window", { ontouchstart: () => {} });
		expect(isTouchDevice()).toBe(true);
	});

	it("should return true if maxTouchPoints > 0", () => {
		vi.stubGlobal("navigator", { maxTouchPoints: 5 });
		expect(isTouchDevice()).toBe(true);
	});

	it("should return false if neither condition is met", () => {
		vi.stubGlobal("window", {});
		vi.stubGlobal("navigator", { maxTouchPoints: 0 });
		expect(isTouchDevice()).toBe(false);
	});
});
