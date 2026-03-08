import type { FC } from "react";
import { useTranslation } from "react-i18next";

import AppDialog from "./AppDialog";
import { BuildNameContent } from "./BuildNameContent";

import "./BuildNameDialog.scss";

/**
 * Props for the `BuildNameDialog` component.
 */
interface BuildNameDialogProps {
	/** Whether the naming dialog is currently visible. */
	isOpen: boolean;
	/** Callback function triggered when the user confirms the build name. **Receives the name as a string.** */
	onConfirm: (buildName: string) => void;
	/** Callback function triggered when the user cancels or dismisses the dialog. */
	onCancel: () => void;
}

/**
 * A modal dialog that allows users to provide a custom name for their saved build.
 *
 * It wraps the `BuildNameContent` within a standard `AppDialog`, providing a
 * localized title and specific styling for the naming input workflow.
 *
 * @param {BuildNameDialogProps} props - Component properties.
 * @returns {JSX.Element} The rendered build naming dialog.
 *
 * @example
 * <BuildNameDialog isOpen={showDialog} onConfirm={saveFn} onCancel={closeFn} />
 */
const BuildNameDialog: FC<BuildNameDialogProps> = ({ isOpen, onConfirm, onCancel }) => {
	const { t } = useTranslation();

	return (
		<AppDialog
			isOpen={isOpen}
			onClose={onCancel}
			titleKey="dialog.buildName.title"
			title={t("dialog.buildName.title") || "Save Build"}
			content={<BuildNameContent onConfirm={onConfirm} onCancel={onCancel} />}
			className="buildNameDialog__content"
		/>
	);
};

export default BuildNameDialog;
