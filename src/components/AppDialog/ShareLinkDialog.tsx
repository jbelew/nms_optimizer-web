// src/components/AppDialog/ShareLinkDialog.tsx
import type { FC } from "react";
import { useTranslation } from "react-i18next";

import AppDialog from "./AppDialog";
import { ShareLinkContent } from "./ShareLinkContent";

interface ShareLinkDialogProps {
	isOpen: boolean;
	shareUrl: string;
	onClose: () => void;
}

/**
 * ShareLinkDialog component displays a dialog for sharing a link.
 * It uses the `AppDialog` component to render the dialog and `ShareLinkContent`
 * to display the shareable URL and related actions.
 *
 * @param {ShareLinkDialogProps} props - The props for the ShareLinkDialog component.
 * @returns {JSX.Element} The rendered ShareLinkDialog component.
 */
const ShareLinkDialog: FC<ShareLinkDialogProps> = ({ isOpen, shareUrl, onClose }) => {
	const { t } = useTranslation();

	return (
		<AppDialog
			isOpen={isOpen}
			onClose={onClose}
			titleKey="dialogs.titles.shareLink"
			title={t("dialogs.titles.shareLink")}
			content={<ShareLinkContent shareUrl={shareUrl} onClose={onClose} />}
		/>
	);
};

export default ShareLinkDialog;
