import type { ErrorState } from "@/store/app/errorStore";
import type { SessionState } from "@/store/app/sessionStore";
import type { i18n, ResourceKey, TFunction } from "i18next";
import type { UseTranslationResponse } from "react-i18next";
import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useErrorStore } from "@/store/app/errorStore";
import { useSessionStore } from "@/store/app/sessionStore";

import { useErrorDispatcher } from "./useErrorDispatcher";

vi.mock("@/store/app/errorStore", () => ({
	useErrorStore: vi.fn(),
}));

vi.mock("@/store/app/sessionStore", () => ({
	useSessionStore: vi.fn(),
}));

vi.mock("react-i18next", () => ({
	useTranslation: vi.fn(),
}));

describe("useErrorDispatcher", () => {
	let addErrorMock: Mock;
	let tMock: Mock;

	const mockSessionState: SessionState = {
		grid_fixed: 0,
		incrementGridFixed: vi.fn(),
		incrementModuleLocked: vi.fn(),
		incrementRowLimit: vi.fn(),
		incrementSuperchargedFixed: vi.fn(),
		incrementSuperchargedLimit: vi.fn(),
		module_locked: 0,
		resetSession: vi.fn(),
		row_limit: 0,
		supercharged_fixed: 0,
		supercharged_limit: 0,
	};

	const mockErrorState: ErrorState = {
		addError: vi.fn(),
		clearErrors: vi.fn(),
		errors: [],
		removeError: vi.fn(),
	};

	const mockI18n = {
		addResource: vi.fn(),
		addResourceBundle: vi.fn(),
		addResources: vi.fn(),
		changeLanguage: vi.fn(),
		dir: vi.fn(),
		emit: vi.fn(),
		exists: vi.fn(),
		format: vi.fn(),
		getDataByLanguage: vi.fn(),
		getFixedT: vi.fn(),
		getResourceBundle: vi.fn(),
		hasResourceBundle: vi.fn(),
		isInitialized: true,
		language: "en",
		languages: ["en"],
		loadLanguages: vi.fn(),
		loadNamespaces: vi.fn(),
		loadResources: vi.fn(),
		modules: {} as Record<string, unknown>,
		off: vi.fn(),
		on: vi.fn(),
		options: {},
		reloadResources: vi.fn(),
		removeResourceBundle: vi.fn(),
		resolvedLanguage: "en",
		services: {} as Record<string, unknown>,
		setDefaultNamespace: vi.fn(),
		store: {} as ResourceKey,
		t: vi.fn((key: string) => key) as unknown as TFunction,
		use: vi.fn(),
	} as unknown as i18n;

	beforeEach(() => {
		vi.clearAllMocks();
		addErrorMock = vi.fn();
		tMock = vi.fn((key: string) => key);

		vi.mocked(useErrorStore).mockReturnValue({
			...mockErrorState,
			addError: addErrorMock,
		});

		// Using a minimal object that satisfies the necessary properties of the expected response

		vi.mocked(useTranslation).mockReturnValue(
			Object.assign([tMock as unknown as TFunction, mockI18n, true], {
				i18n: mockI18n,
				ready: true,
				t: tMock as unknown as TFunction,
			}) as unknown as UseTranslationResponse<string, undefined>
		);
	});

	it("should not dispatch error if thresholds are not met", () => {
		vi.mocked(useSessionStore).mockReturnValue({
			...mockSessionState,
			supercharged_limit: 2,
		});

		renderHook(() => useErrorDispatcher());

		expect(addErrorMock).not.toHaveBeenCalled();
	});

	it("should dispatch error when supercharged_limit threshold is met", () => {
		vi.mocked(useSessionStore).mockReturnValue({
			...mockSessionState,
			supercharged_limit: 3,
		});

		renderHook(() => useErrorDispatcher());

		expect(addErrorMock).toHaveBeenCalledWith("restrictions.superchargedLimit", "warning");
	});

	it("should only dispatch error once for the same threshold", () => {
		let currentSessionState = {
			...mockSessionState,
			supercharged_limit: 3,
		};
		vi.mocked(useSessionStore).mockImplementation(() => currentSessionState);

		const { rerender } = renderHook(() => useErrorDispatcher());
		expect(addErrorMock).toHaveBeenCalledTimes(1);

		// Rerender with same state
		rerender();
		expect(addErrorMock).toHaveBeenCalledTimes(1);

		// Rerender with higher value
		currentSessionState = { ...currentSessionState, supercharged_limit: 4 };
		rerender();
		expect(addErrorMock).toHaveBeenCalledTimes(1);
	});

	it("should reset triggered flags when session resets", () => {
		let currentSessionState = {
			...mockSessionState,
			supercharged_limit: 3,
		};
		vi.mocked(useSessionStore).mockImplementation(() => currentSessionState);

		const { rerender } = renderHook(() => useErrorDispatcher());
		expect(addErrorMock).toHaveBeenCalledTimes(1);

		// Reset session
		currentSessionState = { ...currentSessionState, supercharged_limit: 0 };
		rerender();

		// Trigger again
		currentSessionState = { ...currentSessionState, supercharged_limit: 3 };
		rerender();

		expect(addErrorMock).toHaveBeenCalledTimes(2);
	});

	it("should dispatch error when grid_fixed threshold is met", () => {
		vi.mocked(useSessionStore).mockReturnValue({
			...mockSessionState,
			grid_fixed: 3,
		});

		renderHook(() => useErrorDispatcher());

		expect(addErrorMock).toHaveBeenCalledWith("restrictions.gridFixed", "warning");
	});

	it("should dispatch error when module_locked threshold is met", () => {
		vi.mocked(useSessionStore).mockReturnValue({
			...mockSessionState,
			module_locked: 3,
		});

		renderHook(() => useErrorDispatcher());

		expect(addErrorMock).toHaveBeenCalledWith("restrictions.moduleLocked", "warning");
	});

	it("should dispatch error when row_limit threshold is met", () => {
		vi.mocked(useSessionStore).mockReturnValue({
			...mockSessionState,
			row_limit: 3,
		});

		renderHook(() => useErrorDispatcher());

		expect(addErrorMock).toHaveBeenCalledWith("restrictions.rowLimit", "warning");
	});

	it("should handle multiple thresholds simultaneously", () => {
		vi.mocked(useSessionStore).mockReturnValue({
			...mockSessionState,
			supercharged_fixed: 3,
			supercharged_limit: 3,
		});

		renderHook(() => useErrorDispatcher());

		expect(addErrorMock).toHaveBeenCalledWith("restrictions.superchargedLimit", "warning");
		expect(addErrorMock).toHaveBeenCalledWith("restrictions.superchargedFixed", "warning");
		expect(addErrorMock).toHaveBeenCalledTimes(2);
	});
});
