// src/components/AppDialog/ShareLinkDialog.tsx
import type { FC } from "react";
import { CheckIcon, CopyIcon, Share2Icon } from "@radix-ui/react-icons";
import { Button, Dialog, Flex, Text, TextArea } from "@radix-ui/themes";
import { useState } from "react";
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
			<Dialog.Content maxWidth="500px">
				<Dialog.Title className="text-xl heading-styled sm:text-2xl">
					<Share2Icon className="inline w-6 h-6" style={{ color: "var(--accent-9)" }} />{" "}
					{t("dialogs.titles.shareLink")}
				</Dialog.Title>
				<Dialog.Description size="2" mb="4">
					<Text as="p" mb="4">
						{t("dialogs.shareLink.description")}
					</Text>
					<TextArea value={shareUrl} variant="surface" color="cyan" readOnly rows={6} />
				</Dialog.Description>
				<Flex gap="3" mt="4" justify="end">
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
			</Dialog.Content>
		</Dialog.Root>
	);
};

export default ShareLinkDialog;
