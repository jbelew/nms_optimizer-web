// Base theme tokens
import "@radix-ui/themes/tokens/base.css";
import "@radix-ui/themes/tokens/colors/cyan.css";
import "@radix-ui/themes/tokens/colors/sage.css";
import "@radix-ui/themes/tokens/colors/purple.css";
import "@radix-ui/themes/tokens/colors/amber.css";
import "@radix-ui/themes/tokens/colors/blue.css";
import "@radix-ui/themes/tokens/colors/crimson.css";
import "@radix-ui/themes/tokens/colors/green.css";
import "@radix-ui/themes/tokens/colors/iris.css";
import "@radix-ui/themes/tokens/colors/jade.css";
import "@radix-ui/themes/tokens/colors/orange.css";
import "@radix-ui/themes/tokens/colors/red.css";
import "@radix-ui/themes/tokens/colors/sky.css";
import "@radix-ui/themes/tokens/colors/teal.css";
import "@radix-ui/themes/tokens/colors/yellow.css";
import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";
// Main App CSS
import "./index.css";
import "./components/Toast/Toast.scss";
// i18n
import "./i18n/i18n"; // Initialize i18next

import { StrictMode } from "react";
import * as Toast from "@radix-ui/react-toast";
import { Theme } from "@radix-ui/themes";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundry/ErrorBoundry";
import { routes } from "./routes";
import { initializeAnalytics } from "./utils/analytics";
import { fetchWithTimeout } from "./utils/fetchWithTimeout";
import { hideSplashScreenAndShowBackground } from "./utils/splashScreen";

// Initialize analytics after app loads (don't block render)
if (typeof window !== "undefined") {
	if ("requestIdleCallback" in window) {
		requestIdleCallback(() => initializeAnalytics(), { timeout: 2000 });
	} else {
		setTimeout(() => initializeAnalytics(), 0);
	}

	// Failsafe: hide splash screen after 8 seconds if still showing
	setTimeout(() => {
		const splash = document.querySelector(".vpss");
		if (splash) {
			hideSplashScreenAndShowBackground();
		}
	}, 8000);

	// Conditionally register the service worker for non-bot user agents
	// Delayed registration to avoid blocking initial render
	setTimeout(() => {
		if (
			"serviceWorker" in navigator &&
			!/bot|googlebot|crawler|spider|crawling/i.test(navigator.userAgent)
		) {
			import("virtual:pwa-register")
				.then(({ registerSW }) => {
					const updateServiceWorker = registerSW({
						// Correctly capture updateServiceWorker
						// immediate: true, // Removed to allow natural waiting state with 'prompt' registerType
						onOfflineReady() {
							console.log("App is ready to work offline");
						},
						onNeedRefresh() {
							// Verify that the service worker has actually changed before showing prompt
							verifyServiceWorkerUpdate(updateServiceWorker);
						},
						onRegistered(registration) {
							console.log("Service Worker registered:", registration);
							// Store initial service worker version for comparison
							if (registration) {
								storeServiceWorkerVersion(registration);
							}
						},
						onRegisterError(error) {
							console.error("Service Worker registration failed:", error);
						},
					});
				})
				.catch((e) => {
					console.error("Failed to import PWA register:", e);
				});
		}
	}, 5000); // Delay registration by 5 seconds

	/**
	 * Verifies that the service worker has actually changed by comparing
	 * with the stored version. Only dispatches the update event if a real change is detected.
	 */
	async function verifyServiceWorkerUpdate(
		updateServiceWorker: (reloadPage?: boolean) => Promise<void>
	) {
		try {
			const registration = await navigator.serviceWorker.getRegistration();
			if (!registration) {
				console.log("No active service worker registration found");
				return;
			}

			// Get the new service worker script URL
			const newSWUrl = registration.installing?.scriptURL || registration.waiting?.scriptURL;
			if (!newSWUrl) {
				console.log("Could not determine new service worker URL");
				return;
			}

			// Compare with stored version
			const storedVersion = localStorage.getItem("sw_version_hash");
			const currentVersionHash = await generateScriptHash(newSWUrl);

			if (storedVersion === currentVersionHash) {
				console.log("Service worker content is identical, skipping update prompt");
				return;
			}

			console.log("Service worker has changed, dispatching update event.");
			console.log(`Previous: ${storedVersion}, Current: ${currentVersionHash}`);
			window.dispatchEvent(
				new CustomEvent("new-version-available", {
					detail: updateServiceWorker,
				})
			);
		} catch (error) {
			console.error("Error verifying service worker update:", error);
			// If verification fails, err on the side of caution and show the prompt
			window.dispatchEvent(
				new CustomEvent("new-version-available", {
					detail: updateServiceWorker,
				})
			);
		}
	}

	/**
	 * Stores the current service worker version hash for later comparison
	 */
	function storeServiceWorkerVersion(registration: ServiceWorkerRegistration) {
		try {
			const swUrl =
				registration.active?.scriptURL ||
				registration.installing?.scriptURL ||
				registration.waiting?.scriptURL;
			if (swUrl) {
				generateScriptHash(swUrl).then((hash) => {
					localStorage.setItem("sw_version_hash", hash);
					console.log("Stored service worker version hash:", hash);
				});
			}
		} catch (error) {
			console.error("Error storing service worker version:", error);
		}
	}

	/**
	 * Generates a hash of the service worker script content.
	 * Uses a simple checksum as a lightweight alternative to crypto hashing.
	 */
	async function generateScriptHash(scriptUrl: string): Promise<string> {
		try {
			const response = await fetchWithTimeout(scriptUrl, { cache: "no-store" }, 10000);
			if (!response.ok) {
				console.warn(`Failed to fetch service worker script: ${response.status}`);
				return "";
			}
			const text = await response.text();
			// Generate a simple hash from the script content
			return simpleHash(text);
		} catch (error) {
			console.error("Error fetching service worker script:", error);
			return "";
		}
	}

	/**
	 * Simple hash function for comparing script content.
	 * Not cryptographically secure, but sufficient for detecting real changes.
	 */
	function simpleHash(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash.toString(36);
	}
}

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ErrorBoundary>
			<Theme
				appearance="dark"
				panelBackground="solid"
				accentColor="cyan"
				grayColor="sage"
				scaling="100%"
			>
				<Toast.Provider swipeDirection="right">
					<RouterProvider router={router} />
					<Toast.Viewport className="ToastViewport" />
				</Toast.Provider>
			</Theme>
		</ErrorBoundary>
	</StrictMode>
);

// Hide the static content from screen readers after the app has been rendered.
const staticContent = document.querySelector("main.visually-hidden");
if (staticContent) {
	staticContent.setAttribute("aria-hidden", "true");
}
