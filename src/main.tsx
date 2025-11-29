/**
 * @file Main application entry point
 * @description Sets up the React application with routing, theming, PWA service worker,
 * analytics, and i18n. Handles DOM rendering and splash screen management.
 */

// Base theme tokens - optimized color imports without P3 definitions
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

import "@radix-ui/themes/styles.css";
import "@radix-ui/themes/tokens/base.css";
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

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "./hooks/useToast/useToast";
import { routes } from "./routes";
import { initializeAnalytics } from "./utils/analytics";
import { hideSplashScreenAndShowBackground } from "./utils/splashScreen";

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
			const handleLoad = () => {
				setTimeout(initGA, 1000);
				window.removeEventListener("load", handleLoad); // Clean up listener
			};
			window.addEventListener("load", handleLoad);
		}

		// Dynamically import and initialize service worker to avoid bundling it with i18n
		import("./utils/setupServiceWorker").then(({ setupServiceWorkerRegistration }) => {
			setupServiceWorkerRegistration();
		});
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
