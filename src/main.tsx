// Base theme tokens
import "@radix-ui/themes/tokens/base.css";

import "@radix-ui/themes/tokens/colors/cyan.css";
import "@radix-ui/themes/tokens/colors/sage.css";
import "@radix-ui/themes/tokens/colors/purple.css";

import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";

// Main App CSS
import "./index.css";

// i18n
import "./i18n/i18n"; // Initialize i18next

import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react"; // Added Suspense
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundry/ErrorBoundry";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<ErrorBoundary>
				<Theme appearance="dark" panelBackground="translucent" accentColor="cyan" grayColor="sage">
					<App />
				</Theme>
			</ErrorBoundary>
		</BrowserRouter>
	</StrictMode>
);
