import { useEffect } from "react";

import { useBuildFileManager } from "@/hooks/useBuildFileManager/useBuildFileManager";

/**
 * Custom hook to handle the PWA File Handling API.
 *
 * @remarks
 * This hook sets up a consumer for the `launchQueue` to handle files
 * opened through the operating system's file association. Specifically,
 * it listens for `.nms` files and uses `loadBuildFromFile` from the
 * `useBuildFileManager` hook to restore the application state.
 *
 * It is designed to be used at the top level of the application to ensure
 * it captures any incoming launch requests.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link https://developer.chrome.com/docs/capabilities/web-apps/file-handling File Handling API}
 * @see {@link useBuildFileManager}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * // In App.tsx or a high-level component
 * useFileHandling();
 * ```
 */
export const useFileHandling = () => {
	const { loadBuildFromFile } = useBuildFileManager();

	useEffect(() => {
		// Only proceed if the launchQueue API is available in the browser
		if ("launchQueue" in window && window.launchQueue) {
			window.launchQueue.setConsumer(
				async (launchParams: { files: FileSystemFileHandle[] }) => {
					// We expect at least one file to be present in the launch parameters
					if (launchParams.files && launchParams.files.length > 0) {
						for (const fileHandle of launchParams.files) {
							try {
								// Get the File object from the handle
								const file = await fileHandle.getFile();

								// Double-check the extension, although OS-level association
								// should have already filtered this.
								if (file.name.endsWith(".nms")) {
									await loadBuildFromFile(file);
								}
							} catch (error) {
								// Fail silently but log the error for debugging
								console.error("Failed to load file from launchQueue:", error);
							}
						}
					}
				}
			);
		}
	}, [loadBuildFromFile]);
};
