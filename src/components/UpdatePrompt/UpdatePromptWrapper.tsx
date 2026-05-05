import { FC, lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";

import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useUpdateCheck } from "../../hooks/useUpdateCheck/useUpdateCheck";

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
 * @returns {JSX.Element | null} The rendered update prompt, or `null` if no update is available.
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
	const { sendEvent } = useAnalytics();
	const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
	const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

	// Centralized update prompt tracking
	useEffect(() => {
		if (showUpdatePrompt) {
			sendEvent({
				category: "engagement",
				action: "page_view",
				page_title: "NMS Optimizer: Update Available",
				page_location: window.location.href,
				page: `${window.location.pathname}${window.location.search}#update`,
				nonInteraction: true,
			});
		}
	}, [showUpdatePrompt, sendEvent]);

	useUpdateCheck(
		useCallback((updateSW: (reloadPage?: boolean) => Promise<void>) => {
			updateSWRef.current = updateSW;
			setShowUpdatePrompt(true);
		}, [])
	);

	/**
	 * Triggers a hard reload to activate the newly installed service worker.
	 *
	 * @remarks
	 * Calls the stored `updateServiceWorker` function provided by the
	 * `new-version-available` event.
	 *
	 * A 2.5s fallback timeout is implemented to ensure a page reload occurs
	 * even if the service worker activation fails to trigger the browser's
	 * automatic reload or the `controllerchange` event.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * handleRefresh();
	 * ```
	 */
	const handleRefresh = () => {
		if (updateSWRef.current) {
			updateSWRef
				.current(true)
				.then(() => {
					// Fallback reload if it doesn't happen automatically in 2.5 seconds
					setTimeout(() => {
						window.location.reload();
					}, 2500);
				})
				.catch(() => {
					window.location.reload();
				});
		} else {
			window.location.reload();
		}
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
				onRefresh={handleRefresh}
				onDismiss={handleDismissUpdatePrompt}
			/>
		</Suspense>
	);
};

export default UpdatePromptWrapper;
