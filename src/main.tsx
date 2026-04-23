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
// i18n
import "./i18n/i18n"; // Initialize i18next

import { StrictMode } from "react";
import { Provider as ToastProviderRadix, Viewport as ToastViewport } from "@radix-ui/react-toast";
import { Theme } from "@radix-ui/themes";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { TooltipManager } from "./components/TooltipManager/TooltipManager";
import { TooltipProvider } from "./context/tooltipContext";
import { ToastProvider } from "./hooks/useToast/useToast";
import { routes } from "./routes";
import { initializeAnalytics, initializeAnalyticsClient } from "./utils/analytics/tracking";
import { preloadInitialState } from "./utils/api/apiPreload";
import { captureException, createAppRouter, initializeSentry } from "./utils/system/monitoring";

/**
 * Bootstraps the application and handles high-level initialization.
 *
 * @returns {Promise<void>} Side-effects only.
 *
 * @example
 * ```ts
 * void bootstrap();
 * // returns void (initializes app)
 * ```
 */
const bootstrap = async () => {
	// Initialize Sentry as early as possible
	// This uses dynamic imports internally and is only bundled if VITE_SENTRY_ENABLED is true
	await initializeSentry();

	// Initialize analytics and PWA after render is complete
	if (typeof window !== "undefined") {
		// Add global error handler to suppress SecurityErrors from cross-origin third-party scripts
		window.addEventListener("error", (event: ErrorEvent) => {
			const errorMessage = event.error?.message || event.message || "";
			const errorName = event.error?.name || "";

			if (errorName === "SecurityError" && errorMessage.includes("cross-origin")) {
				event.preventDefault();

				return true;
			}

			if (errorMessage.includes("Importing a module script failed")) {
				event.preventDefault();
				console.warn(
					"Caught and suppressed module import failure (Safari flake):",
					errorMessage
				);

				return true;
			}

			console.error("Uncaught initialization error:", event.error || event.message);
		});

		window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
			console.error("Unhandled promise rejection:", event.reason);
		});

		window.addEventListener(
			"app-ready",
			() => {
				(window as typeof window & { __APP_READY__?: boolean }).__APP_READY__ = true;
				window.name = window.name.replace("__preload_recovery__", "");

				const initDeferredServices = async () => {
					try {
						preloadInitialState();
						initializeAnalyticsClient();
						await initializeAnalytics();

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

	const router = createAppRouter(routes);

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

	const staticContent = document.querySelector("main.visually-hidden");

	if (staticContent) {
		staticContent.setAttribute("aria-hidden", "true");
	}
};

void bootstrap();
