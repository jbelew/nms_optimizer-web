import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { sendDeferredEvent, sendEvent } from "../../utils/analytics/tracking";
import { useAnalytics } from "./useAnalytics";

// Mock the actual sendEvent function from utils/analytics/tracking
vi.mock("../../utils/analytics/tracking", () => ({
	sendDeferredEvent: vi.fn(),
	sendEvent: vi.fn(),
}));

describe("useAnalytics", () => {
	it("should return the analytics functions", () => {
		const { result } = renderHook(() => useAnalytics());

		expect(result.current.sendEvent).toBeDefined();
		expect(result.current.sendEvent).toBe(sendEvent);
		expect(result.current.sendDeferredEvent).toBeDefined();
		expect(result.current.sendDeferredEvent).toBe(sendDeferredEvent);
	});
});
