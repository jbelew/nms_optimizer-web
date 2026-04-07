/**
 * @file High-level application bootstrap and root rendering logic.
 */

// Base theme tokens - optimized color imports without P3 definitions
// Single concatenated file to reduce HTTP requests (14 colors in one file)
import "./assets/css/radix-colors/radix-colors.css";
import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";
// Main App CSS
import "./index.css";
import "./components/Toast/Toast.scss";
// i18n
import "./i18n/i18n"; // Initialize i18next

import { StrictMode } from "react";
import { Provider as ToastProviderRadix, Viewport as ToastViewport } from "@radix-ui/react-toast";
import { Theme } from "@radix-ui/themes";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { TooltipManager } from "./components/TooltipManager/TooltipManager";
import { TooltipProvider } from "./context/TooltipContext";
import { ToastProvider } from "./hooks/useToast/useToast";
import { routes } from "./routes";
import { initializeAnalytics } from "./utils/analytics";
import { initializeAnalyticsClient } from "./utils/analyticsClient";
import { initializeSentry } from "./utils/sentry";
import { hideSplashScreenAndShowBackground } from "./utils/splashScreen";

// Initialize analytics, Sentry and PWA after render is complete
if (typeof window !== "undefined") {
	// Add global handler for Vite chunk load failures (e.g. after deployments)
	window.addEventListener("vite:preloadError", () => {
		window.location.reload();
	});

	// Add global error handler to suppress SecurityErrors from Cloudflare beacon script
	// and "Importing a module script failed" errors on iOS Safari
	window.addEventListener("error", (event: ErrorEvent) => {
		const errorMessage = event.error?.message || event.message || "";
		const errorName = event.error?.name || "";

		// Suppress SecurityError from Cloudflare or similar third-party scripts
		if (errorName === "SecurityError" && errorMessage.includes("cross-origin")) {
			event.preventDefault();

			return true;
		}

		// Suppress and handle "Importing a module script failed" which is a known iOS Safari flake
		if (errorMessage.includes("Importing a module script failed")) {
			// Prevent the error from being reported to Sentry as an unhandled exception
			event.preventDefault();

			// Log locally for debugging but don't crash the app
			console.warn(
				"Caught and suppressed module import failure (Safari flake):",
				errorMessage
			);

			return true;
		}

		// Broaden handling for other minified or uncaught errors during initialization
		console.error("Uncaught initialization error:", event.error || event.message);
	});

	// Handle unhandled promise rejections which are common in async initialization
	window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
		// Suppress known non-critical rejections if needed
		console.error("Unhandled promise rejection:", event.reason);
	});

	// Failsafe: hide splash screen after 8 seconds if still showing
	setTimeout(() => {
		const splash = document.querySelector(".vpss");

		if (splash) {
			hideSplashScreenAndShowBackground();
		}
	}, 8000);

	// Listen for the custom "app-ready" event dispatched when the splash screen is hidden
	// This defers non-critical initializations until the critical rendering path is complete
	window.addEventListener(
		"app-ready",
		() => {
			const initDeferredServices = async () => {
				try {
					await initializeSentry();
					initializeAnalyticsClient();
					await initializeAnalytics();
				} catch (error) {
					console.error("Failed to initialize deferred services:", error);
					import("@sentry/react")
						.then((Sentry) => {
							Sentry.captureException(error, {
								tags: { area: "initialization" },
								level: "error",
							});
						})
						.catch(console.error);
				}
			};

			if ("requestIdleCallback" in window) {
				(
					window as typeof window & {
						requestIdleCallback: (
							cb: () => void,
							options?: { timeout: number }
						) => void;
					}
				).requestIdleCallback(
					() => {
						void initDeferredServices();
					},
					{ timeout: 2000 }
				);
			} else {
				setTimeout(() => {
					void initDeferredServices();
				}, 100);
			}
		},
		{ once: true }
	);

	// Dynamically import and initialize service worker to avoid bundling it with i18n
	(async () => {
		try {
			const { setupServiceWorkerRegistration } = await import("./utils/setupServiceWorker");
			setupServiceWorkerRegistration();
		} catch (error) {
			console.error("Failed to load service worker registration module:", error);
		}
	})();
}

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ErrorBoundary>
			<Theme
				appearance="dark"
				panelBackground="translucent"
				accentColor="cyan"
				grayColor="slate"
				scaling="100%"
			>
				<TooltipProvider>
					<TooltipManager />
					<ToastProviderRadix swipeDirection="right">
						<ToastProvider>
							<RouterProvider router={router} />
						</ToastProvider>
						<ToastViewport className="ToastViewport" />
					</ToastProviderRadix>
				</TooltipProvider>
			</Theme>
		</ErrorBoundary>
	</StrictMode>
);

// Hide the static content from screen readers after the app has been rendered.
const staticContent = document.querySelector("main.visually-hidden");

if (staticContent) {
	staticContent.setAttribute("aria-hidden", "true");
}
