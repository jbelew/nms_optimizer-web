import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { buildSerializer } from "@/utils/build/buildSerializer";
import { Logger } from "@/utils/system/monitoring";

/**
 * Custom hook for managing build file operations (save/load) in the DOM.
 *
 * @remarks
 * This hook acts as a thin DOM adapter. It delegates build serialization,
 * validation, and state restoration to the {@link buildSerializer} utility,
 * while handling DOM-specific tasks such as creating download links,
 * triggering file downloads, and revoking object URLs.
 *
 * @returns {object} An object containing `saveBuildToFile` and `loadBuildFromFile` functions.
 * @returns {Function} returns.saveBuildToFile - Serializes and downloads the current build.
 * @returns {Function} returns.loadBuildFromFile - Parses and restores a build from a file.
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
 * const { saveBuildToFile, loadBuildFromFile } = useBuildFileManager();
 * ```
 */
export const useBuildFileManager = () => {
	const shipTypes = useFetchShipTypesSuspense();

	/**
	 * Serializes the current application state and triggers a file download in the DOM.
	 *
	 * @remarks
	 * This method delegates serialization to {@link buildSerializer.saveBuild} and then
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
		try {
			const { blob, filename } = await buildSerializer.saveBuild(buildName);
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
		}
	};

	/**
	 * Delegates build loading and validation to the buildSerializer.
	 *
	 * @remarks
	 * This method resolves the supported ship types using {@link useFetchShipTypesSuspense}
	 * and delegates the parsing, validation, and state restoration of the `.nms` file to
	 * {@link buildSerializer.loadBuild}.
	 *
	 * @param {File} file - The `.nms` file to load.
	 *
	 * @returns {Promise<void>} Resolves when state is restored.
	 *
	 * @throws {Error} If validation fails or the file is corrupt.
	 *
	 * @example
	 * ```typescript
	 * const file = event.target.files[0];
	 * await loadBuildFromFile(file);
	 * ```
	 */
	const loadBuildFromFile = async (file: File): Promise<void> => {
		try {
			const validShipTypes = Object.keys(shipTypes);
			await buildSerializer.loadBuild(file, validShipTypes);
		} catch (error) {
			Logger.error("Failed to load build file:", error);
			throw error;
		}
	};

	return { loadBuildFromFile, saveBuildToFile };
};
