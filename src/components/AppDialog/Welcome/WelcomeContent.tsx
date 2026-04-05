import React from "react";
import { Button, Flex, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useDialog } from "../../../context/dialog-utils";
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
 * It provides a summary of the application's core features, key terminology,
 * and a direct link to the detailed instructions. It utilizes `react-i18next`
 * for localized messaging and `Trans` components for complex inline icons.
 *
 * @param {WelcomeContentProps} props - Component properties.
 * @returns {JSX.Element} The rendered welcome content.
 *
 * @see {@link useDialog}
 * @see {@link DynamicRadixIcon}
 * @see {@link ./WelcomeContent.test.tsx Unit Tests}
 * @category Components
 *
 * @example
 * ```tsx
 * <WelcomeContent onClose={markTutorialFn} /> // mounts welcome dialog content
 * ```
 */
const WelcomeContent: React.FC<WelcomeContentProps> = ({ onClose }) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();

	const iconSize = 16;
	const iconColor = "var(--accent-11)";

	/**
	 * Closes the welcome dialog and immediately opens the instructions dialog.
	 *
	 * @param {React.MouseEvent} e - The click event.
	 * @example
	 */
	const handleViewInstructions = (e: React.MouseEvent) => {
		e.preventDefault();
		onClose(); // Close the welcome dialog (marks as visited)
		openDialog("instructions");
	};

	return (
		<Flex direction="column" className="welcomeContent text-sm sm:text-base">
			<Text mb="2" weight="medium">
				{t("dialogs.welcome.description")}
			</Text>
			<ul className="welcomeContent__list pr-2">
				<li className="welcomeContent__item">
					<Trans
						i18nKey="dialogs.welcome.item1"
						components={{
							strong: <strong />,
							icon: (
								<DynamicRadixIcon
									name="GearIcon"
									size={iconSize}
									color={iconColor}
								/>
							),
						}}
					/>
				</li>
				<li className="welcomeContent__item">
					<Trans i18nKey="dialogs.welcome.item2" components={{ strong: <strong /> }} />
				</li>
				<li className="welcomeContent__item">
					<Trans i18nKey="dialogs.welcome.item3" components={{ strong: <strong /> }} />
				</li>
				<li className="welcomeContent__item">
					<Trans i18nKey="dialogs.welcome.item4" components={{ strong: <strong /> }} />
				</li>
				<li className="welcomeContent__item">
					<Trans
						i18nKey="dialogs.welcome.item5"
						components={{
							strong: <strong />,
							icon: (
								<DynamicRadixIcon
									name="OpenInNewWindowIcon"
									size={iconSize}
									color={iconColor}
								/>
							),
						}}
					/>
				</li>
				<li className="welcomeContent__item">
					<Trans
						i18nKey="dialogs.welcome.item6"
						components={{
							strong: <strong />,
							icon: (
								<DynamicRadixIcon
									name="EyeOpenIcon"
									size={iconSize}
									color={iconColor}
								/>
							),
						}}
					/>
				</li>
			</ul>

			<Flex gap="2" mt="2" mb="4" align="start">
				<Text>
					<Trans
						i18nKey="dialogs.welcome.viewInstructions"
						components={{
							1: (
								<a
									href="#"
									onClick={handleViewInstructions}
									className="welcomeContent__link"
								/>
							),
						}}
					/>
				</Text>
			</Flex>

			<Flex justify="end">
				<Button onClick={onClose} mb="3" className="cursor-pointer">
					{t("dialogs.welcome.getStarted")}
				</Button>
			</Flex>
		</Flex>
	);
};

export default WelcomeContent;
