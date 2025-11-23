import type { FC } from "react";
import { useTranslation } from "react-i18next";

import AppDialog from "./AppDialog";
import { BuildNameContent } from "./BuildNameContent";

interface BuildNameDialogProps {
	isOpen: boolean;
	onConfirm: (buildName: string) => void;
	onCancel: () => void;
}

/**
 * Dialog component for entering a build name when saving.
 * Mobile-friendly with proper keyboard handling and touch targets.
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
		/>
	);
};

export default BuildNameDialog;
