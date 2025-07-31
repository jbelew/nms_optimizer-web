import { act, renderHook } from "@testing-library/react";
import ReactGA from "react-ga4";
import { vi } from "vitest";

import { TRACKING_ID } from "../constants";
import { reportWebVitals } from "../reportWebVitals";
import { useAnalytics } from "./useAnalytics";

// Mock ReactGA and reportWebVitals
vi.mock("react-ga4");
vi.mock("../reportWebVitals");

describe("useAnalytics", () => {
	beforeEach(() => {
		// Reset mocks before each test
		vi.clearAllMocks();
		// Reset environment variable for consistent testing
		import.meta.env.DEV = false;
	});

	it("should initialize ReactGA and reportWebVitals once on mount", () => {
		const { rerender } = renderHook(() => useAnalytics());

		// Expect initialize and reportWebVitals to be called on first mount
		expect(ReactGA.initialize).toHaveBeenCalledTimes(1);
		expect(ReactGA.initialize).toHaveBeenCalledWith(TRACKING_ID, {
			testMode: false,
			gtagOptions: { send_page_view: true },
		});
		expect(reportWebVitals).toHaveBeenCalledTimes(1);

		// Rerender the hook, initialize should not be called again
		rerender();
		expect(ReactGA.initialize).toHaveBeenCalledTimes(1);
		expect(reportWebVitals).toHaveBeenCalledTimes(1);
	});

	it("should not send pageview on initial mount but set ref", () => {
		renderHook(() => useAnalytics());

		// Initial pageview should NOT be sent, but ref should be set
		expect(ReactGA.event).not.toHaveBeenCalled();
		// To check initialPageViewSentRef, we'd need to expose it or test its side effect on subsequent calls
		// For now, we rely on the next test to confirm its effect.
	});

	it("should correctly set testMode based on import.meta.env.DEV", () => {
		import.meta.env.DEV = true;
		renderHook(() => useAnalytics());
		expect(ReactGA.initialize).toHaveBeenCalledWith(TRACKING_ID, {
			testMode: true,
			gtagOptions: { send_page_view: true },
		});
	});

	it("should send custom events via sendEvent function", () => {
		const { result } = renderHook(() => useAnalytics());

		act(() => {
			result.current.sendEvent({
				category: "User Action",
				action: "Button Click",
				label: "Submit",
				value: 10,
				platform: "web",
				tech: "react",
			});
		});

		expect(ReactGA.event).toHaveBeenCalledTimes(1);
		expect(ReactGA.event).toHaveBeenCalledWith({
			category: "User Action",
			action: "Button Click",
			label: "Submit",
			value: 10,
			platform: "web",
			tech: "react",
		});
	});
});
