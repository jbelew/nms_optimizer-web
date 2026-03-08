// src/components/AppDialog/OptimizationAlertDialog.tsx
import type { FC } from "react";
import { useTranslation } from "react-i18next";

import AppDialog from "./AppDialog";
import { OptimizationAlertContent } from "./OptimizationAlertContent";

/**
 * Props for the `OptimizationAlertDialog` component.
 */
interface OptimizationAlertDialogProps {
	/** Whether the alert dialog is currently visible. */
	isOpen: boolean;
	/** The display name of the technology that triggered the alert. `null` to suppress. */
	technologyName: string | null;
	/** Callback function to close the dialog. */
	onClose: () => void;
	/** Asynchronous callback to trigger a "forced" optimization solve. */
	onForceOptimize: () => Promise<void>;
}

/**
 * A specialized dialog component that warns users when a pattern-based optimization fails.
 *
 * It provides the user with two choices: dismiss the warning or attempt a "forced" solve
 * using more intensive algorithms. It wraps the `OptimizationAlertContent` inside
 * a standard `AppDialog`.
 *
 * @param {OptimizationAlertDialogProps} props - Component properties.
 * @returns {JSX.Element | null} The rendered dialog, or `null` if no technology is targeted.
 *
 * @example
 * <OptimizationAlertDialog
 *   isOpen={isWarningVisible}
 *   technologyName="Hyperdrive"
 *   onClose={hideFn}
 *   onForceOptimize={forceFn}
 * />
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
