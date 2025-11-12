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
			import("vite-plugin-splash-screen/runtime").then(({ hideSplashScreen }) => {
				hideSplashScreen();
			});
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
							console.log("New content available, dispatching event.");
							window.dispatchEvent(
								new CustomEvent("new-version-available", {
									detail: updateServiceWorker,
								})
							);
						},
						onRegistered(registration) {
							console.log("Service Worker registered:", registration);
							// Removed aggressive update check for debugging
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
