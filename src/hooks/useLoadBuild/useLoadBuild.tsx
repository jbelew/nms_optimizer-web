import { useRef, useState } from "react";
import { Code } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "../../store/app/platformStore";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBuildFileManager } from "../useBuildFileManager/useBuildFileManager";
import { useToast } from "../useToast/useToast";

/**
 * Return type for the `useLoadBuild` hook.
 */
export interface UseLoadBuildReturn {
	/** Ref to the hidden file input element. */
	fileInputRef: React.RefObject<HTMLInputElement | null>;
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
 * - Programmatic triggering of the file input.
 * - Validation and parsing of the selected file.
 * - Updating the global grid state.
 * - Error reporting and success notifications via toasts.
 * - Analytics tracking of load events.
 *
 * @returns {UseLoadBuildReturn} An object containing the file input ref and handlers.
 *
 * @see {@link useBuildFileManager} for the underlying parsing logic.
 * @see {@link useToast} for user notifications.
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { fileInputRef, handleLoadBuild, handleFileSelect, isLoadPending } = useLoadBuild();
 *
 * return (
 *   <>
 *     <input type="file" ref={fileInputRef} onChange={handleFileSelect} hidden />
 *     <Button onClick={handleLoadBuild} loading={isLoadPending}>Load</Button>
 *   </>
 * );
 * ```
 */
export const useLoadBuild = (): UseLoadBuildReturn => {
	const { t } = useTranslation();
	const { loadBuildFromFile } = useBuildFileManager();
	const { showError, showSuccess } = useToast();
	const { sendEvent } = useAnalytics();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isLoadPending, setIsLoadPending] = useState(false);
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);

	/**
	 * Programmatically clicks the hidden file input to open the browser's picker.
	 *
	 * @example
	 * handleLoadBuild();
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
	 * <input type="file" onChange={handleFileSelect} />
	 */
	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (file) {
			setIsLoadPending(true);

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
					shipType: selectedShipType,
					value: 1,
				});
			} catch (error) {
				console.error("Load failed:", error);
				const errorMessage =
					error instanceof Error ? error.message : t("toast.buildLoadError.description");
				showError(t("toast.buildLoadError.title"), errorMessage, 5000);
			} finally {
				setIsLoadPending(false);
			}
		}

		// Reset the input so the same file can be selected again
		event.target.value = "";
	};

	return {
		fileInputRef,
		handleFileSelect,
		handleLoadBuild,
		isLoadPending,
	};
};
