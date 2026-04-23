/**
 * Application update notification module.
 *
 * @remarks
 * This module provides the `UpdatePrompt` component, which alerts users
 * when a new service worker version is ready to be activated.
 *
 * @see {@link UpdatePrompt}
 * @see {@link ./UpdatePrompt.test.tsx Unit Tests}
 * @see {@link ./UpdatePrompt.stories.tsx Storybook}
 *
 * @category Components
 */

import type { FC } from "react";
import { lazy, Suspense } from "react";
import { Close as DialogClose } from "@radix-ui/react-dialog";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";

const AppDialog = lazy(() => import("../AppDialog/Base/AppDialog"));

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
 * @remarks
 * It provides a clear call-to-action to refresh the page and activate the new
 * service worker. On desktop viewports, it automatically focuses the "Refresh Now"
 * button for convenience.
 *
 * @param {UpdatePromptProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered update prompt modal.
 *
 * @see {@link AppDialog}
 * @see {@link useBreakpoint}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <UpdatePrompt isOpen={true} onRefresh={doUpdate} onDismiss={hideFn} />
 * // renders update dialog
 * ```
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
				<DialogClose asChild>
					<Button variant="soft" onClick={onDismiss}>
						{t("dialogs.updatePrompt.later", { defaultValue: "Later" })}
					</Button>
				</DialogClose>
				<DialogClose asChild>
					<Button onClick={onRefresh} autoFocus={isDesktop}>
						{t("dialogs.updatePrompt.refreshNow", { defaultValue: "Refresh Now" })}
					</Button>
				</DialogClose>
			</Flex>
		</>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				isOpen={isOpen}
				titleKey="dialogs.titles.updatePrompt"
				title={t("dialogs.titles.updatePrompt", { defaultValue: "Update Available" })}
				onClose={onDismiss}
				content={content}
			/>
		</Suspense>
	);
};

export default UpdatePrompt;
