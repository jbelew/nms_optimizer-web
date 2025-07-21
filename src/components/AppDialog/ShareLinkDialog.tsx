// src/components/AppDialog/ShareLinkDialog.tsx

import type { FC } from "react";
import { useState } from "react";
import {
	CheckIcon,
	CopyIcon,
	Cross2Icon,
	ExternalLinkIcon,
	Share2Icon,
} from "@radix-ui/react-icons";
import { Button, Dialog, Flex, IconButton, Link, Text, TextArea } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

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
		<Dialog.Root
			open={isOpen}
			onOpenChange={(openStatus) => {
				if (!openStatus) {
					onClose();
					setCopied(false); // Reset copied state when dialog closes
				}
			}}
		>
			<Dialog.Content className="appDialog__content">
				<Dialog.Title className="text-xl heading-styled sm:text-2xl">
					<span className="flex items-center gap-2 text-xl heading-styled sm:text-2xl">
						<Share2Icon className="inline w-6 h-6" style={{ color: "var(--accent-9)" }} />
						{t("dialogs.titles.shareLink")}
					</span>
				</Dialog.Title>
				<Dialog.Description size="2" mb="4">
					<Text size={{ initial: "2", sm: "3" }} as="p" mb="4">
						{t("dialogs.shareLink.description")}
					</Text>
					<TextArea value={shareUrl} variant="surface" color="cyan" readOnly rows={8} />
					<Text as="p" size={{ initial: "2", sm: "3" }} mt="2" mb="4" align="right">
						<Link href={shareUrl} target="_blank" rel="noopener noreferrer">
							{t("dialogs.shareLink.openLink")}
							<ExternalLinkIcon className="inline-block ml-1" />
						</Link>
					</Text>
				</Dialog.Description>
				<Flex gap="2" mt="4" justify="end">
					<Dialog.Close>
						<Button variant="soft" onClick={onClose}>
							{t("dialogs.shareLink.closeButton")}
						</Button>
					</Dialog.Close>
					<Button onClick={handleCopyClick}>
						{copied ? <CheckIcon /> : <CopyIcon />}
						{copied ? t("dialogs.shareLink.copiedButton") : t("dialogs.shareLink.copyButton")}
					</Button>
				</Flex>
				<Dialog.Close>
					<IconButton
						variant="soft"
						color="cyan"
						size="1"
						className="appDialog__close"
						aria-label="Close dialog"
					>
						<Cross2Icon />
					</IconButton>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Root>
	);
};

export default ShareLinkDialog;
