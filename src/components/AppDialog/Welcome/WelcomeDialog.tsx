import React from "react";
import { Button, Link, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import DynamicRadixIcon from "@/components/AppDialog/Common/DynamicRadixIcon";
import { trackVirtualPageView } from "@/utils/analytics/pageView";
import { useDialog } from "@/utils/system/dialogUtils";

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

	const iconSize = 16;
	const iconColor = "var(--accent-11)";

	// Track welcome screen view when opened
	React.useEffect(() => {
		if (!isOpen) {
			return;
		}

		trackVirtualPageView({
			appName: t("appName", { defaultValue: "NMS Optimizer" }),
			hash: "welcome",
			topic: t("dialogs.titles.welcome", { defaultValue: "Welcome" }),
		});
	}, [isOpen, t]);

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
		<>
			<Text
				as="p"
				weight="medium"
			>
				{t("dialogs.welcome.description")}
			</Text>
			<ul className="flex list-disc flex-col gap-1 pl-6 marker:text-(--accent-11)">
				<li>
					<Trans
						components={{
							icon: (
								<DynamicRadixIcon
									color={iconColor}
									name="GearIcon"
									size={iconSize}
								/>
							),
							strong: <strong className="font-bold" />,
						}}
						i18nKey="dialogs.welcome.item1"
					/>
				</li>
				<li>
					<Trans
						components={{ strong: <strong className="font-bold" /> }}
						i18nKey="dialogs.welcome.item2"
					/>
				</li>
				<li>
					<Trans
						components={{ strong: <strong className="font-bold" /> }}
						i18nKey="dialogs.welcome.item3"
					/>
				</li>
				<li>
					<Trans
						components={{ strong: <strong className="font-bold" /> }}
						i18nKey="dialogs.welcome.item4"
					/>
				</li>
				<li>
					<Trans
						components={{
							icon: (
								<DynamicRadixIcon
									color={iconColor}
									name="OpenInNewWindowIcon"
									size={iconSize}
								/>
							),
							strong: <strong className="font-bold" />,
						}}
						i18nKey="dialogs.welcome.item5"
					/>
				</li>
				<li>
					<Trans
						components={{
							icon: (
								<DynamicRadixIcon
									color={iconColor}
									name="EyeOpenIcon"
									size={iconSize}
								/>
							),
							strong: <strong className="font-bold" />,
						}}
						i18nKey="dialogs.welcome.item6"
					/>
				</li>
			</ul>

			<Text as="p">
				<Trans
					components={{
						1: (
							<Link
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
		</>
	);

	const footer = <Button onClick={onClose}>{t("dialogs.welcome.getStarted")}</Button>;

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
