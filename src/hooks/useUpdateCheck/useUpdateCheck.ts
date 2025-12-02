import { useEffect } from "react";

/**
 * Hook to check for application updates and handle the "new-version-available" event.
 * It fetches /version.json to verify if the available update is actually new.
 *
 * @param onUpdateAvailable - Callback to execute when a valid update is available. Receives the updateSW function.
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

				console.log(`Current build: ${currentBuildDate}, Latest build: ${latestBuildDate}`);

				if (latestBuildDate !== currentBuildDate) {
					onUpdateAvailable(event.detail);
				} else {
					console.log(
						"Update prompt suppressed: Server version matches current version."
					);
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
