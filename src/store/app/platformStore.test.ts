import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiCall } from "@/utils/api/network";

import {
	fetchPlatforms,
	getPlatformFromStorage,
	getPlatformFromUrl,
	resetPlatformsCache,
	resolveInitialPlatform,
	usePlatformStore,
} from "./platformStore";

vi.mock("@/utils/api/network", () => ({
	apiCall: vi.fn(),
}));

describe("PlatformStore", () => {
	const mockCatalog = {
		explorer: { label: "Explorer", type: "Starship" },
		fighter: { label: "Fighter", type: "Starship" },
		hauler: { label: "Hauler", type: "Starship" },
		standard: { label: "Standard", type: "Starship" },
	};

	beforeEach(() => {
		resetPlatformsCache();
		usePlatformStore.setState({
			platforms: mockCatalog,
			selectedPlatform: "standard",
		});
		localStorage.clear();
		window.history.replaceState({}, "", window.location.pathname);
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
		window.history.replaceState({}, "", window.location.pathname);
	});

	describe("Initial state & resolution helpers", () => {
		it("should have selectedPlatform set to 'standard' by default", () => {
			const store = usePlatformStore.getState();
			expect(store.selectedPlatform).toBe("standard");
		});

		it("should resolve platform from URL, localStorage, or fallback to standard", () => {
			expect(getPlatformFromUrl()).toBeNull();
			expect(getPlatformFromStorage()).toBeNull();
			expect(resolveInitialPlatform()).toBe("standard");

			localStorage.setItem("selectedPlatform", "hauler");
			expect(getPlatformFromStorage()).toBe("hauler");
			expect(resolveInitialPlatform()).toBe("hauler");

			window.history.replaceState({}, "", "/?platform=fighter");
			expect(getPlatformFromUrl()).toBe("fighter");
			expect(resolveInitialPlatform()).toBe("fighter");
		});
	});

	describe("setSelectedPlatform", () => {
		it("should set a valid platform using internal catalog validation", () => {
			const { setSelectedPlatform } = usePlatformStore.getState();
			setSelectedPlatform("explorer");

			expect(usePlatformStore.getState().selectedPlatform).toBe("explorer");
		});

		it("should save platform to localStorage", () => {
			const { setSelectedPlatform } = usePlatformStore.getState();
			setSelectedPlatform("fighter");

			expect(localStorage.getItem("selectedPlatform")).toBe("fighter");
		});

		it("should reject invalid platform and fallback to standard", () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("invalid");

			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
			expect(localStorage.getItem("selectedPlatform")).toBe("standard");
			expect(warnSpy).toHaveBeenCalled();

			warnSpy.mockRestore();
		});
	});

	describe("initializePlatform", () => {
		it("should set platform from URL when it is valid", () => {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", "fighter");
			window.history.replaceState({}, "", url.toString());

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform();

			expect(usePlatformStore.getState().selectedPlatform).toBe("fighter");
		});

		it("should set platform from localStorage when URL doesn't have it", () => {
			localStorage.setItem("selectedPlatform", "hauler");

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform();

			expect(usePlatformStore.getState().selectedPlatform).toBe("hauler");
		});

		it("should default to 'standard' when no platform source is valid", () => {
			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform();

			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
		});

		it("should reject invalid platform from URL and use localStorage", () => {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", "invalid");
			window.history.replaceState({}, "", url.toString());
			localStorage.setItem("selectedPlatform", "explorer");

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform();

			expect(usePlatformStore.getState().selectedPlatform).toBe("explorer");
		});

		it("should update localStorage when setting from URL", () => {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", "fighter");
			window.history.replaceState({}, "", url.toString());

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform();

			expect(localStorage.getItem("selectedPlatform")).toBe("fighter");
		});

		it("should handle empty catalog when initializing", () => {
			usePlatformStore.setState({ platforms: {} });
			const url = new URL(window.location.href);
			url.searchParams.set("platform", "fighter");
			window.history.replaceState({}, "", url.toString());

			const { initializePlatform } = usePlatformStore.getState();
			initializePlatform();

			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
		});
	});

	describe("fetchPlatforms", () => {
		it("should populate platforms catalog and preserve valid URL platform", async () => {
			window.history.replaceState({}, "", "/?platform=hauler");
			usePlatformStore.setState({ platforms: null, selectedPlatform: "hauler" });

			const remoteCatalog = {
				atlantid: { label: "Atlantid", type: "Starship" },
				hauler: { label: "Hauler", type: "Starship" },
				sentinel: { label: "Sentinel", type: "Starship" },
			};
			vi.mocked(apiCall).mockResolvedValue(remoteCatalog);

			await act(async () => {
				await fetchPlatforms();
			});

			expect(usePlatformStore.getState().platforms).toEqual(remoteCatalog);
			expect(usePlatformStore.getState().selectedPlatform).toBe("hauler");
		});

		it("should default to 'standard' and not be overwritten by first catalog entry when URL/storage are empty", async () => {
			usePlatformStore.setState({ platforms: null, selectedPlatform: "standard" });

			const remoteCatalog = {
				atlantid: { label: "Atlantid", type: "Starship" },
				standard: { label: "Standard", type: "Starship" },
			};
			vi.mocked(apiCall).mockResolvedValue(remoteCatalog);

			await act(async () => {
				await fetchPlatforms();
			});

			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
		});

		it("should reset selectedPlatform to 'standard' when URL parameter is not in fetched catalog", async () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			window.history.replaceState({}, "", "/?platform=invalid-ship");
			usePlatformStore.setState({ platforms: null, selectedPlatform: "invalid-ship" });

			const remoteCatalog = {
				atlantid: { label: "Atlantid", type: "Starship" },
				standard: { label: "Standard", type: "Starship" },
			};
			vi.mocked(apiCall).mockResolvedValue(remoteCatalog);

			await act(async () => {
				await fetchPlatforms();
			});

			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
			warnSpy.mockRestore();
		});
	});

	describe("Edge cases", () => {
		it("should handle platform names with different cases", () => {
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("explorer");
			expect(usePlatformStore.getState().selectedPlatform).toBe("explorer");

			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			setSelectedPlatform("EXPLORER");
			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
			warnSpy.mockRestore();
		});

		it("should handle special characters in platform name", () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("special-platform!");
			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");

			warnSpy.mockRestore();
		});

		it("should handle empty string platform", () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const { setSelectedPlatform } = usePlatformStore.getState();

			setSelectedPlatform("");
			expect(usePlatformStore.getState().selectedPlatform).toBe("standard");

			warnSpy.mockRestore();
		});
	});
});
