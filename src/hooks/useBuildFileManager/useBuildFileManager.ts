import type { BuildFile } from "../../utils/buildFileValidation";
import { useCallback } from "react";

import { useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechStore } from "../../store/TechStore";
import { isValidBuildFile } from "../../utils/buildFileValidation";
import { computeSHA256 } from "../../utils/hashUtils";
import { deserialize, useGridDeserializer } from "../useGridDeserializer/useGridDeserializer";
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
	const { setGrid, setIsSharedGrid } = useGridStore();
	const setTechColors = useTechStore((state) => state.setTechColors);
	const { serializeGrid } = useGridDeserializer();

	/**
	 * Saves the current grid state to a .nms build file.
	 *
	 * @param {string} buildName - The name for the saved build.
	 */
	const saveBuildToFile = useCallback(
		async (buildName: string) => {
			try {
				const serialized = serializeGrid();

				// Compute SHA-256 checksum of serialized data for integrity verification
				const checksum = await computeSHA256(serialized);

				const buildData: BuildFile = {
					name: buildName,
					shipType: selectedShipType,
					serialized,
					timestamp: Date.now(),
					checksum,
				};

				const json = JSON.stringify(buildData, null, 2);
				const blob = new Blob([json], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				// Replace spaces/special chars with underscores for filename
				const safeFilename = buildName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
				link.download = `${safeFilename}.nms`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			} catch (error) {
				console.error("Failed to save build file:", error);
				throw new Error("Failed to save build file");
			}
		},
		[serializeGrid, selectedShipType]
	);

	/**
	 * Loads a build from a .nms file.
	 *
	 * @param {File} file - The file to load the build from.
	 * @throws {Error} If the file is invalid or deserialization fails.
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
						"Invalid build file format. Please ensure you're loading a valid NMS Optimizer build file."
					);
				}

				// Verify checksum (required for integrity verification)
				if (!buildData.checksum) {
					throw new Error(
						"Build file is missing integrity checksum. This is not a valid NMS Optimizer build file."
					);
				}
				const computedChecksum = await computeSHA256(buildData.serialized);
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

				// Deserialize the grid with the explicit shipType from the build file
				// to avoid race conditions where the techTree hasn't loaded for the new shipType
				console.log("Attempting to deserialize:", buildData.serialized);
				const newGrid = await deserialize(
					buildData.serialized,
					buildData.shipType,
					setTechColors
				);
				if (newGrid) {
					console.log("Deserialization successful, setting grid and colors.");
					setGrid(newGrid);
					setIsSharedGrid(true);
				} else {
					console.error("Deserialization failed, grid not set.");
					throw new Error(
						"Failed to deserialize grid data. The build file may be corrupted or from an incompatible version."
					);
				}
			} catch (error) {
				console.error("Failed to load build file:", error);
				if (error instanceof Error) {
					throw error;
				}
				throw new Error("An unexpected error occurred while loading the build file.");
			}
		},
		[selectedShipType, shipTypes, setSelectedPlatform, setTechColors, setGrid, setIsSharedGrid]
	);

	return { saveBuildToFile, loadBuildFromFile };
};
