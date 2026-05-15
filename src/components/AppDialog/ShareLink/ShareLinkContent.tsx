import type { FC } from "react";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { Link, Text, TextArea } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

/**
 * Props for the `ShareLinkContent` component.
 */
interface ShareLinkContentProps {
	/** The full shareable URL string. **Must be a valid URL.** */
	shareUrl: string;
}

/**
 * A component that displays a shareable URL and provides copy-to-clipboard functionality.
 *
 * @remarks
 * This component uses a `TextArea` to display the (potentially long) serialized grid URL
 * and includes a feedback mechanism (checkmark icon) when the link is successfully copied.
 *
 * @param {ShareLinkContentProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered share link UI.
 *
 * @see {@link ./ShareLinkContent.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShareLinkContent shareUrl="https://example.com" />
 * // mounts ShareLinkContent with a shareable URL
 * ```
 */
export const ShareLinkContent: FC<ShareLinkContentProps> = ({ shareUrl }) => {
	const { t } = useTranslation();

	return (
		<>
			<Text as="p" mb="3" size={{ initial: "2", sm: "3" }}>
				{t("dialogs.shareLink.description")}
			</Text>
			<Text as="p" mb="3" size={{ initial: "2", sm: "3" }}>
				<Trans i18nKey="dialogs.shareLink.tip" />
			</Text>
			<TextArea
				id="share-url-input"
				name="shareUrl"
				readOnly
				rows={8}
				size={{ initial: "2", sm: "3" }}
				value={shareUrl}
			/>
			<Text align="right" as="p" mb="2" mt="2" size={{ initial: "2", sm: "3" }}>
				<Link href={shareUrl} rel="noopener noreferrer" target="_blank">
					{t("dialogs.shareLink.openLink")}
					<ExternalLinkIcon className="ml-1 inline-block" />
				</Link>
			</Text>
		</>
	);
};
