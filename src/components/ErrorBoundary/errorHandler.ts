/**
 * Global error handler and state recovery module.
 *
 * @remarks
 * This module provides the `handleError` utility, which implements a comprehensive
 * cleanup and reporting strategy for fatal application crashes.
 *
 * @see {@link handleError}
 * @see {@link ./errorHandler.test.ts Unit Tests}
 *
 * @category Utilities
 */

import { ErrorInfo } from "react";
import * as Sentry from "@sentry/react";

import { sendEvent } from "../../utils/analytics";
import { safeClear } from "../../utils/storage";

/**
 * Executes a nuclear recovery strategy after an uncaught application error.
 *
 * @remarks
 * This function performs the following actions to ensure a clean state for recovery:
 * 1. Logs the error to the console and Sentry.
 * 2. Purges all `localStorage` data via {@link safeClear}.
 * 3. Unregisters all active Service Workers.
 * 4. Deletes all browser caches.
 * 5. Attempts to delete all IndexedDB databases.
 * 6. Clears `sessionStorage`.
 * 7. Reports the event to Google Analytics via {@link sendEvent} with debug metadata.
 *
 * @param {Error} error - The caught exception. **Must not be null.**
 * @param {ErrorInfo} [errorInfo] - The React component stack metadata.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link safeClear}
 * @see {@link sendEvent}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * handleError(new Error("Fatal Crash"), { componentStack: "..." });
 * // returns void (side-effects only)
 * ```
 */
export const handleError = (error: Error, errorInfo?: ErrorInfo) => {
	console.error("Uncaught error:", error, errorInfo);

	Sentry.captureException(error, {
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
