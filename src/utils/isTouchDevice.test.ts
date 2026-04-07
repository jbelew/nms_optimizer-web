import { describe, it, expect, vi, afterEach } from "vitest";
import { isTouchDevice } from "./isTouchDevice";

describe("isTouchDevice", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		// @ts-ignore
		if ("ontouchstart" in window) {
			// @ts-ignore
			delete window.ontouchstart;
		}
		Object.defineProperty(navigator, "maxTouchPoints", {
			configurable: true,
			value: 0,
		});
	});

	it("should return true if ontouchstart is in window", () => {
		// @ts-ignore
		window.ontouchstart = () => {};
		expect(isTouchDevice()).toBe(true);
	});

	it("should return true if maxTouchPoints > 0", () => {
		Object.defineProperty(navigator, "maxTouchPoints", {
			configurable: true,
			value: 5,
		});
		expect(isTouchDevice()).toBe(true);
	});

	it("should return false if neither condition is met", () => {
		// @ts-ignore
		if ("ontouchstart" in window) {
			// @ts-ignore
			delete window.ontouchstart;
		}
		Object.defineProperty(navigator, "maxTouchPoints", {
			configurable: true,
			value: 0,
		});
		expect(isTouchDevice()).toBe(false);
	});
});
