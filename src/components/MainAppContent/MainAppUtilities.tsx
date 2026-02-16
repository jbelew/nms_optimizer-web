// src/components/MainAppContent/MainAppUtilities.tsx
import React from "react";
import { useTranslation } from "react-i18next";

import { InstallPrompt } from "../../components/InstallPrompt/InstallPrompt";
import BuildNameDialog from "../AppDialog/BuildNameDialog";
import OptimizationAlertDialog from "../AppDialog/OptimizationAlertDialog";
import { ErrorMessageRenderer } from "../ErrorMessageRenderer/ErrorMessageRenderer";
import { ToastRenderer } from "../Toast/ToastRenderer";

interface MainAppUtilitiesProps {
	// OptimizationAlertDialog props
	patternNoFitTech: string | null;
	clearPatternNoFitTech: () => void;
	handleForceCurrentPnfOptimize: () => Promise<void>;

	// BuildNameDialog props
	isSaveBuildDialogOpen: boolean;
	handleBuildNameConfirm: (name: string) => void;
	handleBuildNameCancel: () => void;

	// Hidden file input props
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * MainAppUtilities component aggregates global utility components and dialogs.
 * This keeps the main application orchestrator cleaner.
 *
 * @param {MainAppUtilitiesProps} props - The props for the component.
 * @returns {JSX.Element} The rendered global utilities.
 */
export const MainAppUtilities: React.FC<MainAppUtilitiesProps> = ({
	patternNoFitTech,
	clearPatternNoFitTech,
	handleForceCurrentPnfOptimize,
	isSaveBuildDialogOpen,
	handleBuildNameConfirm,
	handleBuildNameCancel,
	fileInputRef,
	handleFileSelect,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<InstallPrompt />

			<OptimizationAlertDialog
				isOpen={!!patternNoFitTech}
				technologyName={patternNoFitTech}
				onClose={clearPatternNoFitTech}
				onForceOptimize={handleForceCurrentPnfOptimize}
			/>

			{/* Build file management */}
			<BuildNameDialog
				isOpen={isSaveBuildDialogOpen}
				onConfirm={handleBuildNameConfirm}
				onCancel={handleBuildNameCancel}
			/>

			<input
				ref={fileInputRef}
				type="file"
				accept=".nms"
				onChange={handleFileSelect}
				className="hidden"
				aria-label={t("buttons.loadBuild")}
			/>

			<ErrorMessageRenderer />
			<ToastRenderer />
		</>
	);
};
