import { renderHook } from "@testing-library/react";
import { Location, useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { useUrlValidation } from "./useUrlValidation";

vi.mock("react-router-dom", () => ({
	useLocation: vi.fn(),
	useNavigate: vi.fn(),
}));

describe("useUrlValidation", () => {
	let navigateMock: Mock;

	beforeEach(() => {
		vi.clearAllMocks();
		navigateMock = vi.fn();
		vi.mocked(useNavigate).mockReturnValue(navigateMock);
	});

	it("should redirect if grid is present but platform is missing", () => {
		vi.mocked(useLocation).mockReturnValue({
			pathname: "/test",
			search: "?grid=some-grid-data",
			state: null,
			key: "default",
			hash: "",
		} as Location);

		renderHook(() => useUrlValidation());

		expect(navigateMock).toHaveBeenCalledWith("/test?", { replace: true });
	});

	it("should not redirect if both grid and platform are present", () => {
		vi.mocked(useLocation).mockReturnValue({
			pathname: "/test",
			search: "?grid=some-grid-data&platform=starship",
			state: null,
			key: "default",
			hash: "",
		} as Location);

		renderHook(() => useUrlValidation());

		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("should not redirect if neither grid nor platform is present", () => {
		vi.mocked(useLocation).mockReturnValue({
			pathname: "/test",
			search: "?other=param",
			state: null,
			key: "default",
			hash: "",
		} as Location);

		renderHook(() => useUrlValidation());

		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("should preserve other params when redirecting", () => {
		vi.mocked(useLocation).mockReturnValue({
			pathname: "/test",
			search: "?grid=data&lang=en",
			state: null,
			key: "default",
			hash: "",
		} as Location);

		renderHook(() => useUrlValidation());

		expect(navigateMock).toHaveBeenCalledWith("/test?lang=en", { replace: true });
	});
});
