// src/components/MainAppContent/MainAppUtilities.tsx
import React from "react";
import { useTranslation } from "react-i18next";

import { InstallPrompt } from "../../components/InstallPrompt/InstallPrompt";
import BuildNameDialog from "../AppDialog/BuildNameDialog";
import OptimizationAlertDialog from "../AppDialog/OptimizationAlertDialog";
import { ErrorMessageRenderer } from "../ErrorMessageRenderer/ErrorMessageRenderer";
import { ToastRenderer } from "../Toast/ToastRenderer";

/**
 * Props for the `MainAppUtilities` component.
 */
interface MainAppUtilitiesProps {
	/** Identifier of the technology that failed pattern matching. `null` if no active warning. */
	patternNoFitTech: string | null;
	/** Callback to clear the optimization failure alert. */
	clearPatternNoFitTech: () => void;
	/** Asynchronous callback to re-trigger a solve for the failed technology. */
	handleForceCurrentPnfOptimize: () => Promise<void>;

	/** Whether the build name entry modal is visible. */
	isSaveBuildDialogOpen: boolean;
	/** Callback function to save a build with the provided name. */
	handleBuildNameConfirm: (name: string) => void;
	/** Callback to dismiss the build naming modal. */
	handleBuildNameCancel: () => void;

	/** Ref to the hidden native file input used for build loading. */
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	/** Event handler for the system file picker's change event. */
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * A container component for non-visual and global utility components.
 *
 * This component collects global UI elements like toast notifications,
 * error renderers, installation prompts, and build-management modals into
 * a single mount point. This helps keep the `MainAppContent` component
 * focused on layout and primary interaction.
 *
 * @param {MainAppUtilitiesProps} props - Component properties.
 * @returns {JSX.Element} The collection of global utility components.
 *
 * @example
 * <MainAppUtilities {...logicSubProps} />
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
