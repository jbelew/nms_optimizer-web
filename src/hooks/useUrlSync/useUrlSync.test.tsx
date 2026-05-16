import type { PlatformState } from "@/store/app/platformStore";
import type { Mock } from "vitest";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGridDeserializer } from "@/hooks/useGridDeserializer/useGridDeserializer";
import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";

import { useUrlSync } from "./useUrlSync";

vi.mock("../../store/grid/gridStore");
vi.mock("../../store/app/platformStore");
vi.mock("../useGridDeserializer/useGridDeserializer");
vi.mock("../useShipTypes/useShipTypes");
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const original = await vi.importActual("react-router-dom");

	return {
		...original,
		useNavigate: () => mockNavigate,
	};
});
vi.mock("../../context/RouteContext", () => ({
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

	/**
	 * Sets up mocks and initializes test environment before each test.
	 */
	beforeEach(() => {
		vi.clearAllMocks();
		window.history.pushState({}, "", "/");

		(useGridStore as unknown as Mock).mockReturnValue({
			isSharedGrid: false,
			setIsSharedGrid: mockSetIsSharedGrid,
		});
		(useGridStore as unknown as { getState: Mock }).getState = vi.fn().mockReturnValue({
			isSharedGrid: false,
			setIsSharedGrid: mockSetIsSharedGrid,
		});

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
			deserializeGrid: mockDeserializeGrid,
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
		const { result } = renderHook(() => useUrlSync(), { wrapper: MemoryRouter });
		const sharedUrl = result.current.updateUrlForShare();
		const url = new URL(sharedUrl);
		expect(url.searchParams.get("grid")).toBe("serialized-grid");
		expect(url.searchParams.get("platform")).toBe("test-platform");
	});

	/**
	 * Verifies that the URL is correctly updated for resetting the grid.
	 */
	it("should update URL for reset", () => {
		window.history.pushState({}, "", "/?grid=some-grid&platform=test-platform");
		const { result } = renderHook(() => useUrlSync(), { wrapper: MemoryRouter });
		result.current.updateUrlForReset();
		expect(mockNavigate).toHaveBeenCalledWith("/?platform=test-platform", { replace: true });
	});

	/**
	 * Tests that the grid is deserialized from the URL on initial load.
	 */
	it("should deserialize grid from URL on initial load", () => {
		window.history.pushState({}, "", "/?grid=serialized-grid&platform=test-platform");
		renderHook(() => useUrlSync(), { wrapper: MemoryRouter });
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
		renderHook(() => useUrlSync(), { wrapper: MemoryRouter });
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

		renderHook(() => useUrlSync(), { wrapper: MemoryRouter });

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
});
