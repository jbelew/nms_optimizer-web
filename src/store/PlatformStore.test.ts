import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePlatformStore } from "./PlatformStore";

describe("PlatformStore", () => {
	const validShipTypes = ["standard", "explorer", "fighter", "hauler"];

	beforeEach(() => {
		// Reset store state
		usePlatformStore.setState({ selectedPlatform: "standard" });
		// Clear localStorage
		localStorage.clear();
		// Clear URL params
		window.history.replaceState({}, "", window.location.pathname);
		// Clear console warnings
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
		window.history.replaceState({}, "", window.location.pathname);
	});

	describe("Initial state", () => {
		it("should have selectedPlatform set to 'standard' by default", () => {
			const store = usePlatformStore.getState();
			expect(store.selectedPlatform).toBe("standard");
		});

		it("should have setSelectedPlatform function", () => {
			const store = usePlatformStore.getState();
			expect(typeof store.setSelectedPlatform).toBe("function");
		});

		it("should have initializePlatform function", () => {
			const store = usePlatformStore.getState();
			expect(typeof store.initializePlatform).toBe("function");
		});
	});

	describe("setSelectedPlatform", () => {
		it("should set a valid platform", () => {
			const { setSelectedPlatform } = usePlatformStore.getState();
			setSelectedPlatform("explorer", validShipTypes, false);

			expect(usePlatformStore.getState().selectedPlatform).toBe("explorer");
		});

		it("should save platform to localStorage", () => {
			const { setSelectedPlatform } = usePlatformStore.getState();
			setSelectedPlatform("fighter", validShipTypes, false);

			expect(localStorage.getItem("selectedPlatform")).toBe("fighter");
		});

		it("should reject invalid platform and fallback to standard", () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("invalid", validShipTypes, false);

			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
			expect(localStorage.getItem("selectedPlatform")).toBe("standard");
			expect(warnSpy).toHaveBeenCalled();

			warnSpy.mockRestore();
		});

		it("should update URL when updateUrl is true and isKnownRoute is true", () => {
			const pushStateSpy = vi.spyOn(window.history, "pushState");
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("hauler", validShipTypes, true, true);

			expect(pushStateSpy).toHaveBeenCalled();
			const url = new URL(window.location.href);
			expect(url.searchParams.get("platform")).toBe("hauler");

			pushStateSpy.mockRestore();
		});

		it("should not update URL when updateUrl is false", () => {
			const pushStateSpy = vi.spyOn(window.history, "pushState");
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("explorer", validShipTypes, false, true);

			expect(pushStateSpy).not.toHaveBeenCalled();

			pushStateSpy.mockRestore();
		});

		it("should not update URL when isKnownRoute is false", () => {
			const pushStateSpy = vi.spyOn(window.history, "pushState");
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("fighter", validShipTypes, true, false);

			expect(pushStateSpy).not.toHaveBeenCalled();

			pushStateSpy.mockRestore();
		});

		it("should use default values for optional parameters", () => {
			const pushStateSpy = vi.spyOn(window.history, "pushState");
			const { setSelectedPlatform } = usePlatformStore.getState();

			// Call with only required parameters
			setSelectedPlatform("explorer", validShipTypes);

			// Should update URL with defaults (updateUrl=true, isKnownRoute=true)
			expect(pushStateSpy).toHaveBeenCalled();

			pushStateSpy.mockRestore();
		});
	});

	describe("initializePlatform", () => {
		it("should set platform from URL when it is valid", () => {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", "fighter");
			window.history.replaceState({}, "", url.toString());

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform(validShipTypes);

			expect(usePlatformStore.getState().selectedPlatform).toBe("fighter");
		});

		it("should set platform from localStorage when URL doesn't have it", () => {
			localStorage.setItem("selectedPlatform", "hauler");

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform(validShipTypes);

			expect(usePlatformStore.getState().selectedPlatform).toBe("hauler");
		});

		it("should default to 'standard' when no platform source is valid", () => {
			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform(validShipTypes);

			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
		});

		it("should reject invalid platform from URL and use localStorage", () => {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", "invalid");
			window.history.replaceState({}, "", url.toString());
			localStorage.setItem("selectedPlatform", "explorer");

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform(validShipTypes);

			expect(usePlatformStore.getState().selectedPlatform).toBe("explorer");
		});

		it("should update localStorage when setting from URL", () => {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", "fighter");
			window.history.replaceState({}, "", url.toString());

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform(validShipTypes);

			expect(localStorage.getItem("selectedPlatform")).toBe("fighter");
		});

		it("should update URL when platform comes from localStorage", () => {
			const replaceStateSpy = vi.spyOn(window.history, "replaceState");
			localStorage.setItem("selectedPlatform", "explorer");

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform(validShipTypes);

			expect(replaceStateSpy).toHaveBeenCalled();

			replaceStateSpy.mockRestore();
		});

		it("should not update URL when isKnownRoute is false", () => {
			const replaceStateSpy = vi.spyOn(window.history, "replaceState");
			localStorage.setItem("selectedPlatform", "fighter");

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform(validShipTypes, false);

			expect(replaceStateSpy).not.toHaveBeenCalled();

			replaceStateSpy.mockRestore();
		});

		it("should save to localStorage when defaulting to standard", () => {
			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform(validShipTypes);

			expect(localStorage.getItem("selectedPlatform")).toBe("standard");
		});

		it("should prefer URL platform over localStorage", () => {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", "fighter");
			window.history.replaceState({}, "", url.toString());
			localStorage.setItem("selectedPlatform", "explorer");

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform(validShipTypes);

			expect(usePlatformStore.getState().selectedPlatform).toBe("fighter");
		});

		it("should handle empty validShipTypes array", () => {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", "fighter");
			window.history.replaceState({}, "", url.toString());

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform([]);

			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
		});
	});

	describe("Integration", () => {
		it("should handle complete workflow: initialize then update", () => {
			const { initializePlatform, setSelectedPlatform } = usePlatformStore.getState();

			initializePlatform(validShipTypes);
			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");

			setSelectedPlatform("explorer", validShipTypes, false);
			expect(usePlatformStore.getState().selectedPlatform).toBe("explorer");
		});

		it("should maintain state consistency across operations", () => {
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("fighter", validShipTypes, false);
			expect(usePlatformStore.getState().selectedPlatform).toBe("fighter");

			setSelectedPlatform("hauler", validShipTypes, false);
			expect(usePlatformStore.getState().selectedPlatform).toBe("hauler");

			expect(localStorage.getItem("selectedPlatform")).toBe("hauler");
		});
	});

	describe("Edge cases", () => {
		it("should handle platform names with different cases", () => {
			const { setSelectedPlatform } = usePlatformStore.getState();

			// Lowercase should work
			setSelectedPlatform("explorer", validShipTypes, false);
			expect(usePlatformStore.getState().selectedPlatform).toBe("explorer");

			// Invalid case should fallback
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			setSelectedPlatform("EXPLORER", validShipTypes, false);
			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
			warnSpy.mockRestore();
		});

		it("should handle special characters in platform name", () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("special-platform!", validShipTypes, false);
			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");

			warnSpy.mockRestore();
		});

		it("should handle empty string platform", () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("", validShipTypes, false);
			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");

			warnSpy.mockRestore();
		});
	});
});
