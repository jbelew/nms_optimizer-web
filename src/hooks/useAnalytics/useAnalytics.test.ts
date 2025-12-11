import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { sendEvent } from "../../utils/analytics";
import { useAnalytics } from "./useAnalytics";

// Mock the actual sendEvent function from utils/analytics
vi.mock("../../utils/analytics", () => ({
	sendEvent: vi.fn(),
}));

describe("useAnalytics", () => {
	it("should return the sendEvent function", () => {
		const { result } = renderHook(() => useAnalytics());

		expect(result.current.sendEvent).toBeDefined();
		expect(result.current.sendEvent).toBe(sendEvent);
	});
});
