import React from "react";
import { Button, Flex, Link, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import DynamicRadixIcon from "@/components/AppDialog/Common/DynamicRadixIcon";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useDialog } from "@/utils/system/dialogUtils";
import { formatDocumentTitle } from "@shared/page-metadata.js";

import "./WelcomeDialog.scss";

/**
 * Props for the {@link WelcomeDialog} component.
 *
 * @category Components
 */
interface WelcomeDialogProps {
	/** Whether the welcome dialog is currently open. */
	isOpen: boolean;
	/** Callback function triggered when the user closes the dialog or clicks "Get Started". */
	onClose: () => void;
}

/**
 * A modal dialog component that renders the initial "Welcome" onboarding experience.
 *
 * @remarks
 * It provides a summary of the application's core features, key terminology,
 * and a direct link to the detailed instructions. It utilizes `react-i18next`
 * for localized messaging, `Trans` components for complex inline icons, and
 * {@link AppDialog} for modal framing and footer actions.
 *
 * @see {@link WelcomeDialogProps}
 * @see {@link AppDialog}
 * @see {@link useDialog}
 * @see {@link DynamicRadixIcon}
 * @see {@link ./WelcomeDialog.test.tsx Unit Tests}
 * @see {@link ./WelcomeDialog.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <WelcomeDialog isOpen={showWelcome} onClose={handleCloseWelcome} />
 * // mounts WelcomeDialog
 * ```
 */
const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { sendEvent } = useAnalytics();

	const iconSize = 16;
	const iconColor = "var(--accent-11)";

	// Track welcome screen view when opened
	React.useEffect(() => {
		if (!isOpen) {
			return;
		}

		const appName = t("appName", { defaultValue: "NMS Optimizer" });
		const welcomeTopic = t("dialogs.titles.welcome", { defaultValue: "Welcome" });
		const pageTitle = formatDocumentTitle(welcomeTopic, appName);

		sendEvent({
			action: "page_view",
			category: "engagement",
			nonInteraction: true,
			page: `${window.location.pathname}${window.location.search}#welcome`,
			page_location: window.location.href,
			page_title: pageTitle,
		});
	}, [isOpen, sendEvent, t]);

	/**
	 * Closes the welcome dialog and immediately opens the instructions dialog.
	 *
	 * @param e - The click event.
	 *
	 * @returns Side-effects only.
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

	const content = (
		<Flex
			className="welcomeContent text-sm sm:text-base"
			direction="column"
		>
			<Text
				mb="2"
				weight="medium"
			>
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
					<Trans
						components={{ strong: <strong /> }}
						i18nKey="dialogs.welcome.item2"
					/>
				</li>
				<li className="welcomeContent__item">
					<Trans
						components={{ strong: <strong /> }}
						i18nKey="dialogs.welcome.item3"
					/>
				</li>
				<li className="welcomeContent__item">
					<Trans
						components={{ strong: <strong /> }}
						i18nKey="dialogs.welcome.item4"
					/>
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

			<Flex
				gap="2"
				mt="2"
			>
				<Text mb="2">
					<Trans
						components={{
							1: (
								<Link
									className="welcomeContent__link"
									href="/instructions"
									onClick={handleViewInstructions}
									underline="always"
									weight="medium"
								>
									{t("dialogs.titles.instructions")}
								</Link>
							),
						}}
						i18nKey="dialogs.welcome.viewInstructions"
					/>
				</Text>
			</Flex>
		</Flex>
	);

	const footer = (
		<div className="flex justify-end gap-2">
			<Button
				className="cursor-pointer"
				mb="1"
				onClick={onClose}
			>
				{t("dialogs.welcome.getStarted")}
			</Button>
		</div>
	);

	return (
		<AppDialog
			content={content}
			footer={footer}
			isOpen={isOpen}
			onClose={onClose}
			title={t("dialogs.titles.welcome")}
			titleKey="dialogs.titles.welcome"
		/>
	);
};

export default WelcomeDialog;
