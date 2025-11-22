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
import { setupServiceWorkerRegistration } from "./utils/setupServiceWorker"; // NEW IMPORT
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
			window.addEventListener("load", () => setTimeout(initGA, 1000));
		}

		// Call the new function for service worker registration
		setupServiceWorkerRegistration();
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
