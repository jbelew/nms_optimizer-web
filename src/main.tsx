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
import { captureException, wrapCreateBrowserRouterV6 } from "@sentry/react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { TooltipManager } from "./components/TooltipManager/TooltipManager";
import { TooltipProvider } from "./context/TooltipContext";
import { ToastProvider } from "./hooks/useToast/useToast";
import { routes } from "./routes";
import { initializeAnalytics } from "./utils/analytics";
import { initializeAnalyticsClient } from "./utils/analyticsClient";
import { retryImport } from "./utils/dynamicImport";
import { initializeSentry } from "./utils/sentry";
import { hideSplashScreenAndShowBackground } from "./utils/splashScreen";

// Initialize analytics, Sentry and PWA after render is complete
if (typeof window !== "undefined") {
	// Initialize Sentry after the initial render to reduce TBT
	// We use requestIdleCallback with a timeout to ensure it runs even if the browser is busy
	if ("requestIdleCallback" in window) {
		// Since we already checked 'requestIdleCallback' in window at line 38, we cast to tell TS it is safe
		(
			window as typeof window & {
				requestIdleCallback: (cb: () => void, options?: { timeout: number }) => void;
			}
		).requestIdleCallback(() => initializeSentry(), { timeout: 2000 });
	} else {
		setTimeout(() => initializeSentry(), 1);
	}

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

	// Use queueMicrotask for faster execution than setTimeout
	// This ensures it runs after the current task but before the next paint
	queueMicrotask(async () => {
		try {
			// Initialize server-side client to be ready for fallbacks
			initializeAnalyticsClient();

			// Initialize client-side ReactGA as soon as possible.
			// The async initializeAnalytics already handles ad-blocker detection
			// and will fallback to the server-side client if blocked.
			await initializeAnalytics();
		} catch (error) {
			// Catch any errors during the async initialization phase
			// to prevented unhandled rejections or crashes
			console.error("Failed to recover from initialization error:", error);

			// Log to Sentry if available
			captureException(error, {
				tags: { area: "initialization" },
				level: "error",
			});
		}
	});

	// Dynamically import and initialize service worker to avoid bundling it with i18n
	// We use retryImport to harden against iOS Safari module loading failures
	// which often occur during concurrent network activity.
	(async () => {
		try {
			const { setupServiceWorkerRegistration } = await retryImport(
				() => import("./utils/setupServiceWorker"),
				{ retries: 5, delay: 1000 } // Be more aggressive with retries for this critical module
			);
			setupServiceWorkerRegistration();
		} catch (error) {
			console.error(
				"Failed to load service worker registration module after retries:",
				error
			);
		}
	})();
}

const sentryCreateBrowserRouter = wrapCreateBrowserRouterV6(createBrowserRouter);
const router = sentryCreateBrowserRouter(routes);

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
