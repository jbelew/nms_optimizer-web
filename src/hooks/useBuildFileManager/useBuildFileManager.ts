import type { BuildFile } from "../../utils/buildFileValidation";
import { useCallback } from "react";

import { useGridStore } from "../../store/GridStore";
import { useModuleSelectionStore } from "../../store/ModuleSelectionStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechBonusStore } from "../../store/TechBonusStore";
import { useTechStore } from "../../store/TechStore";
import { isValidBuildFile } from "../../utils/buildFileValidation";
import { sanitizeFilename } from "../../utils/filenameValidation";
import { computeSHA256 } from "../../utils/hashUtils";
import { useFetchShipTypesSuspense } from "../useShipTypes/useShipTypes";

/**
 * Custom hook for saving and loading build files.
 *
 * @returns {{
 *   saveBuildToFile: (buildName: string) => void,
 *   loadBuildFromFile: (file: File) => Promise<void>
 * }} An object containing functions to save and load builds.
 */
export const useBuildFileManager = () => {
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedPlatform = usePlatformStore((state) => state.setSelectedPlatform);
	const shipTypes = useFetchShipTypesSuspense();

	/**
	 * Saves the current application state to a .nms build file.
	 * Saves GridStore, TechStore, TechBonusStore, and ModuleSelectionStore state.
	 *
	 * @param {string} buildName - The name for the saved build.
	 */
	const saveBuildToFile = useCallback(
		async (buildName: string) => {
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
		},
		[selectedShipType]
	);

	/**
	 * Loads a build from a .nms file.
	 * Restores GridStore, TechStore, TechBonusStore, and ModuleSelectionStore state.
	 *
	 * @param {File} file - The file to load the build from.
	 * @throws {Error} If the file is invalid or incompatible.
	 */
	const loadBuildFromFile = useCallback(
		async (file: File) => {
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
				useGridStore.setState(buildData.gridState);
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
		},
		[selectedShipType, shipTypes, setSelectedPlatform]
	);

	return { saveBuildToFile, loadBuildFromFile };
};
