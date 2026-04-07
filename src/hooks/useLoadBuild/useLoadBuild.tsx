import { useRef, useState } from "react";
import { Code } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "../../store/PlatformStore";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBuildFileManager } from "../useBuildFileManager/useBuildFileManager";

/**
 * Return type for the `useLoadBuild` hook.
 */
export interface UseLoadBuildReturn {
	/** Ref to the hidden file input element. */
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	/** Function to programmatically trigger the file input click. */
	handleLoadBuild: () => void;
	/**
	 * Handler for the file input's `onChange` event.
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the file input.
	 * @returns {Promise<void>} Resolves when the file is processed and state is updated.
	 */
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
	/** Whether a build is currently being parsed and loaded. */
	isLoadPending: boolean;
}

/**
 * Props for the `useLoadBuild` hook.
 */
export interface UseLoadBuildProps {
	/**
	 * Callback to display a success toast.
	 *
	 * @param {string} title - The title of the toast.
	 * @param {string | React.ReactNode} description - The description or content of the toast.
	 * @param {number} [duration] - Optional duration in milliseconds.
	 */
	showSuccess: (title: string, description: string | React.ReactNode, duration?: number) => void;
	/**
	 * Callback to display an error toast.
	 *
	 * @param {string} title - The title of the toast.
	 * @param {string} description - The description of the error.
	 * @param {number} [duration] - Optional duration in milliseconds.
	 */
	showError: (title: string, description: string, duration?: number) => void;
}

/**
 * Custom hook for managing the "Load Build" workflow.
 *
 * @remarks
 * It handles the file selection process, delegates parsing to `useBuildFileManager`,
 * tracks loading state, sends analytics events, and manages success/error notifications.
 *
 * @hook
 * @category Hooks
 * @param {UseLoadBuildProps} [props] - Optional callbacks for displaying notifications.
 * @returns {UseLoadBuildReturn} State and event handlers for build loading.
 *
 * @see {@link useBuildFileManager} for the underlying file parsing logic.
 * @see {@link useAnalytics} for event tracking.
 * @see {@link usePlatformStore} for retrieving the currently selected ship type.
 *
 * @example
 * ```tsx
 * const { handleLoadBuild, isLoadPending, fileInputRef, handleFileSelect } = useLoadBuild({
 *   showSuccess: (title, desc) => console.log(title, desc),
 *   showError: (title, err) => console.error(title, err)
 * });
 *
 * return (
 *   <>
 *     <button onClick={handleLoadBuild} disabled={isLoadPending}>
 *       Load Save File
 *     </button>
 *     <input
 *       type="file"
 *       ref={fileInputRef}
 *       onChange={handleFileSelect}
 *       style={{ display: 'none' }}
 *       accept=".nms"
 *     />
 *   </>
 * );
 * ```
 */
export const useLoadBuild = (props?: UseLoadBuildProps): UseLoadBuildReturn => {
	const { t } = useTranslation();
	const { loadBuildFromFile } = useBuildFileManager();
	const { sendEvent } = useAnalytics();
	const { showSuccess, showError } = props || { showSuccess: () => {}, showError: () => {} };
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isLoadPending, setIsLoadPending] = useState(false);

	/**
	 * Opens the system file picker dialog.
	 *
	 * @returns {void} Side-effects only.
	 * @example
	 * ```typescript
	 * handleLoadBuild();
	 * // returns void, side-effect: opens file dialog
	 * ```
	 */
	const handleLoadBuild = () => {
		fileInputRef.current?.click();
	};

	/**
	 * Processes the selected build file and updates the application state.
	 *
	 * @param {import("react").ChangeEvent<HTMLInputElement>} event - The change event from the file input.
	 * @returns {Promise<void>} Resolves when the file is processed and state is updated.
	 * @example
	 * ```tsx
	 * <input type="file" onChange={handleFileSelect} />
	 * // returns Promise<void>, side-effect: parses file and updates GridStore
	 * ```
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
					category: "ui",
					action: "load_build",
					value: 1,
					fileName: file.name,
					shipType: selectedShipType,
					nonInteraction: false,
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
		handleLoadBuild,
		handleFileSelect,
		isLoadPending,
	};
};
