import { startTransition, useState } from "react";

import { fetchShipTypes } from "@/hooks/useShipTypes/useShipTypes";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { buildSerializer } from "@/utils/build/buildSerializer";
import { Logger } from "@/utils/system/monitoring";

/**
 * Custom hook for managing Build File operations (save/load) in the DOM.
 *
 * @remarks
 * Acts as a DOM file I/O adapter: delegates multi-store snapshot extraction and
 * restoration to {@link sessionCoordinator}, delegates `.nms` JSON serialization
 * and SHA-256 verification to {@link buildSerializer}, and resolves supported
 * Platform Types asynchronously via {@link fetchShipTypes} only when loading a file
 * (avoiding any render-time Suspense dependency).
 *
 * @returns {object} An object containing the load/save functions and the pending state.
 * @returns {Function} returns.saveBuildToFile - Serializes and downloads the current build as a `.nms` Build File.
 * @returns {Function} returns.loadBuildFromFile - Parses, validates, and restores a build from a `.nms` Build File.
 * @returns {boolean} returns.isPending - Reactive pending/loading state for file operations.
 *
 * @see {@link ./useBuildFileManager.test.ts Unit Tests}
 * @see {@link buildSerializer}
 * @see {@link sessionCoordinator}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { saveBuildToFile, loadBuildFromFile, isPending } = useBuildFileManager();
 * // returns { isPending: false, loadBuildFromFile: [Function], saveBuildToFile: [Function] }
 * ```
 */
export const useBuildFileManager = () => {
	const [isPending, setIsPending] = useState(false);

	/**
	 * Serializes the current application state and triggers a `.nms` Build File download in the DOM.
	 *
	 * @remarks
	 * Captures a multi-store snapshot via {@link sessionCoordinator.getBuildSnapshot},
	 * delegates serialization to {@link buildSerializer.saveBuild}, and triggers a
	 * browser download of the returned binary blob.
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
	 * // triggers browser download of My-Fighter-Build.nms
	 * ```
	 */
	const saveBuildToFile = async (buildName: string): Promise<void> => {
		setIsPending(true);

		try {
			const snapshot = sessionCoordinator.getBuildSnapshot(buildName);
			const { blob, filename } = await buildSerializer.saveBuild(snapshot);

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
	 * Restores a build configuration from an uploaded `.nms` Build File.
	 *
	 * @remarks
	 * Performs DOM File validation (extension and size checks), resolves supported
	 * Platform Types lazily via {@link fetchShipTypes}, delegates parsing and checksum
	 * verification to {@link buildSerializer.loadBuild}, and commits the multi-store
	 * state via {@link sessionCoordinator.restoreBuildSnapshot} inside a React transition.
	 *
	 * @param {File} file - The `.nms` Build File to load.
	 *
	 * @returns {Promise<void>} Resolves when state is successfully restored.
	 *
	 * @throws {Error} If validation fails, file is empty, checksum is invalid, or ship type is unsupported.
	 *
	 * @example
	 * ```typescript
	 * const file = event.target.files[0];
	 * await loadBuildFromFile(file);
	 * // restores platform, grid, and tech store state from file
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

			const text = await file.text();

			if (!text) {
				throw new Error("File is empty. Please select a valid build file.");
			}

			const shipTypes = await fetchShipTypes();
			const validShipTypes = Object.keys(shipTypes);
			const buildData = await buildSerializer.loadBuild(text, validShipTypes);

			startTransition(() => {
				sessionCoordinator.restoreBuildSnapshot(buildData, validShipTypes);
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
