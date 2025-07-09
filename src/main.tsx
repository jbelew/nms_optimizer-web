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
import { StrictMode, Suspense } from "react"; // Added Suspense
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundry/ErrorBoundry";
import MessageSpinner from "./components/MessageSpinner/MessageSpinner";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<ErrorBoundary>
				<Theme appearance="dark" panelBackground="translucent" accentColor="cyan" grayColor="sage">
					<Suspense
						fallback={
							<main className="flex flex-col items-center justify-center lg:min-h-screen">
								<MessageSpinner
									isVisible={true}
									isInset={true}
									initialMessage="Activating Uplink..."
								/>
							</main>
						}
					>
						<App />
					</Suspense>
				</Theme>
			</ErrorBoundary>
		</BrowserRouter>
	</StrictMode>
);
