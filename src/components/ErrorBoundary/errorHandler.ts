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

	try {
		localStorage.clear();
		console.log("ErrorBoundary: Cleared localStorage.");
	} catch (e) {
		console.error("ErrorBoundary: Failed to clear localStorage.", e);
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

	sendEvent({
		category: "error",
		action: error.name,
		label: error.message,
		nonInteraction: true,
		componentStack: errorInfo?.componentStack?.replace(/\n/g, " ").substring(0, 100) || "N/A",
		stackTrace: error.stack?.replace(/\n/g, " ").substring(0, 500) || "N/A",
	});
};
