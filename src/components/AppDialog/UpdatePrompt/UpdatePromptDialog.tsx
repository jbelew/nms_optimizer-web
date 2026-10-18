/**
 * Application update notification dialog and lifecycle listener module.
 *
 * @remarks
 * Consolidates `"new-version-available"` event listening, dynamic `/version.json`
 * freshness verification via `verifyStagedUpdateFreshness`, analytics telemetry,
 * and **Staged Worker** activation into a single dialog module under
 * `src/components/AppDialog/UpdatePrompt/`.
 *
 * @see {@link UpdatePromptDialog}
 * @see {@link UpdatePrompt}
 * @see {@link ./UpdatePromptDialog.test.tsx Unit Tests}
 * @see {@link ./UpdatePromptDialog.stories.tsx Storybook}
 *
 * @category Components
 */

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { Button, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { formatDocumentTitle } from "@shared/page-metadata.js";

/**
 * Props for the {@link UpdatePrompt} presentation component.
 *
 * @category Components
 */
interface UpdatePromptProps {
	/** Whether the update notification dialog is visible. */
	isOpen: boolean;
	/** Callback function to dismiss the update prompt without updating. */
	onDismiss: () => void;
	/** Callback function to trigger the application reload/update. */
	onRefresh: () => void;
}

/**
 * Modal dialog that notifies the user when a new application version is available.
 *
 * @remarks
 * Renders an {@link AppDialog} with actions to dismiss ("Later") or activate
 * the **Staged Worker** immediately ("Refresh Now").
 *
 * @param props - Component properties.
 *
 * @returns The rendered update prompt dialog.
 *
 * @see {@link UpdatePromptProps}
 * @see {@link AppDialog}
 * @see {@link UpdatePromptDialog}
 * @see {@link ./UpdatePromptDialog.test.tsx Unit Tests}
 * @see {@link ./UpdatePromptDialog.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <UpdatePrompt isOpen={true} onDismiss={handleDismiss} onRefresh={handleRefresh} />
 * // renders UpdatePrompt modal
 * ```
 */
export const UpdatePrompt: FC<UpdatePromptProps> = ({ isOpen, onDismiss, onRefresh }) => {
	const { t } = useTranslation();

	const content = (
		<Text
			as="p"
			mb="2"
			size={{ initial: "2", sm: "3" }}
		>
			{t("dialogs.updatePrompt.description", {
				defaultValue:
					"A new version of the application is available. Refresh now to get the latest features and bug fixes.",
			})}
		</Text>
	);

	const footer = (
		<div className="flex justify-end gap-2">
			<Button
				onClick={onDismiss}
				variant="soft"
			>
				{t("dialogs.updatePrompt.later", { defaultValue: "Later" })}
			</Button>
			<Button onClick={onRefresh}>
				{t("dialogs.updatePrompt.refreshNow", { defaultValue: "Refresh Now" })}
			</Button>
		</div>
	);

	return (
		<AppDialog
			content={content}
			footer={footer}
			isOpen={isOpen}
			onClose={onDismiss}
			title={t("dialogs.titles.updatePrompt", { defaultValue: "Update Available" })}
			titleKey="dialogs.titles.updatePrompt"
		/>
	);
};

/**
 * Orchestrates the in-app PWA update notification flow.
 *
 * @remarks
 * Listens for the `"new-version-available"` custom event on `window`, dynamically
 * imports {@link import('@/utils/system/setupServiceWorker').verifyStagedUpdateFreshness}
 * to keep `setupServiceWorker` out of the initial entry bundle, emits analytics
 * telemetry when an update prompt is displayed, and delegates confirmation to
 * {@link import('@/utils/system/setupServiceWorker').applyStagedServiceWorkerUpdate}.
 *
 * @returns The rendered {@link UpdatePrompt} dialog, or `null` when no verified update is pending.
 *
 * @see {@link UpdatePrompt}
 * @see {@link useAnalytics}
 * @see {@link ./UpdatePromptDialog.test.tsx Unit Tests}
 * @see {@link ./UpdatePromptDialog.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <UpdatePromptDialog />
 * // mounts update listener and renders dialog when a verified update arrives
 * ```
 */
export const UpdatePromptDialog: FC = () => {
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();
	const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
	const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

	useEffect(() => {
		const handleNewVersion = async (event: Event) => {
			if (!(event instanceof CustomEvent)) return;

			const updateSW =
				typeof event.detail === "function" ?
					(event.detail as (reloadPage?: boolean) => Promise<void>)
				:	undefined;

			const openPrompt = () => {
				updateSWRef.current = updateSW ?? (async () => {});
				setShowUpdatePrompt(true);
			};

			try {
				const { verifyStagedUpdateFreshness } =
					await import("@/utils/system/setupServiceWorker");
				const shouldPrompt = await verifyStagedUpdateFreshness(updateSW);

				if (shouldPrompt) {
					openPrompt();
				}
			} catch {
				openPrompt();
			}
		};

		window.addEventListener("new-version-available", handleNewVersion);

		return () => {
			window.removeEventListener("new-version-available", handleNewVersion);
		};
	}, []);

	useEffect(() => {
		if (showUpdatePrompt) {
			const appName = t("appName", { defaultValue: "NMS Optimizer" });
			const updateTopic = t("dialogs.titles.updatePrompt", {
				defaultValue: "Update Available",
			});
			const pageTitle = formatDocumentTitle(updateTopic, appName);

			sendEvent({
				action: "page_view",
				category: "engagement",
				nonInteraction: true,
				page: `${window.location.pathname}${window.location.search}#update`,
				page_location: window.location.href,
				page_title: pageTitle,
			});
		}
	}, [showUpdatePrompt, sendEvent, t]);

	const handleRefresh = () => {
		void import("@/utils/system/setupServiceWorker")
			.then(({ applyStagedServiceWorkerUpdate }) =>
				applyStagedServiceWorkerUpdate(updateSWRef.current),
			)
			.catch(() => {
				window.location.reload();
			});
	};

	const handleDismissUpdatePrompt = () => {
		setShowUpdatePrompt(false);
	};

	if (!showUpdatePrompt) {
		return null;
	}

	return (
		<UpdatePrompt
			isOpen={showUpdatePrompt}
			onDismiss={handleDismissUpdatePrompt}
			onRefresh={handleRefresh}
		/>
	);
};
