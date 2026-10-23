import { act } from "react";
import type { Location } from "react-router-dom";
import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlatformCatalog, PlatformState } from "@/store/app/platformStore";
import { usePlatformsSuspense, usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { useDialog } from "@/utils/system/dialogUtils";

import { useUrlSync } from "./useUrlSync";

vi.mock("@/store/grid/gridStore", () => ({
	createGrid: vi.fn(),
	useGridStore: vi.fn() as unknown as Mock,
}));
vi.mock("@/store/app/platformStore", () => ({
	usePlatformsSuspense: vi.fn() as unknown as Mock,
	usePlatformStore: vi.fn() as unknown as Mock,
}));
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
	useLocation: vi.fn(() => ({
		pathname: window.location.pathname,
		search: window.location.search,
	})),
	useNavigate: () => mockNavigate,
}));
vi.mock("@/utils/system/dialogUtils", () => ({
	useDialog: vi.fn(() => ({ userVisited: false })),
}));

/**
 * Test suite for the `useUrlSync` hook (including URL validation and normalization).
 */
describe("useUrlSync", () => {
	const mockSetIsSharedGrid = vi.fn();
	const mockSetSelectedPlatform = vi.fn();
	const mockResetGrid = vi.fn();

	let gridStoreState = {
		grid: { cells: [], height: 6, width: 10 },
		isSharedGrid: false,
		resetGrid: mockResetGrid,
		setIsSharedGrid: mockSetIsSharedGrid,
	};

	let platformStoreState: {
		initializePlatform: Mock;
		isValidPlatform: (platform: null | string | undefined) => platform is string;
		platforms: null | PlatformCatalog;
		selectedPlatform: string;
		setPlatforms: Mock;
		setSelectedPlatform: Mock;
	} = {
		initializePlatform: vi.fn(),
		isValidPlatform: (platform): platform is string =>
			typeof platform === "string"
			&& platform.length > 0
			&& (platformStoreState.platforms === null
				|| Object.prototype.hasOwnProperty.call(platformStoreState.platforms, platform)),
		platforms: {
			"test-platform": { label: "Test Platform", type: "Starship" },
		},
		selectedPlatform: "test-platform",
		setPlatforms: vi.fn(),
		setSelectedPlatform: mockSetSelectedPlatform,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		window.history.pushState({}, "", "/");

		vi.mocked(useLocation).mockImplementation(
			() =>
				({
					pathname: window.location.pathname,
					search: window.location.search,
				}) as Location,
		);
		vi.mocked(useDialog).mockReturnValue({ userVisited: false } as ReturnType<
			typeof useDialog
		>);

		gridStoreState = {
			grid: { cells: [], height: 6, width: 10 },
			isSharedGrid: false,
			resetGrid: mockResetGrid.mockImplementation(() => {
				gridStoreState.isSharedGrid = false;
			}),
			setIsSharedGrid: mockSetIsSharedGrid.mockImplementation((val: boolean) => {
				gridStoreState.isSharedGrid = val;
			}),
		};

		vi.mocked(useGridStore).mockImplementation(((selector?: (s: unknown) => unknown) =>
			typeof selector === "function" ?
				selector(gridStoreState)
			:	gridStoreState) as typeof useGridStore);
		(useGridStore as unknown as { getState: Mock }).getState = vi.fn(() => gridStoreState);

		const defaultCatalog: PlatformCatalog = {
			"test-platform": { label: "Test Platform", type: "Starship" },
		};

		platformStoreState = {
			initializePlatform: vi.fn(),
			isValidPlatform: (platform): platform is string =>
				typeof platform === "string"
				&& platform.length > 0
				&& (platformStoreState.platforms === null
					|| Object.prototype.hasOwnProperty.call(
						platformStoreState.platforms,
						platform,
					)),
			platforms: defaultCatalog,
			selectedPlatform: "test-platform",
			setPlatforms: vi.fn(),
			setSelectedPlatform: mockSetSelectedPlatform.mockImplementation((platform: string) => {
				platformStoreState.selectedPlatform = platform;
			}),
		};

		vi.mocked(usePlatformStore).mockImplementation(((
			selector?: (state: PlatformState) => unknown,
		) => {
			return typeof selector === "function" ?
					selector(platformStoreState)
				:	platformStoreState;
		}) as typeof usePlatformStore);
		(usePlatformStore as unknown as { getState: Mock }).getState = vi.fn(
			() => platformStoreState,
		);

		vi.mocked(usePlatformsSuspense).mockReturnValue(defaultCatalog);
	});

	it("should update URL for sharing via sessionCoordinator.getShareUrl", () => {
		const getShareUrlSpy = vi
			.spyOn(sessionCoordinator, "getShareUrl")
			.mockReturnValue("http://localhost/?platform=test-platform&grid=serialized-grid");

		const { result } = renderHook(() => useUrlSync());
		const sharedUrl = result.current.updateUrlForShare();
		const url = new URL(sharedUrl);
		expect(url.searchParams.get("grid")).toBe("serialized-grid");
		expect(url.searchParams.get("platform")).toBe("test-platform");

		getShareUrlSpy.mockRestore();
	});

	it("should push history entry when resetting a shared grid (grid param in URL)", () => {
		const deserializeSpy = vi
			.spyOn(sessionCoordinator, "deserializeSharedGrid")
			.mockResolvedValue();
		window.history.pushState({}, "", "/?grid=some-grid&platform=test-platform");
		const { result } = renderHook(() => useUrlSync());
		result.current.updateUrlForReset();
		expect(mockNavigate).toHaveBeenCalledWith("/?platform=test-platform", { replace: false });
		deserializeSpy.mockRestore();
	});

	it("should skip navigation when resetting a layout without a grid param in URL", () => {
		window.history.pushState({}, "", "/?platform=test-platform");
		const { result } = renderHook(() => useUrlSync());
		result.current.updateUrlForReset();
		expect(mockNavigate).not.toHaveBeenCalled();
	});

	it("should deserialize grid from URL on initial load", () => {
		const deserializeSpy = vi
			.spyOn(sessionCoordinator, "deserializeSharedGrid")
			.mockResolvedValue();
		window.history.pushState({}, "", "/?grid=serialized-grid&platform=test-platform");
		renderHook(() => useUrlSync());
		expect(deserializeSpy).toHaveBeenCalledWith("serialized-grid");
		deserializeSpy.mockRestore();
	});

	it("should set platform from URL on initial load", () => {
		const deserializeSpy = vi
			.spyOn(sessionCoordinator, "deserializeSharedGrid")
			.mockResolvedValue();
		window.history.pushState({}, "", "/?grid=serialized-grid&platform=new-platform");
		const catalog = {
			"new-platform": { label: "New Platform", type: "Starship" },
		};
		platformStoreState.platforms = catalog;
		vi.mocked(usePlatformsSuspense).mockReturnValue(catalog);
		renderHook(() => useUrlSync());
		expect(mockSetSelectedPlatform).toHaveBeenCalledWith("new-platform");
		deserializeSpy.mockRestore();
	});

	it("should handle popstate events", () => {
		const deserializeSpy = vi
			.spyOn(sessionCoordinator, "deserializeSharedGrid")
			.mockResolvedValue();
		const catalog = {
			"new-platform": { label: "New Platform", type: "Starship" },
			"test-platform": { label: "Test Platform", type: "Starship" },
		};
		platformStoreState.platforms = catalog;
		vi.mocked(usePlatformsSuspense).mockReturnValue(catalog);

		renderHook(() => useUrlSync());

		act(() => {
			window.history.pushState({}, "", "/?grid=new-serialized-grid&platform=new-platform");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		expect(deserializeSpy).toHaveBeenCalledWith("new-serialized-grid");
		expect(mockSetSelectedPlatform).toHaveBeenCalledWith("new-platform");
		deserializeSpy.mockRestore();
	});

	it("should restore shared grid on Back navigation after reset, and reset on Forward navigation", async () => {
		const deserializeSpy = vi
			.spyOn(sessionCoordinator, "deserializeSharedGrid")
			.mockImplementation(async () => {
				gridStoreState.isSharedGrid = true;
			});

		// 1. Initial load with a shared grid
		window.history.pushState({}, "", "/?grid=shared-grid-1&platform=test-platform");
		const { result } = renderHook(() => useUrlSync());

		await act(async () => {});

		expect(deserializeSpy).toHaveBeenCalledWith("shared-grid-1");
		expect(gridStoreState.isSharedGrid).toBe(true);

		// 2. User resets the grid
		result.current.updateUrlForReset();
		expect(mockNavigate).toHaveBeenCalledWith("/?platform=test-platform", { replace: false });

		// Simulate URL and store change after reset
		window.history.pushState({}, "", "/?platform=test-platform");
		gridStoreState.isSharedGrid = false;

		// 3. User navigates Back to the shared grid
		await act(async () => {
			window.history.pushState({}, "", "/?grid=shared-grid-1&platform=test-platform");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		expect(deserializeSpy).toHaveBeenCalledWith("shared-grid-1");
		expect(gridStoreState.isSharedGrid).toBe(true);

		// 4. User navigates Forward to the reset grid (no grid param in URL)
		await act(async () => {
			window.history.pushState({}, "", "/?platform=test-platform");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		// sessionCoordinator.resetSession() should have been called, resetting the grid
		expect(mockResetGrid).toHaveBeenCalled();
		expect(gridStoreState.isSharedGrid).toBe(false);

		deserializeSpy.mockRestore();
	});

	describe("URL Validation", () => {
		it("should strip grid parameter if platform is missing", () => {
			const replaceStateSpy = vi
				.spyOn(window.history, "replaceState")
				.mockImplementation(() => {});
			vi.mocked(useLocation).mockReturnValue({
				hash: "",
				key: "default",
				pathname: "/test/",
				search: "?grid=some-grid-data",
				state: null,
			} as Location);

			renderHook(() => useUrlSync());

			expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/test/");
			replaceStateSpy.mockRestore();
		});

		it("should strip non-whitelisted parameters while preserving allowed ones", () => {
			const replaceStateSpy = vi
				.spyOn(window.history, "replaceState")
				.mockImplementation(() => {});
			vi.mocked(useLocation).mockReturnValue({
				hash: "",
				key: "default",
				pathname: "/test/",
				search: "?platform=sentinel&junk=data",
				state: null,
			} as Location);

			renderHook(() => useUrlSync());

			expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/test/?platform=sentinel");
			replaceStateSpy.mockRestore();
		});
	});

	describe("URL Normalization", () => {
		it("should NOT add platform parameter for a new user on root path", () => {
			vi.mocked(useDialog).mockReturnValue({ userVisited: false } as ReturnType<
				typeof useDialog
			>);
			renderHook(() => useUrlSync());
			expect(mockNavigate).not.toHaveBeenCalled();
		});

		it("should add platform parameter for a returning user on root path", () => {
			vi.mocked(useDialog).mockReturnValue({
				activeDialog: null,
				userVisited: true,
			} as ReturnType<typeof useDialog>);
			renderHook(() => useUrlSync());
			expect(mockNavigate).toHaveBeenCalledWith("/?platform=test-platform", {
				replace: true,
			});
		});

		it("should NOT add platform parameter when a Routed Dialog is active and no platform param is in the URL", () => {
			vi.mocked(useDialog).mockReturnValue({
				activeDialog: "about",
				userVisited: true,
			} as ReturnType<typeof useDialog>);
			window.history.replaceState({}, "", "/about/");
			vi.mocked(useLocation).mockReturnValue({
				pathname: "/about/",
				search: "",
			} as Location);

			renderHook(() => useUrlSync());

			expect(mockNavigate).not.toHaveBeenCalled();
		});

		it("should always ensure a trailing slash for non-file paths", () => {
			vi.mocked(useDialog).mockReturnValue({ userVisited: false } as ReturnType<
				typeof useDialog
			>);
			window.history.replaceState({}, "", "/about");
			vi.mocked(useLocation).mockReturnValue({ pathname: "/about", search: "" } as Location);

			renderHook(() => useUrlSync());

			expect(mockNavigate).toHaveBeenCalledWith("/about/", { replace: true });
		});

		it("should NOT add trailing slash for files with extensions", () => {
			vi.mocked(useDialog).mockReturnValue({ userVisited: false } as ReturnType<
				typeof useDialog
			>);
			window.history.replaceState({}, "", "/sitemap.xml");
			vi.mocked(useLocation).mockReturnValue({
				pathname: "/sitemap.xml",
				search: "",
			} as Location);

			renderHook(() => useUrlSync());

			expect(mockNavigate).not.toHaveBeenCalled();
		});
	});
});
