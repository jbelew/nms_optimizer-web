import { ErrorInfo } from "react";

import { sendEvent } from "../../utils/analytics";

/**
 * Handles errors by clearing local storage, unregistering service workers,
 * and sending analytics events.
 *
 * @param error - The error that was thrown.
 * @param errorInfo - Optional component stack information.
 */
export const handleError = (error: Error, errorInfo?: ErrorInfo) => {
	console.error("Uncaught error:", error, errorInfo);

	// Attempt to clear localStorage, but don't let storage errors prevent recovery
	let localStorageCleared = false;

	try {
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.clear();
			localStorageCleared = true;
			console.log("ErrorBoundary: Cleared localStorage.");
		}
	} catch (e) {
		console.error(
			"ErrorBoundary: Failed to clear localStorage. May be in private browsing mode or storage full.",
			e instanceof Error ? e.message : String(e)
		);
	}

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
	if ("indexedDB" in window) {
		indexedDB.databases().then((databases) => {
			databases.forEach((db) => {
				if (db.name) {
					indexedDB.deleteDatabase(db.name);
					console.log(`ErrorBoundary: Deleted IndexedDB "${db.name}".`);
				}
			});
		});
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
