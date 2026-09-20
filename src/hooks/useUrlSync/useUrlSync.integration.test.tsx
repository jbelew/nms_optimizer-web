import type { TechTree } from "@/hooks/useTechTree/useTechTree";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { serialize } from "@/hooks/useGridDeserializer/gridSerializer";
import { useUrlSync } from "@/hooks/useUrlSync/useUrlSync";
import { usePlatformStore } from "@/store/app/platformStore";
import { createGrid, useGridStore } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { useTechStore } from "@/store/tech/techStore";
import { useUiStore } from "@/store/ui/uiStore";

// Mock external network calls
const mockTechTreeData: TechTree = {
	pulse: [
		{
			color: "red",
			image: null,
			key: "pulse",
			label: "Pulse Engine",
			module_count: 1,
			modules: [
				{
					active: true,
					adjacency: "none",
					adjacency_bonus: 0,
					bonus: 0,
					id: "SL",
					image: "sl.webp",
					label: "Sub-light Amplifier",
					sc_eligible: false,
					supercharged: false,
					tech: "pulse",
					type: "module",
					value: 0,
				},
			],
		},
	],
	shield: [
		{
			color: "blue",
			image: null,
			key: "shield",
			label: "Deflector Shield",
			module_count: 1,
			modules: [
				{
					active: true,
					adjacency: "none",
					adjacency_bonus: 0,
					bonus: 0,
					id: "AA",
					image: "aa.webp",
					label: "Auto-Attacker",
					sc_eligible: false,
					supercharged: false,
					tech: "shield",
					type: "module",
					value: 0,
				},
			],
		},
	],
};

vi.mock("@/hooks/useTechTree/useTechTree", async () => {
	const actual = await vi.importActual("@/hooks/useTechTree/useTechTree");

	return {
		...actual,
		fetchTechTreeAsync: vi.fn(async () => mockTechTreeData),
	};
});

vi.mock("@/hooks/useShipTypes/useShipTypes", () => ({
	useFetchShipTypesSuspense: () => ({
		fighter: { label: "Fighter", type: "Starship" },
		standard: { label: "Standard", type: "Starship" },
	}),
}));

const mockNavigate = vi.fn((to: string, options?: { replace?: boolean }) => {
	const url = new URL(to, window.location.href);

	if (options?.replace) {
		window.history.replaceState({}, "", url.toString());
	} else {
		window.history.pushState({}, "", url.toString());
	}
});

vi.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
}));

vi.mock("@/context/RouteContext", () => ({
	useRouteContext: () => ({ isKnownRoute: true }),
}));

/**
 * Creates a serialized grid string containing a single active module.
 *
 * @param {string} tech - The technology category identifier.
 * @param {string} module - The module identifier.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 *
 * @returns {string} The serialized grid token.
 */
function createSerializedGrid(tech: string, module: string, row: number, col: number): string {
	const testGrid = createGrid(10, 6);
	testGrid.cells[row][col].active = true;
	testGrid.cells[row][col].tech = tech;
	testGrid.cells[row][col].module = module;

	return serialize(testGrid);
}

/**
 * Integration test suite for `useUrlSync` verifying history navigation restoration and reset.
 */
describe("useUrlSync Integration", () => {
	let serializedShieldGrid: string;
	let serializedPulseGrid: string;

	beforeEach(() => {
		vi.clearAllMocks();

		// Clean state across all stores
		usePlatformStore.setState({ selectedPlatform: "standard" });
		useGridStore.setState({
			buildName: null,
			grid: createGrid(10, 6),
			gridFixed: false,
			isSharedGrid: false,
			result: null,
			superchargedFixed: false,
		});
		useTechStore.setState({
			activeGroups: {},
			bonusStatus: {},
			checkedModules: {},
			maxBonus: {},
			solvedBonus: {},
			solveMethod: {},
			techColors: {},
			techGroups: {},
		});
		useUiStore.getState().resetSession();

		serializedShieldGrid = createSerializedGrid("shield", "AA", 0, 0);
		serializedPulseGrid = createSerializedGrid("pulse", "SL", 1, 1);

		window.history.pushState({}, "", "/?platform=standard");
	});

	/**
	 * Verifies that forward navigation to a gridless URL triggers a Session Reset,
	 * clearing grid cells, module selections, and bonus statuses.
	 */
	it("should clear grid cells, module selections, and bonus statuses on forward navigation to a gridless URL", async () => {
		// 1. User loads a shared grid
		window.history.pushState(
			{},
			"",
			`/?platform=standard&grid=${encodeURIComponent(serializedShieldGrid)}`
		);
		let hookResult: { current: ReturnType<typeof useUrlSync> };
		await act(async () => {
			const rendered = renderHook(() => useUrlSync());
			hookResult = rendered.result;
		});

		// Wait for initial mount deserialization
		await vi.waitFor(() => {
			expect(useGridStore.getState().isSharedGrid).toBe(true);
			expect(useGridStore.getState().grid.cells[0][0].tech).toBe("shield");
			expect(useGridStore.getState().grid.cells[0][0].module).toBe("AA");
		});

		// Simulate solver result and bonus status on the shared grid
		sessionCoordinator.commitOptimizationResult(
			{
				grid: null,
				maxBonus: 120,
				solvedBonus: 120,
				solveMethod: "optimal",
			},
			"shield"
		);
		expect(useTechStore.getState().bonusStatus.shield).toBeDefined();

		// 2. User clicks "Reset Grid" (initiating Session Reset and updating URL)
		act(() => {
			sessionCoordinator.resetSession();
			hookResult.current.updateUrlForReset();
		});

		expect(mockNavigate).toHaveBeenCalledWith("/?platform=standard", { replace: false });
		expect(useGridStore.getState().isSharedGrid).toBe(false);
		expect(useGridStore.getState().grid.cells[0][0].tech).toBeNull();
		expect(useTechStore.getState().bonusStatus.shield).toBeUndefined();

		// 3. User presses browser Back button to return to the shared grid
		await act(async () => {
			window.history.pushState(
				{},
				"",
				`/?platform=standard&grid=${encodeURIComponent(serializedShieldGrid)}`
			);
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		await vi.waitFor(() => {
			expect(useGridStore.getState().isSharedGrid).toBe(true);
			expect(useGridStore.getState().grid.cells[0][0].tech).toBe("shield");
			expect(useGridStore.getState().grid.cells[0][0].module).toBe("AA");
		});

		// 4. User presses browser Forward button to return to the reset URL (no grid parameter)
		await act(async () => {
			window.history.pushState({}, "", "/?platform=standard");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		// Verify Session Reset was executed:
		// - isSharedGrid is false
		// - Grid cells are cleared
		// - Module selections and bonus statuses are cleared
		// - Result is cleared
		await vi.waitFor(() => {
			const currentGridState = useGridStore.getState();
			const currentTechState = useTechStore.getState();

			expect(currentGridState.isSharedGrid).toBe(false);
			expect(currentGridState.grid.cells[0][0].tech).toBeNull();
			expect(currentGridState.grid.cells[0][0].module).toBeNull();
			expect(currentGridState.grid.cells[0][0].active).toBe(false);
			expect(currentGridState.hasModulesInGrid).toBe(false);
			expect(currentGridState.result).toBeNull();

			expect(currentTechState.bonusStatus).toEqual({});
			expect(currentTechState.maxBonus).toEqual({});
			expect(currentTechState.solvedBonus).toEqual({});
		});
	});

	/**
	 * Verifies that navigating forward and backward between multiple different shared grid URLs
	 * accurately restores each target layout.
	 */
	it("should deserialize and restore each target layout when navigating between multiple shared grid URLs", async () => {
		// 1. Mount on Grid 1 (Shield)
		window.history.pushState(
			{},
			"",
			`/?platform=standard&grid=${encodeURIComponent(serializedShieldGrid)}`
		);
		await act(async () => {
			renderHook(() => useUrlSync());
		});

		await vi.waitFor(() => {
			expect(useGridStore.getState().isSharedGrid).toBe(true);
			expect(useGridStore.getState().grid.cells[0][0].tech).toBe("shield");
		});

		// 2. Navigate forward to Grid 2 (Pulse)
		await act(async () => {
			window.history.pushState(
				{},
				"",
				`/?platform=standard&grid=${encodeURIComponent(serializedPulseGrid)}`
			);
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		await vi.waitFor(() => {
			const grid = useGridStore.getState().grid;
			expect(grid.cells[1][1].tech).toBe("pulse");
			expect(grid.cells[1][1].module).toBe("SL");
			expect(grid.cells[0][0].tech).toBeNull();
		});

		// 3. Navigate back to Grid 1 (Shield)
		await act(async () => {
			window.history.pushState(
				{},
				"",
				`/?platform=standard&grid=${encodeURIComponent(serializedShieldGrid)}`
			);
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		await vi.waitFor(() => {
			const grid = useGridStore.getState().grid;
			expect(grid.cells[0][0].tech).toBe("shield");
			expect(grid.cells[0][0].module).toBe("AA");
			expect(grid.cells[1][1].tech).toBeNull();
		});

		// 4. Navigate forward to Grid 2 (Pulse) again
		await act(async () => {
			window.history.pushState(
				{},
				"",
				`/?platform=standard&grid=${encodeURIComponent(serializedPulseGrid)}`
			);
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		await vi.waitFor(() => {
			const grid = useGridStore.getState().grid;
			expect(grid.cells[1][1].tech).toBe("pulse");
			expect(grid.cells[1][1].module).toBe("SL");
			expect(grid.cells[0][0].tech).toBeNull();
		});

		// 5. Navigate forward to a reset/gridless URL
		await act(async () => {
			window.history.pushState({}, "", "/?platform=standard");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		await vi.waitFor(() => {
			const currentGridState = useGridStore.getState();
			expect(currentGridState.isSharedGrid).toBe(false);
			expect(currentGridState.grid.cells[1][1].tech).toBeNull();
			expect(currentGridState.hasModulesInGrid).toBe(false);
		});
	});

	/**
	 * Verifies that post-reset edits made on a restored shared layout are wiped out
	 * when forward navigating to a gridless URL without blocking modal dialogs.
	 */
	it("should wipe out post-restoration edits when forward navigating to a gridless URL", async () => {
		// 1. Initial shared grid
		window.history.pushState(
			{},
			"",
			`/?platform=standard&grid=${encodeURIComponent(serializedShieldGrid)}`
		);
		await act(async () => {
			renderHook(() => useUrlSync());
		});

		await vi.waitFor(() => {
			expect(useGridStore.getState().isSharedGrid).toBe(true);
		});

		// 2. User makes manual edits on the restored layout (activates an extra cell)
		act(() => {
			useGridStore.getState().setCellActive(2, 2, true);
		});
		expect(useGridStore.getState().grid.cells[2][2].active).toBe(true);

		// 3. User navigates forward to a URL without grid parameter
		await act(async () => {
			window.history.pushState({}, "", "/?platform=standard");
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		// Workspace must be completely reset, discarding manual edits
		await vi.waitFor(() => {
			const currentGridState = useGridStore.getState();
			expect(currentGridState.isSharedGrid).toBe(false);
			expect(currentGridState.grid.cells[2][2].active).toBe(false);
			expect(currentGridState.grid.cells[0][0].tech).toBeNull();
		});
	});
});
