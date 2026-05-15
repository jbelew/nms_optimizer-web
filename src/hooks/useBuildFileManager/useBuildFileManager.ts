import type { BuildFile } from "../../utils/validation/dataValidation";

import { usePlatformStore } from "../../store/app/platformStore";
import { useGridStore } from "../../store/grid/gridStore";
import { useModuleSelectionStore } from "../../store/tech/moduleSelectionStore";
import { useTechBonusStore } from "../../store/tech/techBonusStore";
import { useTechStore } from "../../store/tech/techStore";
import { computeSHA256 } from "../../utils/system/hashUtils";
import { isValidBuildFile, sanitizeFilename } from "../../utils/validation/dataValidation";
import { useFetchShipTypesSuspense } from "../useShipTypes/useShipTypes";

/**
 * Custom hook for managing the saving and loading of `.nms` build files.
 *
 * @remarks
 * This hook orchestrates state extraction from multiple stores, computes
 * checksums for integrity, and handles file system interactions (downloading/uploading).
 * It aggregates:
 * - `GridStore` (layout and results)
 * - `TechStore` (selected modules and bonuses)
 * - `TechBonusStore` (calculated efficiency status)
 * - `ModuleSelectionStore` (persistent user choices)
 *
 * @returns {object} Functions to save and load build states.
 *
 * @see {@link ./useBuildFileManager.test.ts Unit Tests}
 * @see {@link BuildFile} for the file structure definition.
 * @see {@link ../../utils/validation/dataValidation.ts Build File Validation}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { saveBuildToFile, loadBuildFromFile } = useBuildFileManager();
 * // returns { saveBuildToFile, loadBuildFromFile }
 * ```
 */
export const useBuildFileManager = () => {
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedPlatform = usePlatformStore((state) => state.setSelectedPlatform);
	const shipTypes = useFetchShipTypesSuspense();

	/**
	 * Captures the current application state and downloads it as a `.nms` file.
	 *
	 * @remarks
	 * Includes state from `GridStore`, `TechStore`, `TechBonusStore`, and `ModuleSelectionStore`.
	 *
	 * @param {string} buildName - The display name for the build. **Must not be empty.**
	 *
	 * @returns {Promise<void>} Resolves when the file download is initiated.
	 *
	 * @throws {Error} If state extraction, checksum computation, or file creation fails.
	 *
	 * @example
	 * ```typescript
	 * await saveBuildToFile("My Fighter");
	 * // returns Promise<void>, side-effect: triggers browser download
	 * ```
	 */
	const saveBuildToFile = async (buildName: string) => {
		try {
			// Get current state from all stores
			const gridState = useGridStore.getState();
			const techState = useTechStore.getState();
			const bonusState = useTechBonusStore.getState();
			const moduleState = useModuleSelectionStore.getState();

			const stateData = {
				gridState: {
					grid: gridState.grid,
					result: gridState.result,
					isSharedGrid: gridState.isSharedGrid,
					gridFixed: gridState.gridFixed,
					superchargedFixed: gridState.superchargedFixed,
					initialGridDefinition: gridState.initialGridDefinition,
				},
				techState: {
					checkedModules: techState.checkedModules,
					max_bonus: techState.max_bonus,
					solved_bonus: techState.solved_bonus,
					solve_method: techState.solve_method,
				},
				bonusState: {
					bonusStatus: bonusState.bonusStatus,
				},
				moduleState: {
					moduleSelections: moduleState.moduleSelections,
				},
			};

			// Compute checksum of the state data
			const stateDataJson = JSON.stringify(stateData);
			const checksum = await computeSHA256(stateDataJson);

			const buildData: BuildFile = {
				name: buildName,
				shipType: selectedShipType,
				timestamp: Date.now(),
				checksum,
				...stateData,
			};

			const json = JSON.stringify(buildData, null, 2);
			const blob = new Blob([json], { type: "application/octet-stream" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			const safeFilename = sanitizeFilename(buildName);
			link.download = `${safeFilename}.nms`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to save build file:", error);
			throw new Error("Failed to save build file", { cause: error });
		}
	};

	/**
	 * Parses a `.nms` file and restores the application state.
	 *
	 * @remarks
	 * Performs validation on file type, size, JSON structure, and data integrity (checksum).
	 * **Will switch the active ship type if the file contains a different one.**
	 *
	 * @param {File} file - The file object to load. **Must have a `.nms` extension.**
	 *
	 * @returns {Promise<void>} Resolves when the state has been successfully restored to all stores.
	 *
	 * @throws {Error} If validation (type, size, JSON, checksum, shipType) or restoration fails.
	 *
	 * @example
	 * ```typescript
	 * await loadBuildFromFile(selectedFile);
	 * // returns Promise<void>, side-effect: updates multiple global stores
	 * ```
	 */
	const loadBuildFromFile = async (file: File) => {
		try {
			// Validate file extension
			if (!file.name.endsWith(".nms")) {
				throw new Error("Invalid file type. Please select a .nms file.");
			}

			// Validate file size (max 10MB - builds should be much smaller)
			const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

			if (file.size > MAX_FILE_SIZE) {
				throw new Error("File is too large. Build files should be under 10MB.");
			}

			// Validate file is not empty
			if (file.size === 0) {
				throw new Error("File is empty. Please select a valid build file.");
			}

			const fileContent = await file.text();

			// Parse JSON with error handling
			let buildData;

			try {
				buildData = JSON.parse(fileContent);
			} catch {
				throw new Error("File contains invalid JSON. The build file may be corrupted.");
			}

			// Validate build file structure
			if (!isValidBuildFile(buildData)) {
				throw new Error(
					"The build file couldn’t be loaded. Please verify that you selected a valid NMS Optimizer build file. If the file was created before version 6.1, you may need to export it again using the latest version."
				);
			}

			// Verify checksum for integrity
			const stateDataToVerify = {
				gridState: buildData.gridState,
				techState: buildData.techState,
				bonusState: buildData.bonusState,
				moduleState: buildData.moduleState,
			};
			const stateDataJson = JSON.stringify(stateDataToVerify);
			const computedChecksum = await computeSHA256(stateDataJson);

			if (computedChecksum !== buildData.checksum) {
				throw new Error(
					"Build file integrity check failed. The file may have been corrupted or tampered with."
				);
			}

			// Validate shipType is supported
			const validShipTypes = Object.keys(shipTypes);

			if (!validShipTypes.includes(buildData.shipType)) {
				throw new Error(
					`Unsupported ship type: "${buildData.shipType}". Valid types are: ${validShipTypes.join(", ")}.`
				);
			}

			// If the shipType in the save file doesn't match the current shipType,
			// switch the app to the shipType from the save file
			if (buildData.shipType !== selectedShipType) {
				setSelectedPlatform(buildData.shipType, validShipTypes, true, true);
			}

			// Restore state from all stores
			useGridStore
				.getState()
				.restoreGridState({ ...buildData.gridState, buildName: buildData.name });

			useTechStore.setState(buildData.techState);
			useTechBonusStore.setState(buildData.bonusState);
			useModuleSelectionStore.setState(buildData.moduleState);
		} catch (error) {
			console.error("Failed to load build file:", error);

			if (error instanceof Error) {
				throw error;
			}

			throw new Error("An unexpected error occurred while loading the build file.", {
				cause: error,
			});
		}
	};

	return { saveBuildToFile, loadBuildFromFile };
};
