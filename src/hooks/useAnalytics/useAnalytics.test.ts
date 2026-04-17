import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { sendEvent } from "../../utils/analytics/tracking";
import { useAnalytics } from "./useAnalytics";

// Mock the actual sendEvent function from utils/analytics/tracking
vi.mock("../../utils/analytics/tracking", () => ({
	sendEvent: vi.fn(),
}));

describe("useAnalytics", () => {
	it("should return the sendEvent function", () => {
		const { result } = renderHook(() => useAnalytics());

		expect(result.current.sendEvent).toBeDefined();
		expect(result.current.sendEvent).toBe(sendEvent);
	});
});
