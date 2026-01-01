import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_URL } from "../constants";
import { initializeAnalyticsClient, sendEvent } from "./analyticsClient";

describe("analyticsClient", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		sessionStorage.clear();
		// Reset the module-level clientId variable by reloading the module or similar if possible,
		// but since it's a module level variable, we might need to rely on initializeAnalyticsClient logic.
		// However, getClientId calls initializeAnalyticsClient if !clientId.
		// We can't easily reset the module-level 'clientId' variable without using a wrapper or reloading the module.
		// For now, we will assume the environment is fresh or we might need to adjust the code to be more testable.
		// Actually, since clientId is exported or accessible? No, it's not exported.
		// We can check if localStorage is populated.
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should generate a client ID and store it in localStorage", () => {
		const clientId = initializeAnalyticsClient();
		expect(clientId).toMatch(/^web_\d+_[a-z0-9]+$/);
		expect(localStorage.getItem("analytics_client_id")).toBe(clientId);
	});

	it("should retrieve existing client ID from localStorage", () => {
		const existingId = "web_12345_abcde";
		localStorage.setItem("analytics_client_id", existingId);

		const clientId = initializeAnalyticsClient();
		expect(clientId).toBe(existingId);
	});

	it("should send event with keepalive: true", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
		});
		global.fetch = fetchMock;

		await sendEvent("test_event", { foo: "bar" });

		expect(fetchMock).toHaveBeenCalledWith(
			`${API_URL}api/events`,
			expect.objectContaining({
				method: "POST",
				keepalive: true,
				headers: {
					"Content-Type": "application/json",
				},
				body: expect.stringContaining('"eventName":"test_event"'),
			})
		);
	});

	it("should include userId if provided", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
		});
		global.fetch = fetchMock;

		await sendEvent("test_event", {}, "user_123");

		expect(fetchMock).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				body: expect.stringContaining('"userId":"user_123"'),
			})
		);
	});

	it("should handle fetch error gracefully", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const fetchMock = vi.fn().mockRejectedValue(new Error("Network error"));
		global.fetch = fetchMock;

		await sendEvent("test_event");

		expect(consoleSpy).toHaveBeenCalledWith(
			"Analytics event fallback failed:",
			expect.any(Error)
		);
		consoleSpy.mockRestore();
	});
});
