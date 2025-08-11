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
