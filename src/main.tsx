/**
 * @file Main application entry point
 * @description Sets up the React application with routing, theming, PWA service worker,
 * analytics, and i18n. Handles DOM rendering and splash screen management.
 */

// Base theme tokens - optimized color imports without P3 definitions
// Single concatenated file to reduce HTTP requests (14 colors in one file)
import "./assets/css/radix-colors/radix-colors.css";
// import "@radix-ui/themes/tokens/colors/cyan.css";
// import "@radix-ui/themes/tokens/colors/sage.css";
// import "@radix-ui/themes/tokens/colors/purple.css";
// import "@radix-ui/themes/tokens/colors/amber.css";
// import "@radix-ui/themes/tokens/colors/blue.css";
// import "@radix-ui/themes/tokens/colors/crimson.css";
// import "@radix-ui/themes/tokens/colors/green.css";
// import "@radix-ui/themes/tokens/colors/iris.css";
// import "@radix-ui/themes/tokens/colors/jade.css";
// import "@radix-ui/themes/tokens/colors/orange.css";
// import "@radix-ui/themes/tokens/colors/red.css";
// import "@radix-ui/themes/tokens/colors/sky.css";
// import "@radix-ui/themes/tokens/colors/teal.css";
// import "@radix-ui/themes/tokens/colors/yellow.css";

// import "@radix-ui/themes/styles.css";
// import "@radix-ui/themes/tokens/base.css";
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
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "./hooks/useToast/useToast";
import { routes } from "./routes";
import { initializeAnalytics } from "./utils/analytics";
import { initializeAnalyticsClient } from "./utils/analyticsClient";
import { initializeSentry } from "./utils/sentry";
import { hideSplashScreenAndShowBackground } from "./utils/splashScreen";

// Initialize analytics, Sentry and PWA after render is complete
if (typeof window !== "undefined") {
	// Initialize Sentry early to catch errors during initialization
	initializeSentry();

	// Add global error handler to suppress SecurityErrors from Cloudflare beacon script
	// when it tries to access cross-origin iframes (especially on iOS Safari)
	window.addEventListener("error", (event: ErrorEvent) => {
		// Check if this is a SecurityError from Cloudflare or similar third-party scripts
		// trying to access cross-origin iframes
		if (
			event.error &&
			event.error.name === "SecurityError" &&
			event.error.message?.includes("cross-origin")
		) {
			// Prevent the error from being reported to Sentry
			event.preventDefault();

			// Prevent default error handling
			return true;
		}

		// Broaden handling for other minified or uncaught errors during initialization
		// Specifically on iOS where some failures might bypass React's error boundary
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

			// Dynamically import and initialize service worker to avoid bundling it with i18n
			const { setupServiceWorkerRegistration } = await import("./utils/setupServiceWorker");
			setupServiceWorkerRegistration();
		} catch (error) {
			// Catch any errors during the async initialization phase
			// to prevented unhandled rejections or crashes
			console.error("Failed to recover from initialization error:", error);

			// Log to Sentry if available
			Sentry.captureException(error, {
				tags: { area: "initialization" },
				level: "error",
			});
		}
	});
}

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV6(createBrowserRouter);
const router = sentryCreateBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ErrorBoundary>
			<Theme
				appearance="dark"
				panelBackground="solid"
				accentColor="cyan"
				grayColor="slate"
				scaling="100%"
			>
				<Toast.Provider swipeDirection="right">
					<ToastProvider>
						<RouterProvider router={router} />
					</ToastProvider>
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
