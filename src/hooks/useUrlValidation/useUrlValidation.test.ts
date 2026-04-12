import { renderHook } from "@testing-library/react";
import { Location, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUrlValidation } from "./useUrlValidation";

vi.mock("react-router-dom", () => ({
	useLocation: vi.fn(),
	useNavigate: vi.fn(), // Required but not used for redirect anymore
}));

describe("useUrlValidation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should redirect if grid is present but platform is missing", () => {
		const replaceStateSpy = vi
			.spyOn(window.history, "replaceState")
			.mockImplementation(() => {});
		vi.mocked(useLocation).mockReturnValue({
			pathname: "/test",
			search: "?grid=some-grid-data",
			state: null,
			key: "default",
			hash: "",
		} as Location);

		renderHook(() => useUrlValidation());

		expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/test");
		replaceStateSpy.mockRestore();
	});

	it("should not redirect if whitelist parameters are already correct", () => {
		const replaceStateSpy = vi
			.spyOn(window.history, "replaceState")
			.mockImplementation(() => {});
		vi.mocked(useLocation).mockReturnValue({
			pathname: "/test",
			search: "?platform=starship",
			state: null,
			key: "default",
			hash: "",
		} as Location);

		renderHook(() => useUrlValidation());

		expect(replaceStateSpy).not.toHaveBeenCalled();
		replaceStateSpy.mockRestore();
	});

	it("should redirect to strip non-whitelist parameters", () => {
		const replaceStateSpy = vi
			.spyOn(window.history, "replaceState")
			.mockImplementation(() => {});
		vi.mocked(useLocation).mockReturnValue({
			pathname: "/test",
			search: "?other=param",
			state: null,
			key: "default",
			hash: "",
		} as Location);

		renderHook(() => useUrlValidation());

		expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/test");
		replaceStateSpy.mockRestore();
	});

	it("should strip other params (not in whitelist) while preserving allowed ones", () => {
		const replaceStateSpy = vi
			.spyOn(window.history, "replaceState")
			.mockImplementation(() => {});
		vi.mocked(useLocation).mockReturnValue({
			pathname: "/test",
			search: "?platform=sentinel&junk=data",
			state: null,
			key: "default",
			hash: "",
		} as Location);

		renderHook(() => useUrlValidation());

		expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/test?platform=sentinel");
		replaceStateSpy.mockRestore();
	});

	it("should handle extremely corrupted URLs by stripping everything except whitelist", () => {
		const replaceStateSpy = vi
			.spyOn(window.history, "replaceState")
			.mockImplementation(() => {});
		vi.mocked(useLocation).mockReturnValue({
			pathname: "/de/",
			search: "?changelog%2F%3Fplatform=sentinel&platform=sentinel",
			state: null,
			key: "default",
			hash: "",
		} as Location);

		renderHook(() => useUrlValidation());

		expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/de/?platform=sentinel");
		replaceStateSpy.mockRestore();
	});
});
