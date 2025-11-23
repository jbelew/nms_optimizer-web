import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "../../store/PlatformStore";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBuildFileManager } from "../useBuildFileManager/useBuildFileManager";
import { useToast } from "../useToast/useToast";

interface UseLoadBuildReturn {
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	handleLoadBuild: () => void;
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
	isLoadPending: boolean;
}

/**
 * Custom hook to manage load build functionality.
 * Handles file input, file loading, analytics, and toast notifications.
 *
 * @returns {UseLoadBuildReturn} Load build state and handlers
 */
export const useLoadBuild = (): UseLoadBuildReturn => {
	const { t } = useTranslation();
	const { loadBuildFromFile } = useBuildFileManager();
	const { sendEvent } = useAnalytics();
	const { showSuccess, showError } = useToast();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isLoadPending, setIsLoadPending] = useState(false);

	const handleLoadBuild = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileSelect = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				setIsLoadPending(true);
				try {
					await loadBuildFromFile(file);
					showSuccess(
						t("toast.buildLoaded.title") || "Success",
						t("toast.buildLoaded.description") || `Build "${file.name}" loaded`,
						5000
					);
					sendEvent({
						category: "ui",
						action: "load_build",
						value: 1,
						fileName: file.name,
						shipType: selectedShipType,
					});
				} catch (error) {
					console.error("Load failed:", error);
					const errorMessage =
						error instanceof Error ? error.message : "Failed to load build";
					showError(t("toast.buildLoadError.title") || "Error", errorMessage, 5000);
				} finally {
					setIsLoadPending(false);
				}
			}
			// Reset the input so the same file can be selected again
			event.target.value = "";
		},
		[loadBuildFromFile, showSuccess, showError, sendEvent, t, selectedShipType]
	);

	return {
		fileInputRef,
		handleLoadBuild,
		handleFileSelect,
		isLoadPending,
	};
};
