// src/components/AppDialog/ShareLinkDialog.tsx

import type { FC } from "react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Button, Flex, Link, Text, TextArea } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import AppDialog from "./AppDialog";

interface ShareLinkDialogProps {
	isOpen: boolean;
	shareUrl: string;
	onClose: () => void;
}

const ShareLinkDialog: FC<ShareLinkDialogProps> = ({ isOpen, shareUrl, onClose }) => {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);

	const handleCopyClick = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
		} catch (err) {
			console.error("Failed to copy: ", err);
		}
	};

	return (
		<AppDialog
			isOpen={isOpen}
			onClose={() => {
				onClose();
				setCopied(false); // Reset copied state when dialog closes
			}}
			titleKey="dialogs.titles.shareLink"
			content={
				<>
					<Text size={{ initial: "2", sm: "3" }} as="p" mb="4">
						{t("dialogs.shareLink.description")} <strong>Tip:</strong> Bookmark the link it to
						easily return to this layout later.
					</Text>
					<TextArea
						size={{ initial: "2", sm: "3" }}
						value={shareUrl}
						readOnly
						rows={8}
						// style={{ color: "var(--accent-track) !important" }}
					/>
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
							{copied ? t("dialogs.shareLink.copiedButton") : t("dialogs.shareLink.copyButton")}
						</Button>
					</Flex>
				</>
			}
		/>
	);
};

export default ShareLinkDialog;
