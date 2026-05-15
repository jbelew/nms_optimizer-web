import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useAnalytics } from "../../../hooks/useAnalytics/useAnalytics";
import { useDialog } from "../../../utils/system/dialogUtils";
import DynamicRadixIcon from "../Common/DynamicRadixIcon";

import "./WelcomeContent.scss";

/**
 * Props for the `WelcomeContent` component.
 */
interface WelcomeContentProps {
	/** Callback function triggered when the user clicks the "Get Started" button. */
	onClose: () => void;
}

/**
 * A component that renders the content for the initial "Welcome" dialog.
 *
 * @remarks
 * It provides a summary of the application's core features, key terminology,
 * and a direct link to the detailed instructions. It utilizes `react-i18next`
 * for localized messaging and `Trans` components for complex inline icons.
 *
 * @param {WelcomeContentProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered welcome content.
 *
 * @see {@link useDialog}
 * @see {@link DynamicRadixIcon}
 * @see {@link ./WelcomeContent.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <WelcomeContent onClose={markTutorialFn} />
 * ```
 */
const WelcomeContent: React.FC<WelcomeContentProps> = ({ onClose }) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { sendEvent } = useAnalytics();

	const iconSize = 16;
	const iconColor = "var(--accent-11)";

	// Track welcome screen view on mount
	React.useEffect(() => {
		sendEvent({
			action: "page_view",
			category: "engagement",
			nonInteraction: true,
			page: `${window.location.pathname}${window.location.search}#welcome`,
			page_location: window.location.href,
			page_title: "NMS Optimizer: Welcome",
		});
	}, [sendEvent]);

	/**
	 * Closes the welcome dialog and immediately opens the instructions dialog.
	 *
	 * @param {React.MouseEvent} e - The click event.
	 *
	 * @returns {void}
	 *
	 * @example Interaction handler
	 * ```typescript
	 * handleViewInstructions(event);
	 * ```
	 */
	const handleViewInstructions = (e: React.MouseEvent) => {
		e.preventDefault();
		onClose(); // Close the welcome dialog (marks as visited)
		openDialog("instructions");
	};

	return (
		<Flex className="welcomeContent text-sm sm:text-base" direction="column">
			<Text mb="2" weight="medium">
				{t("dialogs.welcome.description")}
			</Text>
			<ul className="welcomeContent__list pr-2">
				<li className="welcomeContent__item">
					<Trans
						components={{
							icon: (
								<DynamicRadixIcon
									color={iconColor}
									name="GearIcon"
									size={iconSize}
								/>
							),
							strong: <strong />,
						}}
						i18nKey="dialogs.welcome.item1"
					/>
				</li>
				<li className="welcomeContent__item">
					<Trans components={{ strong: <strong /> }} i18nKey="dialogs.welcome.item2" />
				</li>
				<li className="welcomeContent__item">
					<Trans components={{ strong: <strong /> }} i18nKey="dialogs.welcome.item3" />
				</li>
				<li className="welcomeContent__item">
					<Trans components={{ strong: <strong /> }} i18nKey="dialogs.welcome.item4" />
				</li>
				<li className="welcomeContent__item">
					<Trans
						components={{
							icon: (
								<DynamicRadixIcon
									color={iconColor}
									name="OpenInNewWindowIcon"
									size={iconSize}
								/>
							),
							strong: <strong />,
						}}
						i18nKey="dialogs.welcome.item5"
					/>
				</li>
				<li className="welcomeContent__item">
					<Trans
						components={{
							icon: (
								<DynamicRadixIcon
									color={iconColor}
									name="EyeOpenIcon"
									size={iconSize}
								/>
							),
							strong: <strong />,
						}}
						i18nKey="dialogs.welcome.item6"
					/>
				</li>
			</ul>

			<Flex align="start" gap="2" mt="2">
				<Text>
					<Trans
						components={{
							1: (
								<a
									className="welcomeContent__link"
									href="#"
									onClick={handleViewInstructions}
								/>
							),
						}}
						i18nKey="dialogs.welcome.viewInstructions"
					/>
				</Text>
			</Flex>
		</Flex>
	);
};

export default WelcomeContent;
