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
import { captureException, wrapCreateBrowserRouterV7 } from "@sentry/react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { TooltipManager } from "./components/TooltipManager/TooltipManager";
import { TooltipProvider } from "./context/tooltipContext";
import { ToastProvider } from "./hooks/useToast/useToast";
import { routes } from "./routes";
import { initializeAnalytics, initializeAnalyticsClient } from "./utils/analytics/tracking";
import { preloadInitialState } from "./utils/api/apiPreload";
import { initializeSentry } from "./utils/system/monitoring";

// Initialize Sentry synchronously as early as possible
// This is required for React Router tracing and early error catching
initializeSentry();

// Initialize analytics and PWA after render is complete
if (typeof window !== "undefined") {
	// Listen for the custom "app-ready" event dispatched when the splash screen is hidden
	// This defers non-critical initializations until the critical rendering path is complete
	window.addEventListener(
		"app-ready",
		() => {
			// Reset reload state on successful boot
			sessionStorage.removeItem("init_reload_count");
			const url = new URL(window.location.href);

			if (url.searchParams.has("init_retry")) {
				url.searchParams.delete("init_retry");
				history.replaceState(null, "", url.toString());
			}

			const initDeferredServices = async () => {
				try {
					// Eagerly preload required API calls to avoid render waterfalls,
					// but only after initial UI is interactive.
					preloadInitialState();

					initializeAnalyticsClient();
					await initializeAnalytics();

					// Dynamically import and initialize service worker
					const { setupServiceWorkerRegistration } =
						await import("./utils/system/setupServiceWorker");
					setupServiceWorkerRegistration();
				} catch (error) {
					console.error("Failed to initialize deferred services:", error);
					captureException(error, {
						tags: { area: "initialization" },
						level: "error",
					});
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
}

const sentryCreateBrowserRouter = wrapCreateBrowserRouterV7(createBrowserRouter);
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
