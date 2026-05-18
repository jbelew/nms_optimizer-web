import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBuildFileManager } from "@/hooks/useBuildFileManager/useBuildFileManager";
import { useToast } from "@/hooks/useToast/useToast";
import { usePlatformStore } from "@/store/app/platformStore";
import { Logger } from "@/utils/system/monitoring";

/**
 * Return type for the `useSaveBuild` hook.
 *
 * @category Interfaces
 */
export interface UseSaveBuildReturn {
	/** Handler for canceling the save workflow and closing the dialog. */
	handleBuildNameCancel: () => void;
	/**
	 * Handler for confirming the build name and executing the save to disk.
	 *
	 * @param {string} buildName - The name to assign to the saved build.
	 *
	 * @returns {Promise<void>} Resolves when the file is generated and downloaded.
	 */
	handleBuildNameConfirm: (buildName: string) => Promise<void>;
	/** Function to initiate the save workflow by opening the naming dialog. */
	handleSaveBuild: () => void;
	/** Whether the build name entry dialog is currently open. */
	isSaveBuildDialogOpen: boolean;
	/** Whether the build is currently being processed and saved to disk. */
	isSavePending: boolean;
	/**
	 * Function to manually update the dialog open state.
	 *
	 * @param {boolean} open - The new state of the dialog.
	 */
	setIsSaveBuildDialogOpen: (open: boolean) => void;
}

/**
 * Custom hook for managing the "Save Build" workflow.
 *
 * @remarks
 * It manages the lifecycle of the save operation, including opening the naming
 * dialog, executing the file generation via `useBuildFileManager`, and
 * reporting results through toasts and analytics.
 *
 * @returns {UseSaveBuildReturn} State and handlers for the save build process.
 *
 * @see {@link useBuildFileManager} for the underlying file generation logic.
 * @see {@link useAnalytics} for tracking save events.
 * @see {@link useToast} for user notifications.
 * @see {@link ./useSaveBuild.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const MySaveButton = () => {
 *   const { handleSaveBuild, isSavePending, isSaveBuildDialogOpen } = useSaveBuild();
 *
 *   return (
 *     <>
 *       <button onClick={handleSaveBuild} disabled={isSavePending}>
 *         Download Build
 *       </button>
 *       {isSaveBuildDialogOpen && <BuildNameDialog onConfirm={...} />}
 *     </>
 *   );
 * };
 * ```
 */
export const useSaveBuild = (): UseSaveBuildReturn => {
	const { t } = useTranslation();
	const { saveBuildToFile } = useBuildFileManager();
	const { sendEvent } = useAnalytics();
	const { showError, showSuccess } = useToast();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);

	const [isSaveBuildDialogOpen, setIsSaveBuildDialogOpen] = useState(false);
	const [isSavePending, setIsSavePending] = useState(false);

	/**
	 * Opens the naming dialog to start the save process.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```typescript
	 * handleSaveBuild();
	 * // returns void, side-effect: opens naming dialog
	 * ```
	 */
	const handleSaveBuild = () => {
		setIsSaveBuildDialogOpen(true);
	};

	/**
	 * Finalizes the save operation using the provided build name.
	 *
	 * @param {string} buildName - The name to assign to the saved file. **Must be non-empty.**
	 *
	 * @returns {Promise<void>} Resolves when the build is saved and dialog closed.
	 *
	 * @example
	 * ```typescript
	 * await handleBuildNameConfirm("New Ship");
	 * // returns Promise<void>, side-effect: saves file and triggers toast
	 * ```
	 */
	const handleBuildNameConfirm = async (buildName: string) => {
		setIsSaveBuildDialogOpen(false);
		setIsSavePending(true);

		try {
			await saveBuildToFile(buildName);
			showSuccess(t("toast.buildSaved.title"), t("toast.buildSaved.description"), 5000);
			sendEvent({
				action: "save_build",
				build_name: buildName,
				category: "ui",
				method: "nms_file",
				nonInteraction: false,
				shipType: selectedShipType,
				value: 1,
			});
		} catch (error) {
			Logger.error("Save failed:", error);
			showError(t("toast.buildSaveError.title"), t("toast.buildSaveError.description"), 5000);
		} finally {
			setIsSavePending(false);
		}
	};

	/**
	 * Aborts the save process and closes the dialog.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```typescript
	 * handleBuildNameCancel();
	 * // returns void, side-effect: closes naming dialog
	 * ```
	 */
	const handleBuildNameCancel = () => {
		setIsSaveBuildDialogOpen(false);
	};

	return {
		handleBuildNameCancel,
		handleBuildNameConfirm,
		handleSaveBuild,
		isSaveBuildDialogOpen,
		isSavePending,
		setIsSaveBuildDialogOpen,
	};
};
