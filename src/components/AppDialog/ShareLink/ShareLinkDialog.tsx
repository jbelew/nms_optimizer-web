import type { FC } from "react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ShareLinkContent } from "./ShareLinkContent";

const AppDialog = lazy(() => import("../Base/AppDialog"));

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
 * @remarks
 * This component wraps the {@link ShareLinkContent} within a standard {@link AppDialog},
 * handling the display of the generated link and offering copy-to-clipboard functionality.
 *
 * @param {ShareLinkDialogProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered share dialog.
 *
 * @see {@link ./ShareLinkDialog.test.tsx Unit Tests}
 * @see {@link AppDialog}
 * @see {@link ShareLinkContent}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShareLinkDialog isOpen={true} shareUrl="https://nms-optimizer.app/?grid=..." onClose={hideFn} />
 * // mounts ShareLinkDialog with a shareable URL
 * ```
 */
const ShareLinkDialog: FC<ShareLinkDialogProps> = ({ isOpen, shareUrl, onClose }) => {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);
	const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (copiedTimeoutRef.current) {
				clearTimeout(copiedTimeoutRef.current);
			}
		};
	}, []);

	const handleCopyClick = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);

			if (copiedTimeoutRef.current) {
				clearTimeout(copiedTimeoutRef.current);
			}

			copiedTimeoutRef.current = setTimeout(() => {
				setCopied(false);
				copiedTimeoutRef.current = null;
			}, 2000);
		} catch (err) {
			console.error("Failed to copy: ", err);
		}
	};

	const footer = (
		<div className="flex justify-end gap-2">
			<Button variant="soft" onClick={onClose}>
				{t("dialogs.shareLink.closeButton")}
			</Button>
			<Button onClick={handleCopyClick}>
				{copied ? <CheckIcon /> : <CopyIcon />}
				{copied ? t("dialogs.shareLink.copiedButton") : t("dialogs.shareLink.copyButton")}
			</Button>
		</div>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				isOpen={isOpen}
				onClose={onClose}
				titleKey="dialogs.titles.shareLink"
				title={t("dialogs.titles.shareLink")}
				footer={footer}
				content={<ShareLinkContent shareUrl={shareUrl} />}
			/>
		</Suspense>
	);
};

export default ShareLinkDialog;
