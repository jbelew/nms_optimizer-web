// src/components/AppDialog/ShareLinkDialog.tsx
import type { FC } from "react";
import { useTranslation } from "react-i18next";

import AppDialog from "./AppDialog";
import { ShareLinkContent } from "./ShareLinkContent";

/**
 * Props for the `ShareLinkDialog` component.
 */
interface ShareLinkDialogProps {
	/** Whether the share dialog is currently visible. */
	isOpen: boolean;
	/** The full URL generated for sharing the current grid state. **Must be a valid URL.** */
	shareUrl: string;
	/** Callback function to close the dialog. */
	onClose: () => void;
}

/**
 * A modal dialog that provides a shareable URL to the user.
 *
 * It wraps the `ShareLinkContent` within a standard `AppDialog`, handling the
 * display of the generated link and offering copy-to-clipboard functionality.
 *
 * @param {ShareLinkDialogProps} props - Component properties.
 * @returns {JSX.Element} The rendered share dialog.
 *
 * @example
 * <ShareLinkDialog isOpen={true} shareUrl="https://nms-optimizer.app/?grid=..." onClose={hideFn} />
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
