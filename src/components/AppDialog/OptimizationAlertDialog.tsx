// src/components/AppDialog/OptimizationAlertDialog.tsx
import type { FC } from "react";
import { useTranslation } from "react-i18next";

import AppDialog from "./AppDialog";
import { OptimizationAlertContent } from "./OptimizationAlertContent";

interface OptimizationAlertDialogProps {
	isOpen: boolean;
	technologyName: string | null;
	onClose: () => void;
	onForceOptimize: () => Promise<void>;
}

/**
 * OptimizationAlertDialog component displays a dialog with an optimization alert.
 * It uses the `AppDialog` component to render the dialog and `OptimizationAlertContent`
 * to display the specific alert message.
 *
 * @param {OptimizationAlertDialogProps} props - The props for the OptimizationAlertDialog component.
 * @returns {JSX.Element | null} The rendered OptimizationAlertDialog component, or null if `technologyName` is null.
 */
const OptimizationAlertDialog: FC<OptimizationAlertDialogProps> = ({
	isOpen,
	technologyName,
	onClose,
	onForceOptimize,
}) => {
	const { t } = useTranslation();

	if (!technologyName) return null;

	return (
		<AppDialog
			isOpen={isOpen}
			onClose={onClose}
			titleKey="dialogs.titles.optimizationAlert"
			title={t("dialogs.titles.optimizationAlert")}
			content={
				<OptimizationAlertContent
					technologyName={technologyName}
					onClose={onClose}
					onForceOptimize={onForceOptimize}
				/>
			}
		/>
	);
};

export default OptimizationAlertDialog;
