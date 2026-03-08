import type { FC } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import AppDialog from "../AppDialog/AppDialog";

/**
 * Props for the `UpdatePrompt` component.
 */
interface UpdatePromptProps {
	/** Whether the update notification dialog is visible. */
	isOpen: boolean;
	/** Callback function to trigger the application reload/update. */
	onRefresh: () => void;
	/** Callback function to dismiss the update prompt without updating. */
	onDismiss: () => void;
}

/**
 * A modal dialog that notifies the user when a new application version is available.
 *
 * It provides a clear call-to-action to refresh the page and activate the new
 * service worker. On desktop viewports, it automatically focuses the "Refresh Now"
 * button for convenience.
 *
 * @param {UpdatePromptProps} props - Component properties.
 * @returns {JSX.Element} The rendered update prompt modal.
 *
 * @example
 * <UpdatePrompt isOpen={true} onRefresh={doUpdate} onDismiss={hideFn} />
 */
const UpdatePrompt: FC<UpdatePromptProps> = ({ isOpen, onRefresh, onDismiss }) => {
	const { t } = useTranslation();
	const isDesktop = useBreakpoint("1024px");

	const content = (
		<>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="2">
				{t("dialogs.updatePrompt.description", {
					defaultValue:
						"A new version of the application is available. Refresh now to get the latest features and bug fixes.",
				})}
			</Text>

			<Flex gap="3" mt="6" mb="2" justify="end">
				<Dialog.Close asChild>
					<Button variant="soft" onClick={onDismiss}>
						{t("dialogs.updatePrompt.later", { defaultValue: "Later" })}
					</Button>
				</Dialog.Close>
				<Dialog.Close asChild>
					<Button onClick={onRefresh} autoFocus={isDesktop}>
						{t("dialogs.updatePrompt.refreshNow", { defaultValue: "Refresh Now" })}
					</Button>
				</Dialog.Close>
			</Flex>
		</>
	);

	return (
		<AppDialog
			isOpen={isOpen}
			titleKey="dialogs.titles.updatePrompt"
			title={t("dialogs.titles.updatePrompt", { defaultValue: "Update Available" })}
			onClose={onDismiss}
			content={content}
		/>
	);
};

export default UpdatePrompt;
