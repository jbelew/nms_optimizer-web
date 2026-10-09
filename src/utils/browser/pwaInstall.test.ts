import type { BeforeInstallPromptEvent } from "./pwaInstall";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	getDeferredInstallPrompt,
	initBeforeInstallPromptListener,
	onBeforeInstallPrompt,
	resetPwaInstallForTesting,
} from "./pwaInstall";

describe("pwaInstall", () => {
	beforeEach(() => {
		resetPwaInstallForTesting();
	});

	afterEach(() => {
		resetPwaInstallForTesting();
		vi.restoreAllMocks();
	});

	const createMockPromptEvent = (): BeforeInstallPromptEvent => {
		const event = new Event("beforeinstallprompt") as BeforeInstallPromptEvent;
		Object.defineProperty(event, "platforms", { value: ["web"] });
		Object.defineProperty(event, "prompt", { value: vi.fn().mockResolvedValue(undefined) });
		Object.defineProperty(event, "userChoice", {
			value: Promise.resolve({ outcome: "accepted", platform: "web" }),
		});

		return event;
	};

	it("captures beforeinstallprompt event fired on window", () => {
		initBeforeInstallPromptListener();
		const mockEvent = createMockPromptEvent();
		const preventDefaultSpy = vi.spyOn(mockEvent, "preventDefault");

		window.dispatchEvent(mockEvent);

		expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
		expect(getDeferredInstallPrompt()).toBe(mockEvent);
	});

	it("delivers previously captured event immediately when subscriber registers late", () => {
		initBeforeInstallPromptListener();
		const mockEvent = createMockPromptEvent();
		window.dispatchEvent(mockEvent);

		const callback = vi.fn();
		const unsubscribe = onBeforeInstallPrompt(callback);

		expect(callback).toHaveBeenCalledWith(mockEvent);
		expect(callback).toHaveBeenCalledTimes(1);

		unsubscribe();
	});

	it("delivers event to active subscribers when beforeinstallprompt fires", () => {
		initBeforeInstallPromptListener();
		const callback = vi.fn();
		const unsubscribe = onBeforeInstallPrompt(callback);

		expect(callback).not.toHaveBeenCalled();

		const mockEvent = createMockPromptEvent();
		window.dispatchEvent(mockEvent);

		expect(callback).toHaveBeenCalledWith(mockEvent);
		expect(callback).toHaveBeenCalledTimes(1);

		unsubscribe();
	});

	it("stops notifying after unsubscribing", () => {
		initBeforeInstallPromptListener();
		const callback = vi.fn();
		const unsubscribe = onBeforeInstallPrompt(callback);

		unsubscribe();

		const mockEvent = createMockPromptEvent();
		window.dispatchEvent(mockEvent);

		expect(callback).not.toHaveBeenCalled();
	});
});
