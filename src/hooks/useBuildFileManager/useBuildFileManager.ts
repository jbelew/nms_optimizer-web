import { startTransition, useState } from "react";

import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { buildSerializer } from "@/utils/build/buildSerializer";
import { Logger } from "@/utils/system/monitoring";

/**
 * Custom hook for managing build file operations (save/load) in the DOM.
 *
 * @remarks
 * This hook acts as a thin DOM adapter. It delegates build serialization,
 * validation, and state parsing to the {@link buildSerializer} utility,
 * while handling DOM-specific tasks (e.g., download triggers), reactive
 * pending state (`isPending`), and React/Zustand store updates.
 *
 * @returns {object} An object containing the load/save functions and the pending state.
 * @returns {Function} returns.saveBuildToFile - Serializes and downloads the current build.
 * @returns {Function} returns.loadBuildFromFile - Parses and restores a build from a file.
 * @returns {boolean} returns.isPending - Reactive pending/loading state for file operations.
 *
 * @see {@link ./useBuildFileManager.test.ts Unit Tests}
 * @see {@link buildSerializer}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { saveBuildToFile, loadBuildFromFile, isPending } = useBuildFileManager();
 * ```
 */
export const useBuildFileManager = () => {
	const shipTypes = useFetchShipTypesSuspense();
	const [isPending, setIsPending] = useState(false);

	/**
	 * Serializes the current application state and triggers a file download in the DOM.
	 *
	 * @remarks
	 * This method retrieves state from the grid, tech, and platform stores,
	 * delegates serialization to {@link buildSerializer.saveBuild}, and then
	 * triggers a browser download of the returned binary blob as a `.nms` file.
	 *
	 * @param {string} buildName - The name to assign to the saved build.
	 *
	 * @returns {Promise<void>} Resolves when the file download has been triggered.
	 *
	 * @throws {Error} If serialization or file creation fails.
	 *
	 * @example
	 * ```typescript
	 * await saveBuildToFile("My Fighter Build");
	 * // triggers browser download
	 * ```
	 */
	const saveBuildToFile = async (buildName: string): Promise<void> => {
		setIsPending(true);

		try {
			const gridStoreState = useGridStore.getState();
			const techStoreState = useTechStore.getState();
			const platformStoreState = usePlatformStore.getState();

			const { blob, filename } = await buildSerializer.saveBuild({
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
			});

			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			Logger.error("Failed to save build file:", error);
			throw new Error("Failed to save build file", { cause: error });
		} finally {
			setIsPending(false);
		}
	};

	/**
	 * Restores a build configuration from an uploaded file.
	 *
	 * @remarks
	 * This method performs DOM File validation (extension and size checks), reads
	 * the file contents as text, and delegates parsing/integrity validation to
	 * {@link buildSerializer.loadBuild} within a React transition to manage
	 * pending state and store updates.
	 *
	 * @param {File} file - The `.nms` file to load.
	 *
	 * @returns {Promise<void>} Resolves when state is successfully restored.
	 *
	 * @throws {Error} If validation fails, file is empty, checksum is invalid, or ship type is unsupported.
	 *
	 * @example
	 * ```typescript
	 * const file = event.target.files[0];
	 * await loadBuildFromFile(file);
	 * ```
	 */
	const loadBuildFromFile = async (file: File): Promise<void> => {
		setIsPending(true);

		try {
			if (!file.name.endsWith(".nms")) {
				throw new Error("Invalid file type. Please select a .nms build file.");
			}

			if (file.size > 10 * 1024 * 1024) {
				throw new Error("File is too large. Build files should be under 10MB.");
			}

			const validShipTypes = Object.keys(shipTypes);
			const text = await file.text();

			if (!text) {
				throw new Error("File is empty. Please select a valid build file.");
			}

			const buildData = await buildSerializer.loadBuild(text, validShipTypes);

			startTransition(() => {
				const platformState = usePlatformStore.getState();

				if (buildData.shipType !== platformState.selectedPlatform) {
					platformState.setSelectedPlatform(
						buildData.shipType,
						validShipTypes,
						true,
						true
					);
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
			});
		} catch (error) {
			Logger.error("Failed to load build file:", error);
			throw error;
		} finally {
			setIsPending(false);
		}
	};

	return { isPending, loadBuildFromFile, saveBuildToFile };
};
