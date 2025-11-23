import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "../../store/PlatformStore";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBuildFileManager } from "../useBuildFileManager/useBuildFileManager";
import { useToast } from "../useToast/useToast";

interface UseSaveBuildReturn {
	isSaveBuildDialogOpen: boolean;
	setIsSaveBuildDialogOpen: (open: boolean) => void;
	handleSaveBuild: () => void;
	handleBuildNameConfirm: (buildName: string) => Promise<void>;
	handleBuildNameCancel: () => void;
	isSavePending: boolean;
}

/**
 * Custom hook to manage save build functionality.
 * Handles dialog state, file saving, analytics, and toast notifications.
 *
 * @returns {UseSaveBuildReturn} Save build state and handlers
 */
export const useSaveBuild = (): UseSaveBuildReturn => {
	const { t } = useTranslation();
	const { saveBuildToFile } = useBuildFileManager();
	const { sendEvent } = useAnalytics();
	const { showSuccess, showError } = useToast();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);

	const [isSaveBuildDialogOpen, setIsSaveBuildDialogOpen] = useState(false);
	const [isSavePending, setIsSavePending] = useState(false);

	const handleSaveBuild = useCallback(() => {
		setIsSaveBuildDialogOpen(true);
	}, []);

	const handleBuildNameConfirm = useCallback(
		async (buildName: string) => {
			setIsSaveBuildDialogOpen(false);
			setIsSavePending(true);
			try {
				await saveBuildToFile(buildName);
				showSuccess(
					t("toast.buildSaved.title") || "Success",
					t("toast.buildSaved.description") || `Build "${buildName}" downloaded`,
					5000
				);
				sendEvent({
					category: "ui",
					action: "save_build",
					value: 1,
					buildName,
					shipType: selectedShipType,
				});
			} catch (error) {
				console.error("Save failed:", error);
				showError(
					t("toast.buildSaveError.title") || "Error",
					t("toast.buildSaveError.description") || "Failed to save build",
					5000
				);
			} finally {
				setIsSavePending(false);
			}
		},
		[saveBuildToFile, showSuccess, showError, sendEvent, t, selectedShipType]
	);

	const handleBuildNameCancel = useCallback(() => {
		setIsSaveBuildDialogOpen(false);
	}, []);

	return {
		isSaveBuildDialogOpen,
		setIsSaveBuildDialogOpen,
		handleSaveBuild,
		handleBuildNameConfirm,
		handleBuildNameCancel,
		isSavePending,
	};
};
