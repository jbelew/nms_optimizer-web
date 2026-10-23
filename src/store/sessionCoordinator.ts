import type { RecommendedBuild, TechTree, TechTreeItem } from "@/types/tech";
import type { SaveBuildParams } from "@/utils/build/buildSerializer";
import type { BuildFile } from "@/utils/validation/dataValidation";
import { deserialize, serialize } from "@/hooks/useGridDeserializer/gridSerializer";
import { sendEvent } from "@/utils/analytics/tracking";
import { Logger } from "@/utils/system/monitoring";
import { getTechTreeMaps } from "@/utils/tech/techTreeUtils";
import { isValidRecommendedBuild } from "@/utils/validation/dataValidation";

import type { ApiResponse, Grid } from "./grid/gridStore";
import type { BonusStatusData } from "./tech/techStore";
import { usePlatformStore } from "./app/platformStore";
import { assignModuleToCell } from "./grid/gridFactories";
import { createEmptyCell, createGrid, resetCellContent, useGridStore } from "./grid/gridStore";
import { useTechStore } from "./tech/techStore";
import { useUiStore } from "./ui/uiStore";

/**
 * Orchestrates the calculation of bonus status data based on max bonus.
 *
 * @remarks
 * Delegates Solve Quality classification to {@link resolveSolveQuality} and computes
 * the rounded percentage delta from `100%`.
 *
 * @param maxBonus - The maximum bonus value to evaluate.
 *
 * @returns The calculated icon and percentage.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const status = computeBonusStatus(105);
 * // returns { icon: "lightning", percent: 5 }
 * ```
 */
export function computeBonusStatus(maxBonus: number): BonusStatusData {
	const roundedMaxBonus = Math.round(maxBonus * 100) / 100;
	const quality = resolveSolveQuality(roundedMaxBonus);

	if (quality === "insufficient_space") {
		const percent = Math.round((100 - roundedMaxBonus) * 100) / 100;

		return { icon: "warning", percent };
	}

	if (quality === "standard") {
		return { icon: "check", percent: 0 };
	}

	const percent = Math.round((roundedMaxBonus - 100) * 100) / 100;

	return { icon: "lightning", percent };
}

/**
 * Resolves the canonical Solve Quality tier from a solve's maximum bonus score.
 *
 * @remarks
 * Rounds `maxBonus` to two decimal places before classifying into `"boosted"` (`> 100`),
 * `"insufficient_space"` (`< 100`), or `"standard"` (`100`).
 *
 * @param maxBonus - The maximum bonus percentage returned by the solver.
 *
 * @returns `"boosted"` (`> 100`), `"insufficient_space"` (`< 100`), or `"standard"` (`100`).
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const quality = resolveSolveQuality(105);
 * // returns "boosted"
 * ```
 */
export function resolveSolveQuality(
	maxBonus: number | undefined,
): "boosted" | "insufficient_space" | "standard" {
	const roundedMaxBonus = Math.round((maxBonus ?? 100) * 100) / 100;

	if (roundedMaxBonus > 100) return "boosted";
	if (roundedMaxBonus < 100) return "insufficient_space";

	return "standard";
}

/**
 * Helper to compute initial checked modules based on persistent selection and defaults.
 *
 * @param techGroups - The technology groups mapping.
 *
 * @returns The resolved checked modules.
 */
function computeInitialCheckedModules(techGroups: { [key: string]: TechTreeItem[] }) {
	const techStore = useTechStore.getState();

	return Object.keys(techGroups).reduce(
		(acc, tech) => {
			const group = techGroups[tech]?.[0];

			if (group) {
				const persistedSelection = techStore.getModuleSelection(tech);

				if (persistedSelection && persistedSelection.length > 0) {
					acc[tech] = persistedSelection;
				} else {
					acc[tech] = group.modules.filter((m) => m.checked).map((m) => m.id);
				}
			}

			return acc;
		},
		{} as { [key: string]: string[] },
	);
}

/**
 * Orchestrator for multi-store state transactions.
 *
 * @remarks
 * This module centralizes actions that affect multiple stores simultaneously,
 * such as Session Reset, Technology Reset, applying Recommended Builds, switching
 * Platform Type, Shared Grid URL serialization/deserialization, and capturing/restoring a Build File.
 *
 * @category State
 */
export const sessionCoordinator = {
	/**
	 * Validates and applies one of the Recommended Builds to the workspace grid.
	 *
	 * @remarks
	 * Maps module identifiers from `build.layout` against `techTree` metadata via
	 * `getTechTreeMaps`, populates a 10×6 grid layout, and updates `useGridStore` while
	 * preserving existing Module Selections and technology bonus statuses.
	 *
	 * @param build - The Recommended Build configuration to apply.
	 * @param techTree - The complete technology tree payload for module lookup.
	 *
	 * @returns `true` if the build was valid and applied to `useGridStore`, otherwise `false`.
	 *
	 * @see {@link isValidRecommendedBuild}
	 * @see {@link getTechTreeMaps}
	 * @see {@link useGridStore}
	 *
	 * @example
	 * ```ts
	 * const applied = sessionCoordinator.applyRecommendedBuild(build, techTree);
	 * // returns true and updates useGridStore.getState().grid
	 * ```
	 */
	applyRecommendedBuild(build: RecommendedBuild, techTree: TechTree): boolean {
		if (!isValidRecommendedBuild(build)) {
			Logger.error("Invalid RecommendedBuild object received:", undefined, { build });

			return false;
		}

		if (!build.layout || build.layout.length === 0) {
			return false;
		}

		const { modulesMap } = getTechTreeMaps(techTree);
		const newGrid = createGrid(10, 6);
		const layout = build.layout as (null | {
			active?: boolean;
			adjacency_bonus?: number;
			module?: null | string;
			supercharged?: boolean;
			tech?: null | string;
		})[][];

		for (let r = 0; r < layout.length; r++) {
			for (let c = 0; c < layout[r].length; c++) {
				const cellData = layout[r][c];

				if (cellData) {
					const cell = createEmptyCell(
						cellData.supercharged ?? false,
						cellData.active ?? true,
					);

					cell.tech = cellData.tech ?? null;
					cell.module = cellData.module ?? null;

					if (cellData.tech && cellData.module) {
						const module = modulesMap.get(`${cellData.tech}/${cellData.module}`);

						if (module) {
							assignModuleToCell(cell, module);
						} else {
							resetCellContent(cell);
						}
					}

					cell.adjacency_bonus = cellData.adjacency_bonus ?? 0.0;
					newGrid.cells[r][c] = cell;
				} else {
					newGrid.cells[r][c] = createEmptyCell();
				}
			}
		}

		useGridStore.getState().setGrid(newGrid);

		return true;
	},

	/**
	 * Commits the results of an optimization solve to the relevant stores.
	 *
	 * @remarks
	 * Updates the grid result blob, replaces the active grid layout when `data.grid`
	 * is present, and synchronizes Technology Category bonus scores and solve method metadata.
	 *
	 * @param data - The optimization result from the engine.
	 * @param tech - The unique Technology Category identifier (e.g., `'pulse'`).
	 *
	 * @returns Side-effects only.
	 *
	 * @see {@link computeBonusStatus}
	 * @see {@link useGridStore}
	 * @see {@link useTechStore}
	 *
	 * @example
	 * ```ts
	 * sessionCoordinator.commitOptimizationResult(result, "pulse");
	 * // updates gridStore result/layout and techStore bonus metadata for "pulse"
	 * ```
	 */
	commitOptimizationResult(data: ApiResponse, tech: string): void {
		const gridStore = useGridStore.getState();
		const techStore = useTechStore.getState();

		// 1. Update Grid Store with the result blob and solved layout
		gridStore.setResult(data);

		if (data?.grid) {
			gridStore.setGrid(data.grid);
		}

		// 2. Synchronize tech-specific stats in Tech Store
		if (data) {
			techStore.setTechMaxBonus(tech, data.maxBonus);
			techStore.setTechSolvedBonus(tech, data.solvedBonus);
			techStore.setTechSolveMethod(tech, data.solveMethod);

			// 3. Update Bonus Status Store
			const status = computeBonusStatus(data.maxBonus);
			techStore.setBonusStatus(tech, status);
		}
	},

	/**
	 * Deserializes a Shared Grid token for the active Platform Type and applies it to the grid store.
	 *
	 * @param serializedGrid - The encoded grid string from the `grid` query parameter.
	 *
	 * @returns Resolves when the Shared Grid is restored in the store.
	 *
	 * @see {@link deserialize}
	 * @see {@link useGridStore}
	 *
	 * @example
	 * ```ts
	 * await sessionCoordinator.deserializeSharedGrid(encodedGrid);
	 * // restores Shared Grid layout and marks isSharedGrid = true
	 * ```
	 */
	async deserializeSharedGrid(serializedGrid: string): Promise<void> {
		const targetPlatform = usePlatformStore.getState().selectedPlatform;
		const newGrid = await deserialize(
			serializedGrid,
			targetPlatform,
			useTechStore.getState().setTechColors,
		);

		if (newGrid) {
			const gridStore = useGridStore.getState();
			gridStore.setGrid(newGrid);
			gridStore.setIsSharedGrid(true);
			sendEvent({
				action: "load_build",
				category: "engagement",
				method: "shared_url",
				nonInteraction: true,
				platform: targetPlatform,
				value: 1,
			});
		} else {
			Logger.warn("Deserialization failed, grid not set.");
		}
	},

	/**
	 * Extracts a complete multi-store snapshot of the active build for Build File serialization.
	 *
	 * @param buildName - The display name to assign to the saved build.
	 *
	 * @returns The multi-store build state snapshot ready for `buildSerializer.saveBuild`.
	 *
	 * @see {@link useGridStore}
	 * @see {@link useTechStore}
	 * @see {@link usePlatformStore}
	 *
	 * @example
	 * ```ts
	 * const snapshot = sessionCoordinator.getBuildSnapshot("My Build");
	 * // returns { buildName: "My Build", gridState: {...}, shipType: "standard", techState: {...} }
	 * ```
	 */
	getBuildSnapshot(buildName: string): SaveBuildParams {
		const gridStoreState = useGridStore.getState();
		const techStoreState = useTechStore.getState();
		const platformStoreState = usePlatformStore.getState();

		return {
			buildName,
			gridState: {
				grid: gridStoreState.grid,
				gridFixed: gridStoreState.gridFixed,
				initialGridDefinition: gridStoreState.initialGridDefinition,
				isSharedGrid: gridStoreState.isSharedGrid,
				result: gridStoreState.result,
				superchargedFixed: gridStoreState.superchargedFixed,
			},
			shipType: platformStoreState.selectedPlatform,
			techState: {
				bonusStatus: techStoreState.bonusStatus,
				checkedModules: techStoreState.checkedModules,
				maxBonus: techStoreState.maxBonus,
				solvedBonus: techStoreState.solvedBonus,
				solveMethod: techStoreState.solveMethod,
			},
		};
	},

	/**
	 * Generates a shareable URL containing the active Platform Type and serialized Shared Grid state.
	 *
	 * @returns The full shareable URL string.
	 *
	 * @see {@link serialize}
	 *
	 * @example
	 * ```ts
	 * const url = sessionCoordinator.getShareUrl();
	 * // returns "https://nms-optimizer.app/?platform=standard&grid=v1..."
	 * ```
	 */
	getShareUrl(): string {
		const { grid } = useGridStore.getState();
		const { selectedPlatform } = usePlatformStore.getState();
		const serializedGrid = serialize(grid);

		try {
			const url = new URL(window.location.href);
			url.searchParams.set("grid", serializedGrid);
			url.searchParams.set("platform", selectedPlatform);

			return url.toString();
		} catch (error) {
			Logger.warn("sessionCoordinator: Failed to create share URL", { error });

			return `/?platform=${selectedPlatform}&grid=${encodeURIComponent(serializedGrid)}`;
		}
	},

	/**
	 * Initializes the technology tree metadata across relevant stores.
	 *
	 * Synchronizes initial module selections with persistent user preferences.
	 *
	 * @param colors - Tech-to-color mapping.
	 * @param techGroups - Tech-to-groups mapping.
	 * @param activeGroups - Tech-to-active-group-ID mapping.
	 *
	 * @returns Side-effects only.
	 */
	initializeTechTree(
		colors: { [key: string]: string },
		techGroups: { [key: string]: TechTreeItem[] },
		activeGroups: { [key: string]: string },
	) {
		const techStore = useTechStore.getState();
		const initialCheckedModules = computeInitialCheckedModules(techGroups);

		techStore.initializeTechTree(colors, techGroups, activeGroups, initialCheckedModules);
	},

	/**
	 * Resets the entire application state to its default values (Session Reset).
	 *
	 * Orchestrates the reset of grid, tech, modules, and interaction stores,
	 * ensuring all persisted state is also cleared.
	 *
	 * @returns Side-effects only.
	 */
	resetSession() {
		const gridStore = useGridStore.getState();
		const techStore = useTechStore.getState();

		// 1. Reset Grid and its Interaction State atomically in a single batch
		gridStore.resetGrid();

		// 2. Reset Tech, Selections, and computed statuses atomically in a single batch
		techStore.resetSession();

		// 3. Reset UI session violation counters
		useUiStore.getState().resetSession();
	},

	/**
	 * Performs a Technology Reset for a single Technology Category.
	 *
	 * @remarks
	 * Clears all placed modules for `tech` from `useGridStore` and resets its
	 * `maxBonus`, `solvedBonus`, `bonusStatus`, and `solveMethod` in `useTechStore`
	 * while preserving its Module Selection and the rest of the grid layout.
	 *
	 * @param tech - The Technology Category identifier to reset.
	 *
	 * @returns Side-effects only.
	 *
	 * @example
	 * ```ts
	 * sessionCoordinator.resetTechnology("pulse");
	 * // clears pulse cells from grid and resets pulse bonus scores
	 * ```
	 */
	resetTechnology(tech: string): void {
		const gridStore = useGridStore.getState();
		const techStore = useTechStore.getState();

		gridStore.resetGridTech?.(tech);
		techStore.clearTechMaxBonus?.(tech);
		techStore.clearTechSolvedBonus?.(tech);
		techStore.clearBonusStatus?.(tech);
		techStore.clearTechSolveMethod?.(tech);
	},

	/**
	 * Restores a validated Build File snapshot across the platform, grid, and tech stores.
	 *
	 * @param buildData - The parsed and checksum-verified Build File payload.
	 * @param validPlatformTypes - Supported Platform Type identifiers.
	 *
	 * @returns Side-effects only.
	 *
	 * @see {@link useGridStore}
	 * @see {@link useTechStore}
	 * @see {@link usePlatformStore}
	 *
	 * @example
	 * ```ts
	 * sessionCoordinator.restoreBuildSnapshot(buildData);
	 * // updates platformStore, gridStore, and techStore from buildData
	 * ```
	 */
	restoreBuildSnapshot(buildData: BuildFile): void {
		const platformState = usePlatformStore.getState();

		if (buildData.shipType !== platformState.selectedPlatform) {
			platformState.setSelectedPlatform(buildData.shipType);
		}

		useGridStore.getState().restoreGridState({
			...buildData.gridState,
			buildName: buildData.name,
		});

		useTechStore.getState().restoreTechState({
			bonusState: buildData.bonusState,
			moduleState: buildData.moduleState,
			techState: buildData.techState,
		});
	},

	/**
	 * Updates the available technology groups.
	 *
	 * Re-initializes checked modules based on the new groups and existing module selections.
	 *
	 * @param techGroups - The new technology groups mapping.
	 *
	 * @returns Side-effects only.
	 */
	setTechGroups(techGroups: { [key: string]: TechTreeItem[] }) {
		const techStore = useTechStore.getState();
		const initialCheckedModules = computeInitialCheckedModules(techGroups);

		techStore.setTechGroups(techGroups, initialCheckedModules);
	},

	/**
	 * Switches the active Platform Type and resets dependent grid, technology, and UI session state.
	 *
	 * @param platform - The target Platform Type identifier.
	 * @param [newGrid=createGrid(10, 6)] - The initial Default Grid Layout for the platform.
	 *
	 * @returns Side-effects only.
	 *
	 * @example
	 * ```ts
	 * sessionCoordinator.switchPlatform("corvette");
	 * // updates platformStore, resets grid to Default Grid Layout, and clears tech/UI session state
	 * ```
	 */
	switchPlatform(platform: string, newGrid: Grid = createGrid(10, 6)): void {
		const platformStore = usePlatformStore.getState();
		const gridStore = useGridStore.getState();
		const techStore = useTechStore.getState();

		// 1. Validate and update Platform Type
		platformStore.setSelectedPlatform(platform);

		// 2. Update Grid and reset its metadata
		gridStore.setGrid(newGrid);
		gridStore.setResult(null);
		gridStore.setIsSharedGrid(false);
		gridStore.setBuildName(null);

		// 3. Clear results and groups
		techStore.clearResult();
		techStore.clearTechGroups();
		techStore.clearAllBonusStatus();
		techStore.clearAllModuleSelections();

		// 4. Reset UI session violation counters
		useUiStore.getState().resetSession();
	},

	/**
	 * Synchronizes application state with values retrieved from the browser URL.
	 *
	 * @remarks
	 * Handles conditional Platform Type switches and Shared Grid deserialization.
	 * When navigating via browser history (`popstate`) from a state that held a
	 * Shared Grid to a URL without a `grid` parameter, triggers a full Session Reset
	 * to return the workspace to the Default Grid Layout.
	 *
	 * @param params - The search parameter values.
	 * @param params.platformFromUrl - The `platform` query parameter.
	 * @param params.gridFromUrl - The `grid` layout query parameter.
	 *
	 * @returns Resolves when URL synchronization completes.
	 *
	 * @example
	 * ```ts
	 * await sessionCoordinator.syncStateFromUrl({
	 *   gridFromUrl: null,
	 *   platformFromUrl: "solar",
	 * });
	 * // updates selectedPlatform to "solar" and resets grid/tech session state
	 * ```
	 */
	syncStateFromUrl(params: {
		gridFromUrl: null | string;
		platformFromUrl: null | string;
	}): Promise<void> | void {
		const { gridFromUrl, platformFromUrl } = params;
		const platformStore = usePlatformStore.getState();
		const currentPlatform = platformStore.selectedPlatform;
		const wasSharedGrid = useGridStore.getState().isSharedGrid;

		// Sync platform first to avoid grid deserialization conflicts
		if (platformFromUrl && platformFromUrl !== currentPlatform) {
			if (platformStore.isValidPlatform(platformFromUrl)) {
				if (gridFromUrl) {
					platformStore.setSelectedPlatform(platformFromUrl);
				} else {
					sessionCoordinator.switchPlatform(platformFromUrl);
				}
			} else {
				Logger.warn(`sessionCoordinator: Invalid platform from URL: ${platformFromUrl}.`);
			}
		}

		if (gridFromUrl) {
			return sessionCoordinator.deserializeSharedGrid(gridFromUrl);
		} else {
			const { isSharedGrid: currentIsSharedGrid } = useGridStore.getState();

			if (currentIsSharedGrid || wasSharedGrid) {
				sessionCoordinator.resetSession();
			}
		}
	},
};
