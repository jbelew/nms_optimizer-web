import { act } from "react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGridStore } from "../store/GridStore";
import { usePlatformStore } from "../store/PlatformStore";
import { useGridDeserializer } from "./useGridDeserializer";
import { useFetchShipTypesSuspense } from "./useShipTypes";
import { useUrlSync } from "./useUrlSync";

vi.mock("../store/GridStore");
vi.mock("../store/PlatformStore");
vi.mock("./useGridDeserializer");
vi.mock("./useShipTypes");
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const original = await vi.importActual("react-router-dom");
	return {
		...original,
		useNavigate: () => mockNavigate,
	};
});

describe("useUrlSync", () => {
	const mockSetIsSharedGrid = vi.fn();
	const mockSetSelectedPlatform = vi.fn();
	const mockSerializeGrid = vi.fn();
	const mockDeserializeGrid = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		window.history.pushState({}, "", "/");

		(useGridStore as unknown as vi.Mock).mockReturnValue({
			isSharedGrid: false,
			setIsSharedGrid: mockSetIsSharedGrid,
		});
		(usePlatformStore as unknown as vi.Mock).mockImplementation((selector) => {
			const state = {
				selectedPlatform: "test-platform",
				setSelectedPlatform: mockSetSelectedPlatform,
			};
			return selector(state);
		});
		(useGridDeserializer as unknown as vi.Mock).mockReturnValue({
			serializeGrid: mockSerializeGrid,
			deserializeGrid: mockDeserializeGrid,
		});
		(useFetchShipTypesSuspense as unknown as vi.Mock).mockReturnValue({
			"test-platform": { label: "Test Platform", type: "Starship" },
		});
	});

	it("should update URL for sharing", () => {
		mockSerializeGrid.mockReturnValue("serialized-grid");
		const { result } = renderHook(() => useUrlSync(), { wrapper: MemoryRouter });
		const sharedUrl = result.current.updateUrlForShare();
		const url = new URL(sharedUrl);
		expect(url.searchParams.get("grid")).toBe("serialized-grid");
		expect(url.searchParams.get("platform")).toBe("test-platform");
	});

	it("should update URL for reset", () => {
		window.history.pushState({}, "", "/?grid=some-grid&platform=test-platform");
		const { result } = renderHook(() => useUrlSync(), { wrapper: MemoryRouter });
		result.current.updateUrlForReset();
		expect(mockNavigate).toHaveBeenCalledWith("/?platform=test-platform", { replace: true });
	});

	it("should deserialize grid from URL on initial load", () => {
		window.history.pushState({}, "", "/?grid=serialized-grid&platform=test-platform");
		renderHook(() => useUrlSync(), { wrapper: MemoryRouter });
		expect(mockDeserializeGrid).toHaveBeenCalledWith("serialized-grid");
	});

	it("should set platform from URL on initial load", () => {
		window.history.pushState({}, "", "/?grid=serialized-grid&platform=new-platform");
		(useFetchShipTypesSuspense as unknown as vi.Mock).mockReturnValue({
			"new-platform": { label: "New Platform", type: "Starship" },
		});
		renderHook(() => useUrlSync(), { wrapper: MemoryRouter });
		expect(mockSetSelectedPlatform).toHaveBeenCalledWith(
			"new-platform",
			["new-platform"],
			false
		);
	});

	it("should handle popstate events", () => {
		renderHook(() => useUrlSync(), { wrapper: MemoryRouter });

		act(() => {
			window.history.pushState({}, "", "/?grid=new-serialized-grid&platform=new-platform");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		expect(mockDeserializeGrid).toHaveBeenCalledWith("new-serialized-grid");
		expect(mockSetSelectedPlatform).toHaveBeenCalledWith(
			"new-platform",
			["test-platform"],
			false
		);
	});
});
