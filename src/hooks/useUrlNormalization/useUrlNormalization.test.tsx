import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDialog } from "../../context/dialog-utils";
import { usePlatformStore } from "../../store/PlatformStore";
import { useUrlNormalization } from "./useUrlNormalization";

interface PlatformStoreState {
	selectedPlatform: string;
}

type PlatformStoreSelector = (state: PlatformStoreState) => string;

// Mock dependencies
vi.mock("react-router-dom", () => ({
	useLocation: vi.fn(),
	useNavigate: vi.fn(),
}));

vi.mock("../../context/dialog-utils", () => ({
	useDialog: vi.fn(),
}));

vi.mock("../../store/PlatformStore", () => ({
	usePlatformStore: vi.fn(),
}));

describe("useUrlNormalization", () => {
	const navigateMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useNavigate as Mock).mockReturnValue(navigateMock);
		(useLocation as Mock).mockReturnValue({ pathname: "/", search: "" });
		(useDialog as Mock).mockReturnValue({ userVisited: false });
		(usePlatformStore as unknown as Mock).mockImplementation(
			(selector: PlatformStoreSelector) => selector({ selectedPlatform: "standard" })
		);

		// Mock window.location
		window.history.replaceState({}, "", "/");
	});

	it("should NOT add platform parameter for a new user on root path", () => {
		(useDialog as Mock).mockReturnValue({ userVisited: false });

		renderHook(() => useUrlNormalization());

		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("should add platform parameter for a returning user on root path", () => {
		(useDialog as Mock).mockReturnValue({ userVisited: true });

		renderHook(() => useUrlNormalization());

		expect(navigateMock).toHaveBeenCalledWith("/?platform=standard", { replace: true });
	});

	it("should keep and sync platform parameter if it already exists in the URL (Deep Link)", () => {
		(useDialog as Mock).mockReturnValue({ userVisited: false });
		window.history.replaceState({}, "", "/?platform=solar");
		(usePlatformStore as unknown as Mock).mockImplementation(
			(selector: PlatformStoreSelector) => selector({ selectedPlatform: "solar" })
		);

		renderHook(() => useUrlNormalization());

		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("should update platform parameter if it exists but does not match store", () => {
		(useDialog as Mock).mockReturnValue({ userVisited: false });
		window.history.replaceState({}, "", "/?platform=solar");
		(usePlatformStore as unknown as Mock).mockImplementation(
			(selector: PlatformStoreSelector) => selector({ selectedPlatform: "standard" })
		);

		renderHook(() => useUrlNormalization());

		expect(navigateMock).toHaveBeenCalledWith("/?platform=standard", { replace: true });
	});

	it("should always ensure a trailing slash for non-file paths", () => {
		(useDialog as Mock).mockReturnValue({ userVisited: false });
		window.history.replaceState({}, "", "/about");
		(useLocation as Mock).mockReturnValue({ pathname: "/about", search: "" });

		renderHook(() => useUrlNormalization());

		expect(navigateMock).toHaveBeenCalledWith("/about/", { replace: true });
	});

	it("should ensure trailing slash AND platform for returning users on sub-routes", () => {
		(useDialog as Mock).mockReturnValue({ userVisited: true });
		window.history.replaceState({}, "", "/about");
		(useLocation as Mock).mockReturnValue({ pathname: "/about", search: "" });

		renderHook(() => useUrlNormalization());

		expect(navigateMock).toHaveBeenCalledWith("/about/?platform=standard", { replace: true });
	});

	it("should NOT add trailing slash for files with extensions", () => {
		(useDialog as Mock).mockReturnValue({ userVisited: false });
		window.history.replaceState({}, "", "/sitemap.xml");
		(useLocation as Mock).mockReturnValue({ pathname: "/sitemap.xml", search: "" });

		renderHook(() => useUrlNormalization());

		expect(navigateMock).not.toHaveBeenCalled();
	});
});
