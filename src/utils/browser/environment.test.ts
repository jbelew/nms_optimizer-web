import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	isBot,
	isTouchDevice,
	safeClear,
	safeGetItem,
	safeRemoveItem,
	safeSetItem,
} from "./environment";

describe("environment utilities", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	describe("isBot", () => {
		it("should return true if navigator.webdriver is true", () => {
			vi.stubGlobal("navigator", { webdriver: true });
			expect(isBot()).toBe(true);
		});

		it("should return true if documentElement has is-bot class", () => {
			vi.stubGlobal("document", {
				documentElement: {
					classList: {
						contains: (className: string) => className === "is-bot",
					},
				},
			});
			expect(isBot()).toBe(true);
		});

		it("should return true if userAgent matches bot pattern", () => {
			vi.stubGlobal("navigator", { userAgent: "Googlebot/2.1" });
			expect(isBot()).toBe(true);
		});

		it("should return false if no bot indicators are present", () => {
			vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0", webdriver: false });
			vi.stubGlobal("document", {
				documentElement: {
					classList: {
						contains: () => false,
					},
				},
			});
			expect(isBot()).toBe(false);
		});
	});

	describe("isTouchDevice", () => {
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

	describe("storage utility", () => {
		const mockLocalStorage = {
			clear: vi.fn(),
			getItem: vi.fn(),
			removeItem: vi.fn(),
			setItem: vi.fn(),
		};

		beforeEach(() => {
			vi.stubGlobal("localStorage", mockLocalStorage);
			vi.stubGlobal("window", { localStorage: mockLocalStorage });
			vi.clearAllMocks();
		});

		describe("safeGetItem", () => {
			it("should return the item from localStorage", () => {
				mockLocalStorage.getItem.mockReturnValue("test-value");
				expect(safeGetItem("test-key")).toBe("test-value");
				expect(mockLocalStorage.getItem).toHaveBeenCalledWith("test-key");
			});

			it("should return null and warn if localStorage throws", () => {
				const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
				mockLocalStorage.getItem.mockImplementation(() => {
					throw new Error("SecurityError");
				});
				expect(safeGetItem("test-key")).toBeNull();
				expect(consoleSpy).toHaveBeenCalled();
			});

			it("should return null if window is undefined", () => {
				vi.stubGlobal("window", undefined);
				expect(safeGetItem("test-key")).toBeNull();
			});
		});

		describe("safeSetItem", () => {
			it("should set the item in localStorage and return true", () => {
				expect(safeSetItem("test-key", "test-value")).toBe(true);
				expect(mockLocalStorage.setItem).toHaveBeenCalledWith("test-key", "test-value");
			});

			it("should return false and warn if localStorage throws", () => {
				const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
				mockLocalStorage.setItem.mockImplementation(() => {
					throw new Error("QuotaExceededError");
				});
				expect(safeSetItem("test-key", "test-value")).toBe(false);
				expect(consoleSpy).toHaveBeenCalled();
			});

			it("should return false if window is undefined", () => {
				vi.stubGlobal("window", undefined);
				expect(safeSetItem("test-key", "test-value")).toBe(false);
			});
		});

		describe("safeRemoveItem", () => {
			it("should remove the item from localStorage and return true", () => {
				expect(safeRemoveItem("test-key")).toBe(true);
				expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("test-key");
			});

			it("should return false and warn if localStorage throws", () => {
				const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
				mockLocalStorage.removeItem.mockImplementation(() => {
					throw new Error("SecurityError");
				});
				expect(safeRemoveItem("test-key")).toBe(false);
				expect(consoleSpy).toHaveBeenCalled();
			});

			it("should return false if window is undefined", () => {
				vi.stubGlobal("window", undefined);
				expect(safeRemoveItem("test-key")).toBe(false);
			});
		});

		describe("safeClear", () => {
			it("should clear localStorage and return true", () => {
				expect(safeClear()).toBe(true);
				expect(mockLocalStorage.clear).toHaveBeenCalled();
			});

			it("should return false and warn if localStorage throws", () => {
				const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
				mockLocalStorage.clear.mockImplementation(() => {
					throw new Error("SecurityError");
				});
				expect(safeClear()).toBe(false);
				expect(consoleSpy).toHaveBeenCalled();
			});

			it("should return false if window is undefined", () => {
				vi.stubGlobal("window", undefined);
				expect(safeClear()).toBe(false);
			});
		});
	});
});
