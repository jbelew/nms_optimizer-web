import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the API_URL constant
vi.mock("../../constants", () => ({
	API_URL: "http://mock-api.com/",
}));

// Mock apiCall
vi.mock("../../utils/apiCall", () => ({
	apiCall: vi.fn(),
}));

// Mock window.history.pushState and replaceState for the test environment
const mockPushState = vi.fn();
const mockReplaceState = vi.fn();
Object.defineProperty(window, "history", {
	value: {
		pushState: mockPushState,
		replaceState: mockReplaceState,
	},
	writable: true,
});

// Mock localStorage for the test environment
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		clear: () => {
			store = {};
		},
		removeItem: (key: string) => {
			delete store[key];
		},
	};
})();
Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

describe("useShipTypes Store and Fetch Logic", () => {
	beforeEach(() => {
		// Reset mocks and localStorage before each test
		vi.clearAllMocks();
		localStorageMock.clear();

		// Reset the URL to a clean state
		Object.defineProperty(window, "location", {
			value: new URL(process.env.VITE_API_URL as string),
			writable: true,
		});

		// This is crucial: it clears the module cache, including the `cache` Map
		// inside useShipTypes.tsx and allows the Zustand store to be re-initialized.
		vi.resetModules();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should respect the URL parameter for selectedShipType even after fetching all types", async () => {
		// ARRANGE
		// 1. Set the URL to include a platform before we import the module
		window.location.search = "?platform=hauler";

		// 2. Mock the API response. 'atlantid' is first, but 'hauler' is in the URL.
		const mockShipTypes = {
			atlantid: { label: "Atlantid", type: "Starship" },
			hauler: { label: "Hauler", type: "Starship" },
			sentinel: { label: "Sentinel", type: "Starship" },
		};
		const { apiCall } = await import("../../utils/apiCall");
		vi.mocked(apiCall).mockResolvedValue(mockShipTypes);

		// 3. Dynamically import to re-initialize the store with the new URL
		const { fetchShipTypes } = await import("./useShipTypes");
		const { usePlatformStore } = await import("../../store/PlatformStore");

		// ACT: Trigger the fetch and wait for the internal promise chain to complete
		await act(async () => {
			fetchShipTypes();
			await new Promise((resolve) => setTimeout(resolve, 50)); // Wait for async operations
		});

		// ASSERT: The selected ship type should NOT be overwritten by the first
		// item in the API response ('atlantid'). It should remain 'hauler'.
		expect(usePlatformStore.getState().selectedPlatform).toBe("hauler");
	});

	it('should default to "standard" and not be overwritten by fetch if URL/localStorage are empty', async () => {
		// ARRANGE
		const mockShipTypes = {
			atlantid: { label: "Atlantid", type: "Starship" },
			standard: { label: "Standard", type: "Starship" },
		};
		const { apiCall } = await import("../../utils/apiCall");
		vi.mocked(apiCall).mockResolvedValue(mockShipTypes);

		// ACT
		const { fetchShipTypes } = await import("./useShipTypes");
		const { usePlatformStore } = await import("../../store/PlatformStore");

		await act(async () => {
			fetchShipTypes();
			await new Promise((resolve) => setTimeout(resolve, 50));
		});

		// ASSERT
		expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
	});

	it('should reset to "standard" if the value from the URL is invalid', async () => {
		// ARRANGE
		window.location.search = "?platform=invalid-ship";
		const mockShipTypes = {
			atlantid: { label: "Atlantid", type: "Starship" },
			standard: { label: "Standard", type: "Starship" },
		};
		const { apiCall } = await import("../../utils/apiCall");
		vi.mocked(apiCall).mockResolvedValue(mockShipTypes);

		// ACT
		const { fetchShipTypes } = await import("./useShipTypes");
		const { usePlatformStore } = await import("../../store/PlatformStore");

		await act(async () => {
			fetchShipTypes();
			await new Promise((resolve) => setTimeout(resolve, 50));
		});

		// ASSERT: After validation, it should be reset to the default.
		expect(usePlatformStore.getState().selectedPlatform).toBe("standard");
	});
});
