import { describe, it, expect, vi, beforeEach } from "vitest";
import { preloadInitialState } from "./apiPreload";
import { fetchShipTypes } from "../hooks/useShipTypes/useShipTypes";
import { fetchTechTreeAsync } from "../hooks/useTechTree/useTechTree";
import { resolveInitialPlatform } from "./platformResolver";

vi.mock("../hooks/useShipTypes/useShipTypes", () => ({
	fetchShipTypes: vi.fn(),
}));

vi.mock("../hooks/useTechTree/useTechTree", () => ({
	fetchTechTreeAsync: vi.fn(),
}));

vi.mock("./platformResolver", () => ({
	resolveInitialPlatform: vi.fn(),
}));

describe("apiPreload", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should call preloading functions", () => {
		const mockPlatform = "test-platform";
		(resolveInitialPlatform as any).mockReturnValue(mockPlatform);

		preloadInitialState();

		expect(fetchShipTypes).toHaveBeenCalledTimes(1);
		expect(resolveInitialPlatform).toHaveBeenCalledTimes(1);
		expect(fetchTechTreeAsync).toHaveBeenCalledWith(mockPlatform);
	});

	it("should do nothing if window is undefined", () => {
		const originalWindow = global.window;
		// @ts-ignore
		delete global.window;

		preloadInitialState();

		expect(fetchShipTypes).not.toHaveBeenCalled();
		
		// Restore window
		global.window = originalWindow;
	});
});
