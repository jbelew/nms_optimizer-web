// src/components/AppDialog/UserStatsDialog.tsx
import type { FC } from "react";
import { useTranslation } from "react-i18next";

import AppDialog from "./AppDialog";
import { UserStatsContent } from "./UserStatsContent";

/**
 * Props for the UserStatsDialog component.
 */
interface UserStatsDialogProps {
	/**
	 *  Indicates whether the dialog is open or closed.
	 */
	isOpen: boolean;
	/**
	 * Callback function to be called when the dialog is closed.
	 */
	onClose: () => void;
}

/**
 * UserStatsDialog component displays user statistics in a dialog.
 * It serves as a wrapper around the AppDialog component, providing the specific content for user stats.
 *
 * @param {UserStatsDialogProps} props - The props for the component.
 * @returns {FC<UserStatsDialogProps>} The UserStatsDialog component.
 */
const UserStatsDialog: FC<UserStatsDialogProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();

	return (
		<AppDialog
			isOpen={isOpen}
			onClose={onClose}
			titleKey="dialogs.titles.userStats"
			title={t("dialogs.titles.userStats")}
			content={<UserStatsContent onClose={onClose} />}
		/>
	);
};

export default UserStatsDialog;
