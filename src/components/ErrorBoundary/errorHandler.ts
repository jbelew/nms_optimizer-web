import { ErrorInfo } from "react";
import { captureException as SentryCaptureException } from "@sentry/react";

import { sendEvent } from "../../utils/analytics";
import { safeClear } from "../../utils/storage";

/**
 * Executes a nuclear recovery strategy after an uncaught application error.
 *
 * This function performs the following actions to ensure a clean state for recovery:
 * 1. Logs the error to the console and Sentry.
 * 2. Purges all `localStorage` data.
 * 3. Unregisters all active Service Workers.
 * 4. Deletes all browser caches.
 * 5. Attempts to delete all IndexedDB databases.
 * 6. Clears `sessionStorage`.
 * 7. Reports the event to Google Analytics with debug metadata.
 *
 * @param {Error} error - The caught exception. **Must not be null.**
 * @param {ErrorInfo} [errorInfo] - The React component stack metadata.
 * @returns {void}
 *
 * @example
 * handleError(new Error("Fatal Crash"), { componentStack: "..." });
 */
export const handleError = (error: Error, errorInfo?: ErrorInfo) => {
	console.error("Uncaught error:", error, errorInfo);

	// Capture the error in Sentry
	SentryCaptureException(error, {
		extra: {
			componentStack: errorInfo?.componentStack,
		},
	});

	// Attempt to clear localStorage, but don't let storage errors prevent recovery
	const localStorageCleared = safeClear();

	// Clear service workers to force fresh code fetch
	if ("serviceWorker" in navigator && navigator.serviceWorker) {
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			registrations.forEach((reg) => {
				reg.unregister();
				console.log("ErrorBoundary: Unregistered service worker.");
			});
		});
	}

	// Clear service worker caches
	if ("caches" in window) {
		caches.keys().then((cacheNames) => {
			cacheNames.forEach((cacheName) => {
				caches.delete(cacheName);
				console.log(`ErrorBoundary: Deleted cache "${cacheName}".`);
			});
		});
	}

	// Clear IndexedDB
	if ("indexedDB" in window && typeof indexedDB.databases === "function") {
		try {
			indexedDB
				.databases()
				.then((databases) => {
					databases.forEach((db) => {
						if (db.name) {
							indexedDB.deleteDatabase(db.name);
							console.log(`ErrorBoundary: Deleted IndexedDB "${db.name}".`);
						}
					});
				})
				.catch((e) => {
					console.error("ErrorBoundary: Failed to list IndexedDB databases.", e);
				});
		} catch (e) {
			console.error("ErrorBoundary: Error accessing IndexedDB databases API.", e);
		}
	}

	// Clear sessionStorage
	try {
		if (typeof window !== "undefined" && window.sessionStorage) {
			sessionStorage.clear();
			console.log("ErrorBoundary: Cleared sessionStorage.");
		}
	} catch (e) {
		console.error("ErrorBoundary: Failed to clear sessionStorage.", e);
	}

	sendEvent({
		category: "error",
		action: error.name,
		label: error.message,
		nonInteraction: true,
		componentStack: errorInfo?.componentStack?.replace(/\n/g, " ").substring(0, 100) || "N/A",
		stackTrace: error.stack?.replace(/\n/g, " ").substring(0, 500) || "N/A",
		storageCleared: localStorageCleared ? "yes" : "no",
	});
};
