import { useCallback, useRef, useState } from "react";
import { Code } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePlatformStore } from "../../store/PlatformStore";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBuildFileManager } from "../useBuildFileManager/useBuildFileManager";

interface UseLoadBuildReturn {
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	handleLoadBuild: () => void;
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
	isLoadPending: boolean;
}

interface UseLoadBuildProps {
	showSuccess: (title: string, description: string | React.ReactNode, duration?: number) => void;
	showError: (title: string, description: string, duration?: number) => void;
}

/**
 * Custom hook to manage load build functionality.
 * Handles file input, file loading, analytics, and toast notifications.
 *
 * @param {UseLoadBuildProps} [props] - Optional toast functions passed from parent component
 * @returns {UseLoadBuildReturn} Load build state and handlers
 */
export const useLoadBuild = (props?: UseLoadBuildProps): UseLoadBuildReturn => {
	const { t } = useTranslation();
	const { loadBuildFromFile } = useBuildFileManager();
	const { sendEvent } = useAnalytics();
	const { showSuccess, showError } = props || { showSuccess: () => {}, showError: () => {} };
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
						error instanceof Error
							? error.message
							: t("toast.buildLoadError.description");
					showError(t("toast.buildLoadError.title"), errorMessage, 5000);
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
