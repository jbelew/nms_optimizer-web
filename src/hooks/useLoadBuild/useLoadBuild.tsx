import type { RefObject } from "react";
import { Code } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBuildFileManager } from "@/hooks/useBuildFileManager/useBuildFileManager";
import { useToast } from "@/hooks/useToast/useToast";
import { usePlatformStore } from "@/store/app/platformStore";
import { Logger } from "@/utils/system/monitoring";

/** Singleton ref to the hidden `.nms` file input shared across toolbar and grid button callers. */
const sharedFileInputRef: RefObject<HTMLInputElement | null> = { current: null };

/**
 * Return type for the `useLoadBuild` hook.
 */
export interface UseLoadBuildReturn {
	/** Ref to the hidden file input element. */
	fileInputRef: RefObject<HTMLInputElement | null>;
	/** Processes the user's selected file. */
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
	/** Triggers the native file selection dialog. */
	handleLoadBuild: () => void;
	/** Whether a file is currently being parsed and loaded. */
	isLoadPending: boolean;
}

/**
 * Custom hook for managing the asynchronous loading of `.nms` build files.
 *
 * @remarks
 * This hook handles the complete file loading workflow, including:
 * - Programmatic triggering of the shared file input.
 * - Validation and parsing of the selected file.
 * - Updating the global grid state.
 * - Error reporting and success notifications via toasts.
 * - Analytics tracking of load events.
 *
 * @returns {UseLoadBuildReturn} An object containing the shared file input ref and handlers.
 *
 * @see {@link useBuildFileManager} for the underlying parsing logic.
 * @see {@link useToast} for user notifications.
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { handleLoadBuild, isLoadPending } = useLoadBuild();
 * // returns shared file input ref and load handlers
 * ```
 */
export const useLoadBuild = (): UseLoadBuildReturn => {
	const { t } = useTranslation();
	const { isPending, loadBuildFromFile } = useBuildFileManager();
	const { showError, showSuccess } = useToast();
	const { sendEvent } = useAnalytics();
	const fileInputRef = sharedFileInputRef;
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);

	/**
	 * Programmatically clicks the hidden file input to open the browser's picker.
	 *
	 * @example
	 * ```ts
	 * handleLoadBuild();
	 * // opens native file picker for .nms files
	 * ```
	 */
	const handleLoadBuild = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	/**
	 * Handler for the file input's `change` event.
	 *
	 * It extracts the first selected file, invokes the `loadBuildFromFile` utility,
	 * and manages the pending state and user feedback.
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} event - The browser's change event.
	 *
	 * @returns {Promise<void>} Resolves when the file is processed.
	 *
	 * @example
	 * ```tsx
	 * <input type="file" onChange={handleFileSelect} />
	 * // parses selected .nms file and updates grid store
	 * ```
	 */
	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (file) {
			try {
				await loadBuildFromFile(file);
				showSuccess(
					t("toast.buildLoaded.title"),
					<>
						Build <Code>{file.name}</Code> {t("toast.buildLoaded.loadedMessage")}
					</>,
					5000
				);
				sendEvent({
					action: "load_build",
					category: "ui",
					file_name: file.name,
					method: "nms_file",
					nonInteraction: false,
					shipType: selectedPlatform,
					value: 1,
				});
			} catch (error) {
				Logger.error("Load failed:", error);
				const errorMessage =
					error instanceof Error ? error.message : t("toast.buildLoadError.description");
				showError(t("toast.buildLoadError.title"), errorMessage, 5000);
			}
		}

		// Reset the input so the same file can be selected again
		event.target.value = "";
	};

	return {
		fileInputRef,
		handleFileSelect,
		handleLoadBuild,
		isLoadPending: isPending,
	};
};
