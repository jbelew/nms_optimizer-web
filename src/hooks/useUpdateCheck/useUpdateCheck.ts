import { useEffect } from "react";

/**
 * Custom hook for detecting and validating application updates via Service Worker.
 *
 * @remarks
 * It listens for the `new-version-available` event dispatched by the service
 * worker. To avoid unnecessary prompts (e.g., when assets change but the app
 * version doesn't), it fetches `/version.json` and compares the `latestBuildDate`
 * with the `__BUILD_DATE__` defined at compile time.
 *
 * If a mismatch is detected, the provided callback is executed with the `updateSW`
 * function to trigger the update process.
 *
 * @param {(updateSW: (reloadPage?: boolean) => Promise<void>) => void} onUpdateAvailable - Callback function that receives the `updateSW` function from the service worker.
 *
 * @returns {void} Side-effects only; registers event listeners.
 *
 * @see {@link ./useUpdateCheck.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const App = () => {
 *   const [showPrompt, setShowPrompt] = useState(false);
 *   const updateFn = useRef<() => void>();
 *
 *   useUpdateCheck((updateSW) => {
 *     updateFn.current = updateSW;
 *     setShowPrompt(true);
 *   });
 *
 *   return (
 *     {showPrompt && (
 *       <UpdateDialog onConfirm={() => updateFn.current?.(true)} />
 *     )}
 *   );
 * };
 * ```
 */
export const useUpdateCheck = (
	onUpdateAvailable: (updateSW: (reloadPage?: boolean) => Promise<void>) => void
) => {
	useEffect(() => {
		const handleNewVersion = async (event: Event) => {
			if (!(event instanceof CustomEvent)) return;

			try {
				const response = await fetch("/version.json", { cache: "no-store" });

				if (!response.ok) {
					throw new Error("Failed to fetch version.json");
				}

				const data = await response.json();
				const latestBuildDate = data.buildDate;
				const currentBuildDate = __BUILD_DATE__;

				if (latestBuildDate !== currentBuildDate) {
					onUpdateAvailable(event.detail);
				}
			} catch (error) {
				console.error("Error checking version:", error);

				// Fail safe: show prompt if we can't verify
				if (event instanceof CustomEvent) {
					onUpdateAvailable(event.detail);
				}
			}
		};

		window.addEventListener("new-version-available", handleNewVersion);

		return () => {
			window.removeEventListener("new-version-available", handleNewVersion);
		};
	}, [onUpdateAvailable]);
};
