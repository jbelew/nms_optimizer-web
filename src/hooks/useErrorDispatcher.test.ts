import { renderHook } from "@testing-library/react";
import { i18n, ResourceKey, TFunction } from "i18next";
import { useTranslation, UseTranslationResponse } from "react-i18next";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { ErrorState, useErrorStore } from "@/store/ErrorStore";
import { SessionState, useSessionStore } from "@/store/SessionStore";

import { useErrorDispatcher } from "./useErrorDispatcher";

vi.mock("@/store/ErrorStore", () => ({
	useErrorStore: vi.fn(),
}));

vi.mock("@/store/SessionStore", () => ({
	useSessionStore: vi.fn(),
}));

vi.mock("react-i18next", () => ({
	useTranslation: vi.fn(),
}));

describe("useErrorDispatcher", () => {
	let addErrorMock: Mock;
	let tMock: Mock;

	const mockSessionState: SessionState = {
		supercharged_limit: 0,
		supercharged_fixed: 0,
		grid_fixed: 0,
		module_locked: 0,
		row_limit: 0,
		incrementSuperchargedLimit: vi.fn(),
		incrementSuperchargedFixed: vi.fn(),
		incrementGridFixed: vi.fn(),
		incrementModuleLocked: vi.fn(),
		incrementRowLimit: vi.fn(),
		resetSession: vi.fn(),
	};

	const mockErrorState: ErrorState = {
		errors: [],
		addError: vi.fn(),
		removeError: vi.fn(),
		clearErrors: vi.fn(),
	};

	const mockI18n = {
		language: "en",
		languages: ["en"],
		changeLanguage: vi.fn(),
		exists: vi.fn(),
		getFixedT: vi.fn(),
		dir: vi.fn(),
		format: vi.fn(),
		on: vi.fn(),
		off: vi.fn(),
		emit: vi.fn(),
		loadNamespaces: vi.fn(),
		loadLanguages: vi.fn(),
		loadResources: vi.fn(),
		options: {},
		isInitialized: true,
		resolvedLanguage: "en",
		reloadResources: vi.fn(),
		use: vi.fn(),
		getDataByLanguage: vi.fn(),
		hasResourceBundle: vi.fn(),
		getResourceBundle: vi.fn(),
		addResource: vi.fn(),
		addResources: vi.fn(),
		addResourceBundle: vi.fn(),
		removeResourceBundle: vi.fn(),
		setDefaultNamespace: vi.fn(),
		t: vi.fn((key: string) => key) as unknown as TFunction,
		store: {} as ResourceKey,
		services: {} as Record<string, unknown>,
		modules: {} as Record<string, unknown>,
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
				t: tMock as unknown as TFunction,
				i18n: mockI18n,
				ready: true,
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
			supercharged_limit: 3,
			supercharged_fixed: 3,
		});

		renderHook(() => useErrorDispatcher());

		expect(addErrorMock).toHaveBeenCalledWith("restrictions.superchargedLimit", "warning");
		expect(addErrorMock).toHaveBeenCalledWith("restrictions.superchargedFixed", "warning");
		expect(addErrorMock).toHaveBeenCalledTimes(2);
	});
});
