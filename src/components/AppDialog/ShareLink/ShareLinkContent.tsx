import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { Close as DialogClose } from "@radix-ui/react-dialog";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Button, Flex, Link, Text, TextArea } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

/**
 * Props for the `ShareLinkContent` component.
 */
interface ShareLinkContentProps {
	/** The full shareable URL string. **Must be a valid URL.** */
	shareUrl: string;
	/** Callback function to close the parent dialog. */
	onClose: () => void;
}

/**
 * A component that displays a shareable URL and provides copy-to-clipboard functionality.
 *
 * @remarks
 * This component uses a `TextArea` to display the (potentially long) serialized grid URL
 * and includes a feedback mechanism (checkmark icon) when the link is successfully copied.
 *
 * @param {ShareLinkContentProps} props - Component properties.
 * @returns {JSX.Element} The rendered share link UI.
 *
 * @see {@link ./ShareLinkContent.test.tsx Unit Tests}
 * @component
 * @category Components
 *
 * @example
 * ```tsx
 * <ShareLinkContent shareUrl="https://example.com" onClose={() => {}} />
 * // mounts ShareLinkContent with a shareable URL
 * ```
 */
export const ShareLinkContent: FC<ShareLinkContentProps> = ({ shareUrl, onClose }) => {
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

	/**
	 * Copies the `shareUrl` to the system clipboard and toggles the success state.
	 *
	 * @returns {Promise<void>}
	 * @example Interaction handler
	 * ```typescript
	 * handleCopyClick();
	 * ```
	 */
	const handleCopyClick = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);

			// Clear any existing timeout before setting a new one
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

	return (
		<>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="4">
				{t("dialogs.shareLink.description")}
			</Text>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="4">
				<strong>Tip:</strong> Open the link and Bookmark the page to easily return to this
				layout later.
			</Text>
			<TextArea
				id="share-url-input"
				name="shareUrl"
				ml="1"
				mr="1"
				size={{ initial: "2", sm: "3" }}
				readOnly
				value={shareUrl}
				rows={8}
			/>
			<Text as="p" size={{ initial: "2", sm: "3" }} mt="2" mb="4" align="right">
				<Link href={shareUrl} target="_blank" rel="noopener noreferrer">
					{t("dialogs.shareLink.openLink")}
					<ExternalLinkIcon className="ml-1 inline-block" />
				</Link>
			</Text>
			<Flex gap="2" mt="4" mb="2" justify="end">
				<DialogClose asChild>
					<Button variant="soft" onClick={onClose}>
						{t("dialogs.shareLink.closeButton")}
					</Button>
				</DialogClose>
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
