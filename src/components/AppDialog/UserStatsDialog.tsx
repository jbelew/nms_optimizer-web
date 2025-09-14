// src/components/AppDialog/UserStatsDialog.tsx
import type { FC } from "react";
import { useTranslation } from "react-i18next";

import AppDialog from "./AppDialog";
import { UserStatsContent } from "./UserStatsContent";

interface UserStatsDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * UserStatsDialog component displays user statistics in a dialog.
 * It serves as a wrapper around the AppDialog component, providing the specific content for user stats.
 *
 * @param {UserStatsDialogProps} props - The props for the component.
 * @returns {JSX.Element} The UserStatsDialog component.
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
