import { renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { sendEvent } from "../utils/analytics";
import { useAnalytics } from "./useAnalytics";

// Mock the actual sendEvent function from utils/analytics
vi.mock("../utils/analytics", () => ({
	sendEvent: vi.fn(),
}));

describe("useAnalytics", () => {
	beforeEach(() => {
		// Clear mock calls before each test
		vi.clearAllMocks();
	});

	it("should return the sendEvent function", () => {
		const { result } = renderHook(() => useAnalytics());

		expect(result.current.sendEvent).toBeDefined();
		expect(typeof result.current.sendEvent).toBe("function");
	});

	it("should call the mocked sendEvent when useAnalytics().sendEvent is invoked", () => {
		const { result } = renderHook(() => useAnalytics());

		const testEvent = { category: "Test", action: "Test Action" };
		result.current.sendEvent(testEvent);

		expect(sendEvent).toHaveBeenCalledTimes(1);
		expect(sendEvent).toHaveBeenCalledWith(testEvent);
	});
});
