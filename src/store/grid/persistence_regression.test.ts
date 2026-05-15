import { describe, expect, it, vi } from "vitest";

import { PLATFORM_STORAGE_KEY } from "../../utils/browser/platformResolver";

/**
 * Regression test for GridStore persistence race condition.
 *
 * @remarks
 * This test suite verifies that `platformStore` correctly initializes its `selectedPlatform`
 * state synchronously from environment sources (URL or localStorage) during store creation.
 *
 * Failure to initialize synchronously causes `gridStore` to capture a default "standard"
 * platform during its hydration phase, leading to storage corruption and subsequent grid wipes
 * on reloads when a platform mismatch is detected.
 *
 * @see {@link ../../store/app/platformStore.ts platformStore}
 * @see {@link ../../store/grid/gridStore.ts gridStore}
 */
describe("GridStore Persistence Regression (Reproduction)", () => {
	/**
	 * Verifies that platformStore reads from localStorage immediately on load.
	 */
	it("should initialize from localStorage immediately", async () => {
		vi.resetModules();
		// Setup localStorage
		localStorage.setItem(PLATFORM_STORAGE_KEY, "freighter");

		// Access store via dynamic import to ensure fresh initialization
		const { usePlatformStore } = await import("../app/platformStore");
		const platform = usePlatformStore.getState().selectedPlatform;

		expect(platform).toBe("freighter");
	});

	/**
	 * Verifies that platformStore reads from URL search parameters immediately on load.
	 */
	it("should initialize from URL immediately", async () => {
		vi.resetModules();
		// Setup URL
		const url = new URL("http://localhost/?platform=solar");
		vi.stubGlobal("location", {
			href: url.toString(),
			search: "?platform=solar",
		});

		// Access store via dynamic import
		const { usePlatformStore } = await import("../app/platformStore");
		const platform = usePlatformStore.getState().selectedPlatform;

		expect(platform).toBe("solar");
	});
});
