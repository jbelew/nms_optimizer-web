import { useEffect } from "react";

import { Logger } from "@/utils/system/monitoring";

/**
 * Payload interface for version information served from `/version.json`.
 */
interface VersionPayload {
	/** ISO timestamp when the application was built. */
	buildDate?: string;
	/** Semantic version string of the release. */
	version?: string;
}

/**
 * Custom hook for detecting application updates via Service Worker.
 *
 * @remarks
 * Listens for the `new-version-available` event dispatched by the service
 * worker registration when a new service worker has installed and is waiting.
 * Before notifying the user, it verifies against `/version.json` that the application
 * running in the client is not already at the latest version.
 *
 * If the client already matches the server build date/version, the update prompt is
 * suppressed, and the waiting service worker is silently commanded to skip waiting
 * so that it activates without lingering or re-prompting the user.
 *
 * If an actual update is available or if verification fails (offline fail-safe),
 * it invokes the provided `onUpdateAvailable` callback with the `updateSW` function.
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
 *     showPrompt && (
 *       <UpdateDialog onConfirm={() => updateFn.current?.(true)} />
 *     )
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

			const updateSW =
				typeof event.detail === "function"
					? (event.detail as (reloadPage?: boolean) => Promise<void>)
					: undefined;

			try {
				const response = await fetch("/version.json", { cache: "no-store" });

				if (!response.ok) {
					throw new Error(`Failed to fetch version.json: HTTP ${response.status}`);
				}

				const data = (await response.json()) as VersionPayload;

				if (!data || (!data.buildDate && !data.version)) {
					throw new Error("version.json response missing buildDate and version fields");
				}

				const latestBuildDate = data.buildDate;
				const currentBuildDate =
					typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : undefined;

				const latestVersion = data.version;
				const currentVersion =
					typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : undefined;

				const isDifferentVersion =
					Boolean(
						latestBuildDate && currentBuildDate && latestBuildDate !== currentBuildDate
					) ||
					Boolean(latestVersion && currentVersion && latestVersion !== currentVersion);

				if (isDifferentVersion) {
					onUpdateAvailable(updateSW ?? (async () => {}));
				} else {
					Logger.info("Update prompt suppressed: running client matches latest release", {
						currentBuildDate,
						currentVersion,
						latestBuildDate,
						latestVersion,
					});

					// Silently activate waiting worker so it clears waiting state without page reload
					if (updateSW) {
						void updateSW(false);
					}
				}
			} catch (error) {
				Logger.error("Failed to verify version freshness; falling back to prompt", {
					error,
				});
				onUpdateAvailable(updateSW ?? (async () => {}));
			}
		};

		window.addEventListener("new-version-available", handleNewVersion);

		return () => {
			window.removeEventListener("new-version-available", handleNewVersion);
		};
	}, [onUpdateAvailable]);
};
