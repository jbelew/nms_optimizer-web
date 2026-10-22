import type { FC } from "react";
import { Suspense, useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Button, Link, Text, TextArea } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import { Logger } from "@/utils/system/monitoring";

/**
 * Props for the `ShareLinkDialog` component.
 */
interface ShareLinkDialogProps {
	/** Whether the share dialog is currently visible. */
	isOpen: boolean;
	/** Callback function to close the dialog. */
	onClose: () => void;
	/** The full URL generated for sharing the current Shared Grid state. **Must be a valid URL.** */
	shareUrl: string;
}

/**
 * A modal dialog that presents a shareable Shared Grid URL and copy-to-clipboard action.
 *
 * @remarks
 * Renders a read-only `TextArea` containing the serialized Shared Grid URL, an external
 * link to open the URL in a new tab, and a copy button with temporary checkmark feedback.
 *
 * @see {@link ShareLinkDialogProps}
 * @see {@link AppDialog}
 * @see {@link ./ShareLinkDialog.test.tsx Unit Tests}
 * @see {@link ./ShareLinkDialog.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShareLinkDialog isOpen={true} shareUrl="https://nms-optimizer.app/?grid=..." onClose={hideFn} />
 * // mounts ShareLinkDialog
 * ```
 */
const ShareLinkDialog: FC<ShareLinkDialogProps> = ({ isOpen, onClose, shareUrl }) => {
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
			Logger.error("Failed to copy: ", err);
		}
	};

	const content = (
		<>
			<Text
				as="p"
				mb="3"
				size={{ initial: "2", sm: "3" }}
			>
				{t("dialogs.shareLink.description")}
			</Text>
			<Text
				as="p"
				mb="3"
				size={{ initial: "2", sm: "3" }}
			>
				<Trans i18nKey="dialogs.shareLink.tip" />
			</Text>
			<TextArea
				aria-label={t("dialogs.titles.shareLink")}
				className="font-mono! font-light! [&_textarea]:text-(--accent-a11)! [&_textarea]:[-webkit-text-fill-color:var(--accent-a11)]!"
				id="share-url-input"
				name="shareUrl"
				readOnly
				rows={8}
				size={{ initial: "2", sm: "3" }}
				value={shareUrl}
				variant="soft"
			/>
			<Text
				align="right"
				as="p"
				mb="2"
				mt="2"
				size={{ initial: "2", sm: "3" }}
			>
				<Link
					href={shareUrl}
					rel="noopener noreferrer"
					target="_blank"
				>
					{t("dialogs.shareLink.openLink")}
					<ExternalLinkIcon className="ml-1 inline-block" />
				</Link>
			</Text>
		</>
	);

	const footer = (
		<div className="flex justify-end gap-2">
			<Button
				onClick={onClose}
				variant="soft"
			>
				{t("dialogs.shareLink.closeButton")}
			</Button>
			<Button onClick={handleCopyClick}>
				{copied ?
					<CheckIcon />
				:	<CopyIcon />}
				{copied ? t("dialogs.shareLink.copiedButton") : t("dialogs.shareLink.copyButton")}
			</Button>
		</div>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				content={content}
				footer={footer}
				isOpen={isOpen}
				onClose={onClose}
				title={t("dialogs.titles.shareLink")}
				titleKey="dialogs.titles.shareLink"
			/>
		</Suspense>
	);
};

export default ShareLinkDialog;
