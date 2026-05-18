/**
 * @file High-level application bootstrap and root rendering logic.
 */
import "./assets/css/radix-colors/radix-colors.css";
import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";
// Main App CSS
import "./index.css";
// i18n
import "./i18n/i18n"; // Initialize i18next

import React, { StrictMode, useEffect } from "react";
import { Provider as ToastProviderRadix, Viewport as ToastViewport } from "@radix-ui/react-toast";
import { Theme } from "@radix-ui/themes";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { UI_TIMING } from "@/constants";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { TooltipManager } from "./components/TooltipManager/TooltipManager";
import { TooltipProvider } from "./context/TooltipContext";
import { ToastProvider } from "./hooks/useToast/useToast";
import { routes } from "./routes";
import { useThemeStore } from "./store/app/themeStore";
import { initializeAnalytics, initializeAnalyticsClient } from "./utils/analytics/tracking";
import { preloadInitialState } from "./utils/api/apiPreload";
import { runWhenIdle } from "./utils/system/idle";
import {
	captureException,
	createAppRouter,
	initializeSentry,
	Logger,
} from "./utils/system/monitoring";

/**
 * Root component that manages global theme and provider orchestration.
 *
 * @returns {JSX.Element} The rendered root component with all providers.
 *
 * @see {@link useThemeStore}
 * @see {@link ErrorBoundary}
 * @see {@link TooltipProvider}
 * @see {@link ToastProvider}
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <Root />
 * ```
 */
export const Root = () => {
	const { appearance } = useThemeStore();
	const router = React.useMemo(() => createAppRouter(routes), []);

	useEffect(() => {
		// Sync theme classes to document root for global CSS visibility (backgrounds, etc)
		document.documentElement.classList.remove("light", "dark", "light-theme", "dark-theme");
		document.documentElement.classList.add(
			appearance,
			`${appearance}-theme`,
			"background-visible"
		);
		document.documentElement.style.colorScheme = appearance;
	}, [appearance]);

	return (
		<StrictMode>
			<ErrorBoundary>
				<Theme
					accentColor="cyan"
					appearance={appearance}
					grayColor="slate"
					panelBackground="solid"
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
};

/**
 * Bootstraps the application and handles high-level initialization.
 *
 * @remarks
 * Performs early initialization of:
 * - Sentry error tracking
 * - Global error event listeners
 * - Analytics and PWA service worker (deferred)
 * - Root React mounting
 *
 * @returns {Promise<void>} Side-effects only.
 *
 * @see {@link initializeSentry}
 * @see {@link initializeAnalytics}
 * @see {@link preloadInitialState}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * void bootstrap();
 * // returns void (initializes app)
 * ```
 */
const bootstrap = async () => {
	// Initialize Sentry as early as possible if enabled.
	// We don't await this to keep it out of the critical path and avoid blocking the mount.
	if (import.meta.env.VITE_SENTRY_ENABLED === "true") {
		void initializeSentry();
	}

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
				Logger.warn("Caught and suppressed module import failure (Safari flake):", {
					errorMessage,
				});

				return true;
			}

			if (errorMessage.includes("ResizeObserver loop")) {
				event.preventDefault();

				// This is a benign error that occurs when a resize observer triggers another layout shift in the same frame.
				return true;
			}

			Logger.error("Uncaught initialization error:", event.error || event.message);
		});

		window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
			Logger.error("Unhandled promise rejection:", event.reason);
		});

		window.addEventListener(
			"app-ready",
			() => {
				(window as typeof window & { __APP_READY__?: boolean }).__APP_READY__ = true;

				try {
					sessionStorage.removeItem("__preload_recovery__");
				} catch (_e) {
					// ignore
				}

				const initDeferredServices = async () => {
					try {
						preloadInitialState();
						initializeAnalyticsClient();
						await initializeAnalytics();

						const { setupServiceWorkerRegistration } =
							await import("./utils/system/setupServiceWorker");
						setupServiceWorkerRegistration();
					} catch (error) {
						Logger.error("Failed to initialize deferred services:", error);
						captureException(error, {
							level: "error",
							tags: { area: "initialization" },
						});
					}
				};

				runWhenIdle(
					() => {
						void initDeferredServices();
					},
					{ timeout: UI_TIMING.IDLE_TIMEOUT_MS }
				);
			},
			{ once: true }
		);
	}

	const staticContent = document.querySelector("main.visually-hidden");

	if (staticContent) {
		staticContent.setAttribute("aria-hidden", "true");
	}

	// Cleanup pre-rendered SSG content
	const prerendered = document.querySelector('[data-prerendered-markdown="true"]');

	if (prerendered) {
		prerendered.remove();
	}

	createRoot(document.getElementById("root")!).render(<Root />);
};

void bootstrap();
