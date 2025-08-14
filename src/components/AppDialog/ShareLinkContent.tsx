// src/components/AppDialog/ShareLinkContent.tsx
import type { FC } from "react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Button, Flex, Link, Text, TextArea } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

interface ShareLinkContentProps {
	shareUrl: string;
	onClose: () => void;
}

/**
 * ShareLinkContent component displays a shareable URL and provides options to copy it or open it in a new tab.
 *
 * @param {ShareLinkContentProps} props - The props for the ShareLinkContent component.
 * @param {string} props.shareUrl - The URL to be shared.
 * @param {() => void} props.onClose - Callback function to be called when the dialog is closed.
 * @returns {JSX.Element} The rendered ShareLinkContent component.
 */
export const ShareLinkContent: FC<ShareLinkContentProps> = ({ shareUrl, onClose }) => {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);

	/**
	 * Handles the click event for the copy button.
	 * Copies the `shareUrl` to the clipboard and provides visual feedback.
	 */
	const handleCopyClick = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy: ", err);
		}
	};

	return (
		<>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="4">
				{t("dialogs.shareLink.description")}
			</Text>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="4">
				<strong>Tip:</strong> Open the link and Bookmark the page to easily return to this
				layout later.
			</Text>
			<TextArea size={{ initial: "2", sm: "3" }} readOnly value={shareUrl} rows={8} />
			<Text as="p" size={{ initial: "2", sm: "3" }} mt="2" mb="4" align="right">
				<Link href={shareUrl} target="_blank" rel="noopener noreferrer">
					{t("dialogs.shareLink.openLink")}
					<ExternalLinkIcon className="ml-1 inline-block" />
				</Link>
			</Text>
			<Flex gap="2" mt="4" justify="end">
				<Dialog.Close asChild>
					<Button variant="soft" onClick={onClose}>
						{t("dialogs.shareLink.closeButton")}
					</Button>
				</Dialog.Close>
				<Button onClick={handleCopyClick}>
					{copied ? <CheckIcon /> : <CopyIcon />}
					{copied
						? t("dialogs.shareLink.copiedButton")
						: t("dialogs.shareLink.copyButton")}
				</Button>
			</Flex>
		</>
	);
};
