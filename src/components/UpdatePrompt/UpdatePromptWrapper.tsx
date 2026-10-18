import type { FC } from "react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type {
	activateLatestServiceWorker,
	evictStaleServiceWorkers,
} from "@/utils/system/setupServiceWorker";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useUpdateCheck } from "@/hooks/useUpdateCheck/useUpdateCheck";
import { formatDocumentTitle } from "@shared/page-metadata.js";

const UpdatePrompt = lazy(() => import("./UpdatePrompt"));

/**
 * A wrapper component that manages the application update flow.
 *
 * @remarks
 * This component listens for service worker update events via `useUpdateCheck`.
 * When an update is available, it lazy-loads the `UpdatePrompt` dialog and
 * manages its display and analytics tracking. This approach optimizes the
 * critical path by deferring the loading of update-related UI and styles.
 *
 * @returns The rendered update prompt, or `null` if no update is available.
 *
 * @see {@link useUpdateCheck}
 * @see {@link useAnalytics}
 * @see {@link UpdatePrompt}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <UpdatePromptWrapper />
 * ```
 */
export const UpdatePromptWrapper: FC = () => {
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();
	const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
	const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

	// Centralized update prompt tracking
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

	useUpdateCheck(
		useCallback((updateSW: (reloadPage?: boolean) => Promise<void>) => {
			updateSWRef.current = updateSW;
			setShowUpdatePrompt(true);
		}, []),
	);

	/**
	 * Triggers a hard reload to activate the latest service worker.
	 *
	 * @remarks
	 * Dynamically imports and calls {@link activateLatestServiceWorker} to ensure
	 * that if newer releases have landed on the server since this dialog was opened,
	 * the app skips directly to the latest version while keeping `setupServiceWorker`
	 * out of the initial entry bundle.
	 *
	 * A 2.5s fallback timeout is implemented to ensure a page reload occurs
	 * even if the service worker activation fails to trigger the browser's
	 * automatic reload or the `controllerchange` event.
	 *
	 * @returns Side-effects only.
	 *
	 * @see {@link evictStaleServiceWorkers}
	 *
	 * @example
	 * ```ts
	 * handleRefresh();
	 * ```
	 */
	const handleRefresh = () => {
		void import("@/utils/system/setupServiceWorker")
			.then(({ activateLatestServiceWorker, evictStaleServiceWorkers }) =>
				activateLatestServiceWorker(updateSWRef.current)
					.then(() => {
						// Fallback reload if activation does not trigger controlling reload within 2.5s
						setTimeout(() => {
							window.location.reload();
						}, 2500);
					})
					.catch(() => {
						void evictStaleServiceWorkers().finally(() => {
							window.location.reload();
						});
					}),
			)
			.catch(() => {
				window.location.reload();
			});
	};

	/**
	 * Hides the application update notification.
	 *
	 * @example
	 * handleDismissUpdatePrompt();
	 */
	const handleDismissUpdatePrompt = () => {
		setShowUpdatePrompt(false);
	};

	if (!showUpdatePrompt) {
		return null;
	}

	return (
		<Suspense fallback={null}>
			<UpdatePrompt
				isOpen={showUpdatePrompt}
				onDismiss={handleDismissUpdatePrompt}
				onRefresh={handleRefresh}
			/>
		</Suspense>
	);
};
