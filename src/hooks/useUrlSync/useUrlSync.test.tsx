import type { PlatformState } from "@/store/app/platformStore";
import type { Mock } from "vitest";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGridDeserializer } from "@/hooks/useGridDeserializer/useGridDeserializer";
import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";

import { useUrlSync } from "./useUrlSync";

vi.mock("@/store/grid/gridStore", () => ({
	createGrid: vi.fn(),
	useGridStore: vi.fn() as unknown as Mock,
}));
vi.mock("@/store/app/platformStore", () => ({
	usePlatformStore: vi.fn() as unknown as Mock,
}));
vi.mock("@/hooks/useGridDeserializer/useGridDeserializer", () => ({
	useGridDeserializer: vi.fn() as unknown as Mock,
}));
vi.mock("@/hooks/useShipTypes/useShipTypes", () => ({
	useFetchShipTypesSuspense: vi.fn() as unknown as Mock,
}));
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
}));
vi.mock("@/context/RouteContext", () => ({
	useRouteContext: vi.fn(() => ({ isKnownRoute: true })),
}));

/**
 * Test suite for the `useUrlSync` hook.
 */
describe("useUrlSync", () => {
	const mockSetIsSharedGrid = vi.fn();
	const mockSetSelectedPlatform = vi.fn();
	const mockSerializeGrid = vi.fn();
	const mockDeserializeGrid = vi.fn();
	const mockResetGrid = vi.fn();
	const mockClearInteractionState = vi.fn();

	let gridStoreState = {
		clearInteractionState: mockClearInteractionState,
		isSharedGrid: false,
		resetGrid: mockResetGrid,
		setIsSharedGrid: mockSetIsSharedGrid,
	};

	/**
	 * Sets up mocks and initializes test environment before each test.
	 */
	beforeEach(() => {
		vi.clearAllMocks();
		window.history.pushState({}, "", "/");

		gridStoreState = {
			clearInteractionState: mockClearInteractionState,
			isSharedGrid: false,
			resetGrid: mockResetGrid.mockImplementation(() => {
				gridStoreState.isSharedGrid = false;
			}),
			setIsSharedGrid: mockSetIsSharedGrid.mockImplementation((val: boolean) => {
				gridStoreState.isSharedGrid = val;
			}),
		};

		(useGridStore as unknown as Mock).mockImplementation((selector) =>
			typeof selector === "function" ? selector(gridStoreState) : gridStoreState
		);
		(useGridStore as unknown as { getState: Mock }).getState = vi.fn(() => gridStoreState);

		(usePlatformStore as unknown as Mock).mockImplementation(
			(selector: (state: PlatformState) => unknown) => {
				const state = {
					initializePlatform: vi.fn(),
					selectedPlatform: "test-platform",
					setSelectedPlatform: mockSetSelectedPlatform,
				};

				return typeof selector === "function" ? selector(state) : state;
			}
		);
		(usePlatformStore as unknown as { getState: Mock }).getState = vi.fn().mockReturnValue({
			initializePlatform: vi.fn(),
			selectedPlatform: "test-platform",
			setSelectedPlatform: mockSetSelectedPlatform,
		});

		(useGridDeserializer as unknown as Mock).mockReturnValue({
			deserializeGrid: mockDeserializeGrid.mockImplementation(async () => {
				gridStoreState.isSharedGrid = true;
			}),
			serializeGrid: mockSerializeGrid,
		});
		(useFetchShipTypesSuspense as unknown as Mock).mockReturnValue({
			"test-platform": { label: "Test Platform", type: "Starship" },
		});
	});

	/**
	 * Verifies that the URL is correctly updated for sharing a grid.
	 */
	it("should update URL for sharing", () => {
		mockSerializeGrid.mockReturnValue("serialized-grid");
		const { result } = renderHook(() => useUrlSync());
		const sharedUrl = result.current.updateUrlForShare();
		const url = new URL(sharedUrl);
		expect(url.searchParams.get("grid")).toBe("serialized-grid");
		expect(url.searchParams.get("platform")).toBe("test-platform");
	});

	/**
	 * Verifies that the URL is updated with push (replace: false) when resetting a shared grid.
	 */
	it("should push history entry when resetting a shared grid (grid param in URL)", () => {
		window.history.pushState({}, "", "/?grid=some-grid&platform=test-platform");
		const { result } = renderHook(() => useUrlSync());
		result.current.updateUrlForReset();
		expect(mockNavigate).toHaveBeenCalledWith("/?platform=test-platform", { replace: false });
	});

	/**
	 * Verifies that the URL is updated with replace: true when resetting without a grid param in URL.
	 */
	it("should replace history entry when resetting a layout without a grid param in URL", () => {
		window.history.pushState({}, "", "/?platform=test-platform");
		const { result } = renderHook(() => useUrlSync());
		result.current.updateUrlForReset();
		expect(mockNavigate).toHaveBeenCalledWith("/?platform=test-platform", { replace: true });
	});

	/**
	 * Tests that the grid is deserialized from the URL on initial load.
	 */
	it("should deserialize grid from URL on initial load", () => {
		window.history.pushState({}, "", "/?grid=serialized-grid&platform=test-platform");
		renderHook(() => useUrlSync());
		expect(mockDeserializeGrid).toHaveBeenCalledWith("serialized-grid");
	});

	/**
	 * Tests that the platform is set from the URL on initial load.
	 */
	it("should set platform from URL on initial load", () => {
		window.history.pushState({}, "", "/?grid=serialized-grid&platform=new-platform");
		(useFetchShipTypesSuspense as unknown as Mock).mockReturnValue({
			"new-platform": { label: "New Platform", type: "Starship" },
		});
		renderHook(() => useUrlSync());
		expect(mockSetSelectedPlatform).toHaveBeenCalledWith(
			"new-platform",
			["new-platform"],
			false,
			true
		);
	});

	/**
	 * Tests that the hook correctly handles popstate events (browser history navigation).
	 */
	it("should handle popstate events", () => {
		// Mock ship types to include both test-platform and new-platform
		(useFetchShipTypesSuspense as unknown as Mock).mockReturnValue({
			"new-platform": { label: "New Platform", type: "Starship" },
			"test-platform": { label: "Test Platform", type: "Starship" },
		});

		renderHook(() => useUrlSync());

		act(() => {
			window.history.pushState({}, "", "/?grid=new-serialized-grid&platform=new-platform");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		expect(mockDeserializeGrid).toHaveBeenCalledWith("new-serialized-grid");
		expect(mockSetSelectedPlatform).toHaveBeenCalledWith(
			"new-platform",
			["new-platform", "test-platform"],
			false,
			true
		);
	});

	/**
	 * Tests full navigation restoration:
	 * Resetting a shared grid pushes a new entry, pressing Back restores the shared grid,
	 * and pressing Forward triggers session reset back to the empty workspace.
	 */
	it("should restore shared grid on Back navigation after reset, and reset on Forward navigation", async () => {
		// 1. Initial load with a shared grid
		window.history.pushState({}, "", "/?grid=shared-grid-1&platform=test-platform");
		const { result } = renderHook(() => useUrlSync());

		expect(mockDeserializeGrid).toHaveBeenCalledWith("shared-grid-1");
		expect(gridStoreState.isSharedGrid).toBe(true);

		// 2. User resets the grid
		result.current.updateUrlForReset();
		expect(mockNavigate).toHaveBeenCalledWith("/?platform=test-platform", { replace: false });

		// Simulate URL and store change after reset
		window.history.pushState({}, "", "/?platform=test-platform");
		gridStoreState.isSharedGrid = false;

		// 3. User navigates Back to the shared grid
		act(() => {
			window.history.pushState({}, "", "/?grid=shared-grid-1&platform=test-platform");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		expect(mockDeserializeGrid).toHaveBeenCalledWith("shared-grid-1");
		expect(gridStoreState.isSharedGrid).toBe(true);

		// 4. User navigates Forward to the reset grid (no grid param in URL)
		act(() => {
			window.history.pushState({}, "", "/?platform=test-platform");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		// sessionCoordinator.resetSession() should have been called, resetting the grid
		expect(mockResetGrid).toHaveBeenCalled();
		expect(mockClearInteractionState).toHaveBeenCalled();
		expect(gridStoreState.isSharedGrid).toBe(false);
	});
});
