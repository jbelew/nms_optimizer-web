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
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundry/ErrorBoundry";
import { DialogProvider } from "./context/DialogContext";
import { initializeAnalytics } from "./utils/analytics";

// Initialize analytics
initializeAnalytics();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<ErrorBoundary>
				<Theme
					appearance="dark"
					panelBackground="solid"
					accentColor="cyan"
					grayColor="sage"
					scaling="100%"
				>
					<Toast.Provider>
						<Toast.Provider swipeDirection="right">
							<DialogProvider>
								<App />
							</DialogProvider>
							<Toast.Viewport className="ToastViewport" />
						</Toast.Provider>{" "}
						<Toast.Viewport />
					</Toast.Provider>
				</Theme>
			</ErrorBoundary>
		</BrowserRouter>
	</StrictMode>
);

// Hide the static content from screen readers after the app has been rendered.
const staticContent = document.querySelector("main.visually-hidden");
if (staticContent) {
	staticContent.setAttribute("aria-hidden", "true");
}

// Conditionally register the service worker for non-bot user agents
if (
	"serviceWorker" in navigator &&
	!/bot|googlebot|crawler|spider|crawling/i.test(navigator.userAgent)
) {
	import("virtual:pwa-register")
		.then(({ registerSW }) => {
			registerSW({ immediate: true });
		})
		.catch((e) => {
			console.error("Failed to register service worker:", e);
		});
}
