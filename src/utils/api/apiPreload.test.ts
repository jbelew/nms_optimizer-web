import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchShipTypes } from "@/hooks/useShipTypes/useShipTypes";
import { fetchTechTreeAsync } from "@/hooks/useTechTree/useTechTree";
import { resolveInitialPlatform } from "@/utils/browser/platformResolver";

import { preloadInitialState } from "./apiPreload";

vi.mock("@/hooks/useShipTypes/useShipTypes", () => ({
	fetchShipTypes: vi.fn(),
}));

vi.mock("@/hooks/useTechTree/useTechTree", () => ({
	fetchTechTreeAsync: vi.fn(),
}));

vi.mock("@/utils/browser/platformResolver", () => ({
	resolveInitialPlatform: vi.fn(),
}));

describe("apiPreload", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("should call preloading functions", () => {
		const mockPlatform = "test-platform";
		vi.mocked(resolveInitialPlatform).mockReturnValue(mockPlatform);

		preloadInitialState();

		expect(fetchShipTypes).toHaveBeenCalledTimes(1);
		expect(resolveInitialPlatform).toHaveBeenCalledTimes(1);
		expect(fetchTechTreeAsync).toHaveBeenCalledWith(mockPlatform);
	});

	it("should do nothing if window is undefined", () => {
		vi.stubGlobal("window", undefined);

		preloadInitialState();

		expect(fetchShipTypes).not.toHaveBeenCalled();
	});
});
