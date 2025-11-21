// Base theme tokens - optimized color imports without P3 definitions
import "@radix-ui/themes/tokens/base.css";
import "./assets/css/radix-colors/cyan.css";
import "./assets/css/radix-colors/sage.css";
import "./assets/css/radix-colors/purple.css";
import "./assets/css/radix-colors/amber.css";
import "./assets/css/radix-colors/blue.css";
import "./assets/css/radix-colors/crimson.css";
import "./assets/css/radix-colors/green.css";
import "./assets/css/radix-colors/iris.css";
import "./assets/css/radix-colors/jade.css";
import "./assets/css/radix-colors/orange.css";
import "./assets/css/radix-colors/red.css";
import "./assets/css/radix-colors/sky.css";
import "./assets/css/radix-colors/teal.css";
import "./assets/css/radix-colors/yellow.css";
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
		const response = await fetchWithTimeout(scriptUrl, { cache: "no-cache" }, 10000);
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

// Initialize analytics and PWA after render is complete
if (typeof window !== "undefined") {
	// Failsafe: hide splash screen after 8 seconds if still showing
	setTimeout(() => {
		const splash = document.querySelector(".vpss");
		if (splash) {
			hideSplashScreenAndShowBackground();
		}
	}, 8000);

	// Use queueMicrotask for faster execution than setTimeout
	// This ensures it runs after the current task but before the next paint
	queueMicrotask(() => {
		// Delay analytics initialization until after window load event
		// This ensures it doesn't compete with critical resources affecting LCP
		const initGA = () => {
			if ("requestIdleCallback" in window) {
				requestIdleCallback(() => initializeAnalytics(), { timeout: 10000 });
			} else {
				setTimeout(() => initializeAnalytics(), 2000);
			}
		};

		if (document.readyState === "complete") {
			// Page already loaded, delay slightly before initializing
			setTimeout(initGA, 1000);
		} else {
			// Wait for page load event, then delay before initializing
			window.addEventListener("load", () => setTimeout(initGA, 1000));
		}

		// Detect iOS
		const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

		// Conditionally register the service worker for non-bot user agents
		if (
			"serviceWorker" in navigator &&
			!/bot|googlebot|crawler|spider|crawling/i.test(navigator.userAgent)
		) {
			const registerWorker = () => {
				setTimeout(
					() => {
						// Add a timeout for SW registration to prevent lockups
						const swRegistrationTimeout = setTimeout(() => {
							console.warn("Service worker registration timeout (10s), skipping");
						}, 10000);

						import("virtual:pwa-register")
							.then(({ registerSW }) => {
								const updateServiceWorker = registerSW({
									onOfflineReady() {
										clearTimeout(swRegistrationTimeout);
										console.log("App is ready to work offline");
									},
									onNeedRefresh() {
										clearTimeout(swRegistrationTimeout);
										verifyServiceWorkerUpdate(updateServiceWorker);
									},
									onRegistered(registration) {
										clearTimeout(swRegistrationTimeout);
										console.log("Service Worker registered:", registration);
										if (registration) {
											storeServiceWorkerVersion(registration);
										}
									},
									onRegisterError(error) {
										clearTimeout(swRegistrationTimeout);
										console.error("Service Worker registration failed:", error);
									},
								});
							})
							.catch((e) => {
								clearTimeout(swRegistrationTimeout);
								console.error("Failed to import PWA register:", e);
							});
					},
					isIOS ? 3000 : 2000
				); // Longer delay for iOS
			};

			if (document.readyState === "complete") {
				// Page already loaded, register worker
				registerWorker();
			} else {
				// Wait for page load event before registering
				window.addEventListener("load", registerWorker);
			}
		}
	});
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
