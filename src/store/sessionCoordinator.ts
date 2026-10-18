import type { ApiResponse, Grid } from "./grid/gridStore";
import type { BonusStatusData } from "./tech/techStore";
import type { RecommendedBuild, TechTree, TechTreeItem } from "@/types/tech";
import type { SaveBuildParams } from "@/utils/build/buildSerializer";
import type { BuildFile } from "@/utils/validation/dataValidation";

import { deserialize, serialize } from "@/hooks/useGridDeserializer/gridSerializer";
import { Logger } from "@/utils/system/monitoring";
import { getTechTreeMaps } from "@/utils/tech/techTreeUtils";
import { isValidRecommendedBuild } from "@/utils/validation/dataValidation";

import { usePlatformStore } from "./app/platformStore";
import { assignModuleToCell } from "./grid/gridFactories";
import { createEmptyCell, createGrid, resetCellContent, useGridStore } from "./grid/gridStore";
import { useTechStore } from "./tech/techStore";
import { useUiStore } from "./ui/uiStore";

/**
 * Orchestrates the calculation of bonus status data based on max bonus.
 *
 * @param {number} maxBonus - The maximum bonus value to evaluate.
 *
 * @returns {BonusStatusData} The calculated icon and percentage.
 *
 * @internal
 */
export function computeBonusStatus(maxBonus: number): BonusStatusData {
	const roundedMaxBonus = Math.round(maxBonus * 100) / 100;

	if (roundedMaxBonus < 100) {
		const percent = Math.round((100 - roundedMaxBonus) * 100) / 100;

		return { icon: "warning", percent };
	}

	if (roundedMaxBonus === 100) {
		return { icon: "check", percent: 0 };
	}

	const percent = Math.round((roundedMaxBonus - 100) * 100) / 100;

	return { icon: "lightning", percent };
}

/**
 * Helper to compute initial checked modules based on persistent selection and defaults.
 *
 * @param {Record<string, TechTreeItem[]>} techGroups - The technology groups mapping.
 *
 * @returns {Record<string, string[]>} The resolved checked modules.
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
		{} as { [key: string]: string[] }
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
	 * @param {RecommendedBuild} build - The Recommended Build configuration to apply.
	 * @param {TechTree} techTree - The complete technology tree payload for module lookup.
	 *
	 * @returns {boolean} `true` if the build was valid and applied to `useGridStore`, otherwise `false`.
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
						cellData.active ?? true
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
	 * Updates both the grid layout and the tech-specific bonus/method metadata.
	 *
	 * @param {ApiResponse} data - The optimization result from the engine.
	 * @param {string} tech - The unique technology identifier (e.g., 'pulse').
	 */
	commitOptimizationResult(data: ApiResponse, tech: string) {
		const gridStore = useGridStore.getState();
		const techStore = useTechStore.getState();

		// 1. Update Grid Store with the result blob
		gridStore.setResult(data);

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
	 * @param {string} serializedGrid - The encoded grid string from the `grid` query parameter.
	 *
	 * @returns {Promise<void>} Resolves when the Shared Grid is restored in the store.
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
			useTechStore.getState().setTechColors
		);

		if (newGrid) {
			const gridStore = useGridStore.getState();
			gridStore.setGrid(newGrid);
			gridStore.setIsSharedGrid(true);
		} else {
			Logger.error("Deserialization failed, grid not set.");
		}
	},

	/**
	 * Extracts a complete multi-store snapshot of the active build for Build File serialization.
	 *
	 * @param {string} buildName - The display name to assign to the saved build.
	 *
	 * @returns {SaveBuildParams} The multi-store build state snapshot ready for `buildSerializer.saveBuild`.
	 *
	 * @see {@link useGridStore}
	 * @see {@link useTechStore}
	 * @see {@link usePlatformStore}
	 *
	 * @example
	 * ```ts
	 * const snapshot = sessionCoordinator.getBuildSnapshot("My Build");
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
	 * @returns {string} The full shareable URL string.
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
	 * @param {Record<string, string>} colors - Tech-to-color mapping.
	 * @param {Record<string, TechTreeItem[]>} techGroups - Tech-to-groups mapping.
	 * @param {Record<string, string>} activeGroups - Tech-to-active-group-ID mapping.
	 */
	initializeTechTree(
		colors: { [key: string]: string },
		techGroups: { [key: string]: TechTreeItem[] },
		activeGroups: { [key: string]: string }
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
	 * @param {string} tech - The Technology Category identifier to reset.
	 *
	 * @returns {void} Side-effects only.
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
	 * @param {BuildFile} buildData - The parsed and checksum-verified Build File payload.
	 * @param {string[]} validShipTypes - Supported Platform Type identifiers.
	 *
	 * @returns {void} No return value.
	 *
	 * @see {@link useGridStore}
	 * @see {@link useTechStore}
	 * @see {@link usePlatformStore}
	 *
	 * @example
	 * ```ts
	 * sessionCoordinator.restoreBuildSnapshot(buildData, ["standard", "corvette"]);
	 * ```
	 */
	restoreBuildSnapshot(buildData: BuildFile, validShipTypes: string[]): void {
		const platformState = usePlatformStore.getState();

		if (buildData.shipType !== platformState.selectedPlatform) {
			platformState.setSelectedPlatform(buildData.shipType, validShipTypes);
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
	 * @param {Record<string, TechTreeItem[]>} techGroups - The new technology groups mapping.
	 */
	setTechGroups(techGroups: { [key: string]: TechTreeItem[] }) {
		const techStore = useTechStore.getState();
		const initialCheckedModules = computeInitialCheckedModules(techGroups);

		techStore.setTechGroups(techGroups, initialCheckedModules);
	},

	/**
	 * Switches the active Platform Type and resets dependent grid, technology, and UI session state.
	 *
	 * @param {string} platform - The target Platform Type identifier.
	 * @param {string[]} validPlatformTypes - Array of supported Platform Type identifiers.
	 * @param {Grid} [newGrid=createGrid(10, 6)] - The initial Default Grid Layout for the platform.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * sessionCoordinator.switchPlatform("corvette", ["standard", "corvette"]);
	 * // updates platformStore, resets grid to Default Grid Layout, and clears tech/UI session state
	 * ```
	 */
	switchPlatform(
		platform: string,
		validPlatformTypes: string[],
		newGrid: Grid = createGrid(10, 6)
	): void {
		const platformStore = usePlatformStore.getState();
		const gridStore = useGridStore.getState();
		const techStore = useTechStore.getState();

		// 1. Validate and update Platform Type
		platformStore.setSelectedPlatform(platform, validPlatformTypes);

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
	 * @param {object} params - The search parameter values and valid platforms.
	 * @param {string | null} params.platformFromUrl - The `platform` query parameter.
	 * @param {string | null} params.gridFromUrl - The `grid` layout query parameter.
	 * @param {string[]} params.validShipTypes - Array of supported Platform Type identifiers.
	 *
	 * @returns {Promise<void> | void} Resolves when URL synchronization completes.
	 *
	 * @example
	 * ```ts
	 * await sessionCoordinator.syncStateFromUrl({
	 *   gridFromUrl: null,
	 *   platformFromUrl: "solar",
	 *   validShipTypes: ["standard", "solar"],
	 * });
	 * // updates selectedPlatform to "solar" and resets grid/tech session state
	 * ```
	 */
	syncStateFromUrl(params: {
		gridFromUrl: null | string;
		platformFromUrl: null | string;
		validShipTypes: string[];
	}): Promise<void> | void {
		const { gridFromUrl, platformFromUrl, validShipTypes } = params;
		const platformStore = usePlatformStore.getState();
		const currentPlatform = platformStore.selectedPlatform;
		const wasSharedGrid = useGridStore.getState().isSharedGrid;

		// Sync platform first to avoid grid deserialization conflicts
		if (platformFromUrl && platformFromUrl !== currentPlatform) {
			if (validShipTypes.includes(platformFromUrl)) {
				if (gridFromUrl) {
					platformStore.setSelectedPlatform(platformFromUrl, validShipTypes);
				} else {
					sessionCoordinator.switchPlatform(platformFromUrl, validShipTypes);
				}
			} else {
				Logger.warn(
					`sessionCoordinator: Invalid platform from URL: ${platformFromUrl}. Expected one of: ${validShipTypes.join(", ")}`
				);
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
